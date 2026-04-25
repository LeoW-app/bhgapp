'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AVATAR_COLORS } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { joinWithCode } from '@/actions/household'

type Step = 'profile' | 'choice' | 'new-household' | 'join'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('profile')
  const [displayName, setDisplayName] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].value)
  const [childName, setChildName] = useState('')
  const [kindergartenName, setKindergartenName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [householdError, setHouseholdError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleProfileNext(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) return
    setStep('choice')
  }

  function handleCreateHousehold(e: React.FormEvent) {
    e.preventDefault()
    setHouseholdError('')
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.rpc('create_household_for_user', {
        p_display_name:      displayName,
        p_avatar_color:      avatarColor,
        p_child_name:        childName,
        p_kindergarten_name: kindergartenName,
      })
      if (error) {
        setHouseholdError(error.message)
      } else {
        router.push('/today')
        router.refresh()
      }
    })
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoinError('')
    startTransition(async () => {
      const result = await joinWithCode(inviteCode, displayName, avatarColor)
      if ('error' in result) {
        setJoinError(result.error)
      } else {
        router.push('/today')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col px-5 py-10 max-w-sm mx-auto w-full">

      {/* ── Step 1: Profile ── */}
      {step === 'profile' && (
        <form onSubmit={handleProfileNext} className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3"
               style={{ color: 'var(--ink-muted)' }}>
              Step 1 of 3
            </p>
            <h2 className="text-3xl font-bold italic leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Who are <em style={{ color: 'var(--terracotta)' }}>you?</em>
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
              This is how you'll appear to your co-parents.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
              Your name
            </label>
            <input
              type="text"
              placeholder="e.g. Leon"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="h-14 px-4 rounded-2xl text-base outline-none border-2 transition-colors"
              style={{ background: 'var(--cream)', color: 'var(--ink)', borderColor: 'transparent', fontFamily: 'var(--font-body)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
              Pick a colour
            </label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map(({ name, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAvatarColor(value)}
                  className="rounded-full transition-transform"
                  style={{
                    width: 44,
                    height: 44,
                    background: value,
                    outline: avatarColor === value ? `3px solid ${value}` : 'none',
                    outlineOffset: 3,
                    transform: avatarColor === value ? 'scale(1.1)' : 'scale(1)',
                  }}
                  title={name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {displayName && (
            <div className="flex items-center gap-3 p-4 rounded-2xl"
                 style={{ background: 'var(--cream)' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: 'white',
              }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--ink)' }}>{displayName}</p>
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Parent</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="h-14 rounded-2xl font-bold text-base"
            style={{ background: 'var(--terracotta)', color: 'white', fontFamily: 'var(--font-body)' }}
          >
            Continue →
          </button>
        </form>
      )}

      {/* ── Step 2: Choice ── */}
      {step === 'choice' && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3"
               style={{ color: 'var(--ink-muted)' }}>
              Step 2 of 3
            </p>
            <h2 className="text-3xl font-bold italic leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Your <em style={{ color: 'var(--terracotta)' }}>household</em>
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
              Is this a new household, or are you joining one?
            </p>
          </div>

          <button
            onClick={() => setStep('new-household')}
            className="p-5 rounded-2xl text-left border-2 transition-colors"
            style={{ background: 'var(--cream)', borderColor: 'transparent' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--terracotta)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'transparent')}
          >
            <div className="text-2xl mb-2">🏡</div>
            <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>Create a new household</p>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
              Set up checklists and invite your co-parent later
            </p>
          </button>

          <button
            onClick={() => setStep('join')}
            className="p-5 rounded-2xl text-left border-2 transition-colors"
            style={{ background: 'var(--cream)', borderColor: 'transparent' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--sage)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'transparent')}
          >
            <div className="text-2xl mb-2">🔑</div>
            <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>Join with an invite code</p>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
              Your co-parent already set things up
            </p>
          </button>
        </div>
      )}

      {/* ── Step 3a: New household ── */}
      {step === 'new-household' && (
        <form onSubmit={handleCreateHousehold} className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3"
               style={{ color: 'var(--ink-muted)' }}>
              Step 3 of 3
            </p>
            <h2 className="text-3xl font-bold italic leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Tell us about <em style={{ color: 'var(--terracotta)' }}>Oliver</em>
            </h2>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
              Child's name
            </label>
            <input
              type="text"
              placeholder="Oliver"
              required
              value={childName}
              onChange={e => setChildName(e.target.value)}
              className="h-14 px-4 rounded-2xl text-base outline-none border-2 transition-colors"
              style={{ background: 'var(--cream)', color: 'var(--ink)', borderColor: 'transparent', fontFamily: 'var(--font-body)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
              Kindergarten name
            </label>
            <input
              type="text"
              placeholder="e.g. Sunshine Kindergarten"
              required
              value={kindergartenName}
              onChange={e => setKindergartenName(e.target.value)}
              className="h-14 px-4 rounded-2xl text-base outline-none border-2 transition-colors"
              style={{ background: 'var(--cream)', color: 'var(--ink)', borderColor: 'transparent', fontFamily: 'var(--font-body)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          <p className="text-xs rounded-xl px-4 py-3" style={{ background: 'var(--cream)', color: 'var(--ink-soft)' }}>
            We'll add a default daily checklist — water bottle, lunchbox, indoor shoes and more.
            You can edit it any time.
          </p>

          {householdError && (
            <p className="text-sm text-center font-medium" style={{ color: 'var(--rose)' }}>
              {householdError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-14 rounded-2xl font-bold text-base"
            style={{
              background: isPending ? 'var(--ink-muted)' : 'var(--terracotta)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Setting up…' : 'Create household'}
          </button>

          <button type="button" onClick={() => setStep('choice')} className="text-sm text-center"
                  style={{ color: 'var(--ink-muted)' }}>
            ← Back
          </button>
        </form>
      )}

      {/* ── Step 3b: Join with code ── */}
      {step === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3"
               style={{ color: 'var(--ink-muted)' }}>
              Step 3 of 3
            </p>
            <h2 className="text-3xl font-bold italic leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Enter your <em style={{ color: 'var(--terracotta)' }}>code</em>
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
              Your co-parent can generate a 6-character code in the Family screen.
            </p>
          </div>

          <input
            type="text"
            placeholder="ABC123"
            maxLength={6}
            required
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value.toUpperCase())}
            className="h-14 px-4 rounded-2xl text-center text-2xl font-bold tracking-widest outline-none border-2 transition-colors uppercase"
            style={{ background: 'var(--cream)', color: 'var(--ink)', borderColor: 'transparent', fontFamily: 'var(--font-body)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
            onBlur={e => (e.target.style.borderColor = 'transparent')}
          />

          {joinError && (
            <p className="text-sm text-center font-medium" style={{ color: 'var(--rose)' }}>
              {joinError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-14 rounded-2xl font-bold text-base"
            style={{
              background: isPending ? 'var(--ink-muted)' : 'var(--sage)',
              color: 'white',
              fontFamily: 'var(--font-body)',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Joining…' : 'Join household'}
          </button>

          <button type="button" onClick={() => setStep('choice')} className="text-sm text-center"
                  style={{ color: 'var(--ink-muted)' }}>
            ← Back
          </button>
        </form>
      )}
    </div>
  )
}
