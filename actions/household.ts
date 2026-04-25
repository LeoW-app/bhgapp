'use server'

import { createClient } from '@/lib/supabase/server'

const DEFAULT_ITEMS = [
  { emoji: '💧', title: 'Water bottle',           critical: false, position: 0 },
  { emoji: '🥡', title: 'Lunchbox',                critical: true,  position: 1 },
  { emoji: '👟', title: 'Indoor shoes',            critical: false, position: 2 },
  { emoji: '👕', title: 'Spare clothes',           critical: false, position: 3 },
  { emoji: '🧸', title: 'Comfort toy',             critical: false, position: 4 },
  { emoji: '📓', title: 'Communication notebook',  critical: false, position: 5 },
]

type ActionResult = { error: string } | { success: true }

export async function createHousehold(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const displayName      = formData.get('display_name') as string
  const avatarColor      = formData.get('avatar_color') as string
  const childName        = formData.get('child_name') as string
  const kindergartenName = formData.get('kindergarten_name') as string

  const { data: household, error: hErr } = await supabase
    .from('households')
    .insert({ name: `${displayName}'s Family`, child_name: childName, kindergarten_name: kindergartenName })
    .select('id')
    .single()

  if (hErr || !household) return { error: hErr?.message ?? 'Could not create household' }

  const { error: mErr } = await supabase.from('memberships').insert({
    household_id: household.id,
    user_id: user.id,
    role: 'parent',
    display_name: displayName,
    avatar_color: avatarColor,
  })

  if (mErr) return { error: mErr.message }

  const { data: checklist } = await supabase
    .from('checklists')
    .insert({ household_id: household.id, kind: 'daily', name: 'Daily packing' })
    .select('id')
    .single()

  if (checklist) {
    await supabase.from('checklist_items').insert(
      DEFAULT_ITEMS.map(item => ({ ...item, checklist_id: checklist.id }))
    )
  }

  return { success: true }
}

export async function joinWithCode(
  code: string,
  displayName: string,
  avatarColor: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: invite } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!invite) return { error: 'Invalid or expired invite code. Check the code and try again.' }

  const { error: mErr } = await supabase.from('memberships').insert({
    household_id: invite.household_id,
    user_id: user.id,
    role: invite.role,
    display_name: displayName,
    avatar_color: avatarColor,
  })

  if (mErr) return { error: 'Could not join household. You may already be a member.' }

  await supabase.from('invite_codes').update({ used_at: new Date().toISOString() }).eq('code', invite.code)

  return { success: true }
}
