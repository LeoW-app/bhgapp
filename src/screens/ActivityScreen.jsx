import React from 'react';
import { Avatar } from '../components/Shared';
import { activity, memberById } from '../data/seed';

const ACTION_VERBS = {
  checked: { verb: 'packed', icon: '✓', color: 'var(--sage)' },
  added: { verb: 'added', icon: '+', color: 'var(--terracotta)' },
  joined: { verb: 'joined', icon: '★', color: 'var(--lavender)' },
};

export default function ActivityScreen() {
  return (
    <div className="screen-body">
      <div className="screen-header">
        <div className="screen-eyebrow">Activity</div>
        <h1 className="screen-title">Everything <em>together</em></h1>
      </div>

      <div style={{ padding: '4px 24px 16px' }}>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          Every change in the household, in one place. No more coordinating over text messages.
        </p>
      </div>

      {/* Timeline */}
      <div style={{ padding: '0 24px', position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: 40,
          top: 20,
          bottom: 20,
          width: 2,
          background: 'rgba(43,38,32,0.08)',
        }} />

        {activity.map((a, i) => {
          const user = memberById(a.userId);
          const meta = ACTION_VERBS[a.action] || ACTION_VERBS.added;
          return (
            <div key={a.id} style={{
              display: 'flex',
              gap: 14,
              padding: '12px 0',
              position: 'relative',
            }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <Avatar member={user} />
                <div style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: meta.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  border: '2px solid var(--paper)',
                }}>
                  {meta.icon}
                </div>
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontSize: 14, lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 800 }}>{user.name}</span>
                  <span style={{ color: 'var(--ink-soft)' }}> {meta.verb} </span>
                  <span style={{ fontWeight: 700 }}>{a.target}</span>
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--ink-muted)',
                  marginTop: 2,
                }}>
                  {a.at}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty bottom state */}
      <div style={{
        padding: '24px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--ink-muted)',
        fontStyle: 'italic',
      }}>
        History keeps 30 days of activity
      </div>
    </div>
  );
}
