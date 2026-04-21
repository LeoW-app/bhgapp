import React from 'react';

/* ==============================================================
   Avatars
   ============================================================== */

export function Avatar({ member, size = 'md' }) {
  const cls = size === 'sm' ? 'avatar avatar-sm' : size === 'lg' ? 'avatar avatar-lg' : 'avatar';
  return (
    <div className={cls} style={{ background: member.color }}>
      {member.initial}
    </div>
  );
}

export function AvatarStack({ members, max = 3 }) {
  const shown = members.slice(0, max);
  return (
    <div className="avatar-stack">
      {shown.map(m => <Avatar key={m.id} member={m} size="sm" />)}
    </div>
  );
}

/* ==============================================================
   Icon set — custom inline SVGs so we avoid icon-library dependency
   Each icon is 24×24 with stroke-based design for warmth
   ============================================================== */

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const Icons = {
  Home: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M3 11L12 3l9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" />
    </svg>
  ),
  Check: (p) => (
    <svg {...iconProps} {...p}>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M8 12l3 3 5-6" />
      <path d="M3 8h18" />
    </svg>
  ),
  Calendar: (p) => (
    <svg {...iconProps} {...p}>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  ),
  Users: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Activity: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Plus: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  ChevronLeft: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  ChevronRight: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  Bell: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  ),
  Settings: (p) => (
    <svg {...iconProps} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
    </svg>
  ),
  Drop: (p) => (
    <svg {...iconProps} {...p}>
      <path d="M12 2s7 8 7 13a7 7 0 01-14 0c0-5 7-13 7-13z" />
    </svg>
  ),
  Dot: (p) => (
    <svg {...iconProps} {...p}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  ),
};

/* ==============================================================
   Phone frame
   ============================================================== */

export function PhoneFrame({ children, time = '7:24' }) {
  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-screen">
          <div className="status-bar">
            <span>{time}</span>
            <div className="status-right">
              <span>●●●</span>
              <span>⌁</span>
              <span>▰▰▰▱</span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ==============================================================
   Tab bar (bottom nav)
   ============================================================== */

export function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: Icons.Home },
    { id: 'calendar', label: 'Calendar', icon: Icons.Calendar },
    { id: 'lists', label: 'Lists', icon: Icons.Check },
    { id: 'household', label: 'Family', icon: Icons.Users },
    { id: 'activity', label: 'Activity', icon: Icons.Activity },
  ];

  return (
    <div className="tab-bar">
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            <Icon />
            <span>{t.label}</span>
            {isActive && <div className="tab-dot" />}
          </button>
        );
      })}
    </div>
  );
}

/* ==============================================================
   Toast — shown after actions
   ============================================================== */

export function Toast({ message, show }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: 96,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--ink)',
      color: 'var(--paper)',
      padding: '10px 18px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 700,
      zIndex: 200,
      boxShadow: 'var(--shadow-md)',
      animation: 'fade-slide-up 0.25s ease',
    }}>
      {message}
    </div>
  );
}
