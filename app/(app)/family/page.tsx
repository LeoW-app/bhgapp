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
  const [showPasswordSheet, setShowPasswordSheet] = useState(false)

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

  async function shareCode() {
    if (!inviteCode) return
    const text = `Join our family on bhgapp with code: ${inviteCode}\n\nOpen https://bhgapp.vercel.app and sign up, then enter this code.`
    if (navigator.share) {
      await navigator.share({ title: 'Join our family on bhgapp', text })
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
    <div className="flex flex-col px-5 pt-12 gap-6 pb-6">
      <h1 className="text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>Family</em>
      </h1>

      {/* ── Members ── */}
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
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate" style={{ color: 'var(--ink)' }}>
                  {m.display_name ?? 'Unnamed'}{m.user_id === myUserId ? ' (you)' : ''}
                </p>
                <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--ink-muted)' }}>
                  {m.role}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0"
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

      {/* ── Invite ── */}
      {myRole === 'parent' && (
        <section>
          <p className="text-xs font-bold tracking-widest uppercase mb-3"
             style={{ color: 'var(--ink-muted)' }}>
            Invite someone
          </p>

          {inviteCode ? (
            <div className="flex flex-col gap-3 p-5 rounded-3xl" style={{ background: 'var(--cream)' }}>
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                Share this code — it expires in 7 days.
              </p>
              <p className="text-4xl font-bold text-center tracking-widest py-2"
                 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', letterSpacing: '0.2em' }}>
                {inviteCode}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={shareCode}
                  className="flex-1 h-12 rounded-2xl font-bold text-sm"
                  style={{ background: 'var(--terracotta)', color: 'white' }}
                >
                  📤 Share
                </button>
                <button
                  onClick={copyCode}
                  className="flex-1 h-12 rounded-2xl font-bold text-sm"
                  style={{
                    background: copied ? 'var(--sage)' : 'var(--paper)',
                    color: copied ? 'white' : 'var(--ink)',
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy code'}
                </button>
              </div>
              <button
                onClick={() => setInviteCode(null)}
                className="text-sm text-center"
                style={{ color: 'var(--ink-muted)' }}
              >
                Generate a new code
              </button>
            </div>
          ) : (
            <button
              onClick={generateInviteCode}
              disabled={generatingCode}
              className="w-full h-14 rounded-2xl font-bold text-base active:scale-[0.98] transition-transform"
              style={{ background: 'var(--terracotta)', color: 'white', opacity: generatingCode ? 0.7 : 1 }}
            >
              {generatingCode ? 'Generating…' : '+ Invite someone'}
            </button>
          )}
        </section>
      )}

      {/* ── Account ── */}
      <section>
        <p className="text-xs font-bold tracking-widest uppercase mb-3"
           style={{ color: 'var(--ink-muted)' }}>
          Account
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowPasswordSheet(true)}
            className="w-full h-14 rounded-2xl font-semibold text-base text-left px-5 flex items-center justify-between active:scale-[0.99] transition-transform"
            style={{ background: 'var(--cream)', color: 'var(--ink)' }}
          >
            <span>Change password</span>
            <span style={{ color: 'var(--ink-muted)' }}>›</span>
          </button>
          <button
            onClick={signOut}
            className="w-full h-14 rounded-2xl font-semibold text-base active:scale-[0.99] transition-transform"
            style={{ background: 'var(--cream)', color: 'var(--rose)' }}
          >
            Sign out
          </button>
        </div>
      </section>

      {showPasswordSheet && (
        <ChangePasswordSheet onClose={() => setShowPasswordSheet(false)} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Change password bottom sheet
// ─────────────────────────────────────────────────────────────

function ChangePasswordSheet({ onClose }: { onClose: () => void }) {
  const supabase = createClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function save() {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords don\'t match.')
      return
    }
    setError(null)
    setSaving(true)
    const { error: authError } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (authError) {
      setError(authError.message)
      return
    }
    setSuccess(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl p-5 pb-10"
        style={{ background: 'var(--paper)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Change password
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--cream)', color: 'var(--ink)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>
              Password updated!
            </p>
          </div>
        ) : (
          <>
            <label className="block text-xs font-semibold mb-1"
                   style={{ color: 'var(--ink-muted)' }}>
              New password
            </label>
            <input
              autoFocus
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-2xl px-4 py-3 mb-3 text-base"
              style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
            />

            <label className="block text-xs font-semibold mb-1"
                   style={{ color: 'var(--ink-muted)' }}>
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Type it again"
              className="w-full rounded-2xl px-4 py-3 mb-4 text-base"
              style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && save()}
            />

            {error && (
              <p className="text-sm mb-3" style={{ color: 'var(--rose)' }}>
                {error}
              </p>
            )}

            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-full py-3 font-bold text-base active:scale-[0.98] transition-transform"
              style={{
                background: 'var(--terracotta)',
                color: 'white',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
