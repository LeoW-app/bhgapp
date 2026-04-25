'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords don\'t match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If session is returned, email confirmation is disabled — go straight to setup
    if (data.session) {
      router.push('/setup')
      router.refresh()
    } else {
      // Email confirmation required
      setEmailSent(true)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center flex flex-col gap-4">
        <div className="text-5xl">📬</div>
        <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          Check your email
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          We sent a link to <strong>{email}</strong>. Click it to finish creating your account.
        </p>
        <p className="text-xs mt-4" style={{ color: 'var(--ink-muted)' }}>
          Already confirmed?{' '}
          <Link href="/sign-in" style={{ color: 'var(--terracotta)' }}>Sign in</Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="h-14 px-4 rounded-2xl text-base outline-none border-2 transition-colors"
          style={{ background: 'var(--cream)', color: 'var(--ink)', borderColor: 'transparent', fontFamily: 'var(--font-body)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
          onBlur={e => (e.target.style.borderColor = 'transparent')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
          Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="h-14 px-4 rounded-2xl text-base outline-none border-2 transition-colors"
          style={{ background: 'var(--cream)', color: 'var(--ink)', borderColor: 'transparent', fontFamily: 'var(--font-body)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
          onBlur={e => (e.target.style.borderColor = 'transparent')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold" style={{ color: 'var(--ink-soft)' }}>
          Confirm password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="h-14 px-4 rounded-2xl text-base outline-none border-2 transition-colors"
          style={{ background: 'var(--cream)', color: 'var(--ink)', borderColor: 'transparent', fontFamily: 'var(--font-body)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
          onBlur={e => (e.target.style.borderColor = 'transparent')}
        />
      </div>

      {error && (
        <p className="text-sm text-center font-medium" style={{ color: 'var(--rose)' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-14 rounded-2xl font-bold text-base mt-2"
        style={{
          background: loading ? 'var(--ink-muted)' : 'var(--terracotta)',
          color: 'white',
          fontFamily: 'var(--font-body)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold" style={{ color: 'var(--terracotta)' }}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
