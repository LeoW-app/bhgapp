import React, { useState } from 'react';
import { Avatar } from './Shared';
import { memberById } from '../data/seed';

/**
 * A single tappable checklist row.
 * Large tap target (60px tall), optimistic check animation,
 * shows which parent checked it and when.
 */
export default function ChecklistRow({
  item,
  checked,
  checkedBy,
  checkedAt,
  onToggle,
}) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    onToggle(item.id);
  };

  const checker = checkedBy ? memberById(checkedBy) : null;

  return (
    <button
      onClick={handleClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 20px',
        minHeight: 68,
        background: checked ? 'rgba(90, 140, 111, 0.08)' : 'transparent',
        borderBottom: '1px solid rgba(43, 38, 32, 0.06)',
        textAlign: 'left',
        transition: 'background 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          border: checked ? 'none' : '2px solid rgba(43, 38, 32, 0.2)',
          background: checked ? 'var(--sage)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          transform: animating ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        {checked && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" style={{
              strokeDasharray: 20,
              strokeDashoffset: 0,
              animation: animating ? 'check-draw 0.3s ease forwards' : 'none',
            }} />
          </svg>
        )}
      </div>

      {/* Emoji */}
      <div style={{
        fontSize: 24,
        width: 32,
        textAlign: 'center',
        opacity: checked ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}>
        {item.emoji}
      </div>

      {/* Title and notes */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--ink)',
          textDecoration: checked ? 'line-through' : 'none',
          opacity: checked ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {item.title}
          {item.critical && !checked && (
            <span style={{
              width: 6,
              height: 6,
              background: 'var(--rose)',
              borderRadius: '50%',
              display: 'inline-block',
            }} />
          )}
        </div>
        {item.notes && (
          <div style={{
            fontSize: 12,
            color: 'var(--ink-muted)',
            marginTop: 2,
            fontStyle: 'italic',
            opacity: checked ? 0.5 : 1,
          }}>
            {item.notes}
          </div>
        )}
        {item.eventTag && (
          <div style={{ marginTop: 4 }}>
            <span className="chip chip-event">{item.eventTag}</span>
          </div>
        )}
      </div>

      {/* Who checked it */}
      {checked && checker && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2,
        }}>
          <Avatar member={checker} size="sm" />
          {checkedAt && (
            <span style={{ fontSize: 10, color: 'var(--ink-muted)', fontWeight: 700 }}>
              {checkedAt}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
