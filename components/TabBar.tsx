'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/today',
    label: 'Today',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="15" rx="3"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <path d="M3 10h18" stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <path d="M8 3v4M16 3v4"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" strokeLinecap="round" />
        <path d="M7 15l3 3 7-7"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          opacity={active ? 1 : 0.4} />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="15" rx="3"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <path d="M3 10h18" stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <path d="M8 3v4M16 3v4"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="16" r="1.5" fill={active ? 'var(--terracotta)' : 'var(--ink-muted)'} />
        <circle cx="12" cy="16" r="1.5" fill={active ? 'var(--terracotta)' : 'var(--ink-muted)'} opacity="0.5" />
        <circle cx="16" cy="16" r="1.5" fill={active ? 'var(--terracotta)' : 'var(--ink-muted)'} opacity="0.5" />
      </svg>
    ),
  },
  {
    href: '/lists',
    label: 'Lists',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 6h10M9 12h10M9 18h10"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" strokeLinecap="round" />
        <circle cx="5" cy="6" r="1.5" fill={active ? 'var(--terracotta)' : 'var(--ink-muted)'} />
        <circle cx="5" cy="12" r="1.5" fill={active ? 'var(--terracotta)' : 'var(--ink-muted)'} />
        <circle cx="5" cy="18" r="1.5" fill={active ? 'var(--terracotta)' : 'var(--ink-muted)'} />
      </svg>
    ),
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="2"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <rect x="13" y="3" width="8" height="8" rx="2"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <rect x="3" y="13" width="8" height="8" rx="2"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <rect x="13" y="13" width="8" height="8" rx="2"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: '/family',
    label: 'Family',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <circle cx="17" cy="9" r="2.5"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" />
        <path d="M3 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2" strokeLinecap="round" />
        <path d="M17 20c0-2.21-1.343-4.115-3.3-5"
          stroke={active ? 'var(--terracotta)' : 'var(--ink-muted)'} strokeWidth="2"
          strokeLinecap="round" opacity="0.7" />
      </svg>
    ),
  },
]

export function TabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 w-full max-w-[390px]"
      style={{
        transform: 'translateX(-50%)',
        background: 'var(--paper)',
        borderTop: '1px solid var(--cream)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
              style={{ minHeight: 56 }}
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? 'var(--terracotta)' : 'var(--ink-muted)' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
