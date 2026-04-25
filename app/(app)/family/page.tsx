'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'

type Member = {
  id: string
  user_id: string
  display_name: string | null
  avatar_color: string | null
  role: 'parent' | 'viewer'
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function FamilyPage() {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [myRole, setMyRole] = useState<'parent' | 'viewer'>('viewer')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setMyUserId(user.id)

      const { data: me } = await supabase
        .from('memberships')
        .select('household_id, role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!me) { setLoading(false); return }

      setHouseholdId(me.household_id)
      setMyRole(me.role as 'parent' | 'viewer')

      const { data: all } = await supabase
        .from('memberships')
        .select('id, user_id, display_name, avatar_color, role')
        .eq('household_id', me.household_id)

      setMembers((all ?? []) as Member[])
      setLoading(false)
    }
    load()
  }, [supabase])

  async function generateInviteCode() {
    if (!householdId || !myUserId) return
    setGeneratingCode(true)
    const code = generateCode()
    await supabase.from('invite_codes').insert({
      code,
      household_id: householdId,
      role: 'parent',
      created_by: myUserId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    setInviteCode(code)
    setGeneratingCode(false)
  }

  async function copyCode() {
    if (!inviteCode) return
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/sign-in'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col px-5 pt-12 gap-6">
      <h1 className="text-3xl font-bold italic"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        <em style={{ color: 'var(--terracotta)' }}>Family</em>
      </h1>

      {/* Members */}
      <section>
        <p className="text-xs font-bold tracking-widest uppercase mb-3"
           style={{ color: 'var(--ink-muted)' }}>
          Members
        </p>
        <ul className="flex flex-col gap-3">
          {members.map(m => (
            <li key={m.id}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl"
                style={{ background: 'var(--cream)' }}>
              <Avatar name={m.display_name ?? '?'} color={m.avatar_color ?? '#C66B3D'} size={44} />
              <div className="flex-1">
                <p className="font-bold" style={{ color: 'var(--ink)' }}>
                  {m.display_name ?? 'Unnamed'}{m.user_id === myUserId ? ' (you)' : ''}
                </p>
                <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--ink-muted)' }}>
                  {m.role}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                style={{
                  background: m.role === 'parent' ? 'var(--terracotta)' : 'var(--sage)',
                  color: 'white',
                }}
              >
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Invite */}
      {myRole === 'parent' && (
        <section>
          <p className="text-xs font-bold tracking-widest uppercase mb-3"
             style={{ color: 'var(--ink-muted)' }}>
            Invite a co-parent
          </p>

          {inviteCode ? (
            <div className="flex flex-col gap-3 p-5 rounded-3xl" style={{ background: 'var(--cream)' }}>
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                Share this code. It expires in 7 days.
              </p>
              <p className="text-4xl font-bold text-center tracking-widest"
                 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', letterSpacing: '0.2em' }}>
                {inviteCode}
              </p>
              <button
                onClick={copyCode}
                className="h-12 rounded-2xl font-bold text-sm"
                style={{ background: copied ? 'var(--sage)' : 'var(--terracotta)', color: 'white' }}
              >
                {copied ? '✓ Copied!' : 'Copy code'}
              </button>
              <button
                onClick={() => setInviteCode(null)}
                className="text-sm text-center"
                style={{ color: 'var(--ink-muted)' }}
              >
                Generate another code
              </button>
            </div>
          ) : (
            <button
              onClick={generateInviteCode}
              disabled={generatingCode}
              className="w-full h-14 rounded-2xl font-bold text-base"
              style={{ background: 'var(--terracotta)', color: 'white', opacity: generatingCode ? 0.7 : 1 }}
            >
              {generatingCode ? 'Generating…' : '+ Invite someone'}
            </button>
          )}
        </section>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full h-12 rounded-2xl font-semibold text-sm mt-2"
        style={{ background: 'var(--cream)', color: 'var(--ink-soft)' }}
      >
        Sign out
      </button>

      <div className="h-4" />
    </div>
  )
}
