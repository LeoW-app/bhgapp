'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/today')
    router.refresh()
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
          style={{
            background: 'var(--cream)',
            color: 'var(--ink)',
            borderColor: 'transparent',
            fontFamily: 'var(--font-body)',
          }}
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
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="h-14 px-4 rounded-2xl text-base outline-none border-2 transition-colors"
          style={{
            background: 'var(--cream)',
            color: 'var(--ink)',
            borderColor: 'transparent',
            fontFamily: 'var(--font-body)',
          }}
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
        className="h-14 rounded-2xl font-bold text-base mt-2 transition-opacity"
        style={{
          background: loading ? 'var(--ink-muted)' : 'var(--terracotta)',
          color: 'white',
          fontFamily: 'var(--font-body)',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
        New here?{' '}
        <Link href="/sign-up" className="font-semibold" style={{ color: 'var(--terracotta)' }}>
          Create an account
        </Link>
      </p>
    </form>
  )
}
