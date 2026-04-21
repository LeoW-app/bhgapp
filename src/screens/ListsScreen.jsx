import React from 'react';
import { Icons } from '../components/Shared';
import { checklistTemplates } from '../data/seed';

const KIND_META = {
  daily: { label: 'Every day', color: 'var(--terracotta)', emoji: '🌅' },
  event: { label: 'Event-based', color: 'var(--sun)', emoji: '🎯' },
  weather: { label: 'Weather-based', color: 'var(--sky)', emoji: '☁️' },
};

export default function ListsScreen() {
  return (
    <div className="screen-body">
      <div className="screen-header">
        <div className="screen-eyebrow">Templates</div>
        <h1 className="screen-title">Packing <em>lists</em></h1>
      </div>

      <div style={{ padding: '4px 24px 16px' }}>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          Lists combine automatically based on the day. Your daily list plus any active events or weather conditions create today's packing checklist.
        </p>
      </div>

      {/* Template cards */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {checklistTemplates.map(t => {
          const meta = KIND_META[t.kind];
          return (
            <button
              key={t.id}
              style={{
                background: 'var(--paper)',
                border: '1px solid rgba(43,38,32,0.06)',
                borderRadius: 'var(--r-lg)',
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.1s ease',
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: meta.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}>
                {meta.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-muted)',
                }}>
                  {meta.label}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginTop: 2,
                }}>
                  {t.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--ink-soft)',
                  marginTop: 2,
                }}>
                  {t.itemCount} items · {t.description}
                </div>
              </div>
              <Icons.ChevronRight width={18} height={18} />
            </button>
          );
        })}
      </div>

      {/* Create new */}
      <div style={{ padding: '20px 24px 24px' }}>
        <button className="btn-primary" style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <Icons.Plus width={18} height={18} />
          Create new list
        </button>

        {/* Import option */}
        <button style={{
          width: '100%',
          marginTop: 10,
          padding: '14px 18px',
          background: 'transparent',
          border: '2px dashed rgba(43,38,32,0.2)',
          borderRadius: 'var(--r-md)',
          color: 'var(--ink-soft)',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <Icons.Sparkle width={16} height={16} />
          Import from kindergarten photo
          <span style={{
            fontSize: 9,
            background: 'var(--lavender)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: 999,
            fontWeight: 800,
            letterSpacing: '0.05em',
          }}>
            SOON
          </span>
        </button>
      </div>
    </div>
  );
}
