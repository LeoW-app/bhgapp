import React, { useState } from 'react';
import { Avatar, Icons, Toast } from '../components/Shared';
import { household, members } from '../data/seed';

export default function HouseholdScreen() {
  const [toast, setToast] = useState(null);

  const handleInvite = () => {
    setToast('Invite link copied');
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      <div className="screen-body">
        <div className="screen-header">
          <div className="screen-eyebrow">Household</div>
          <h1 className="screen-title">{household.name.split("'")[0]}'s <em>family</em></h1>
        </div>

        {/* Child card */}
        <div className="card card-inset" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: 'linear-gradient(135deg, var(--terracotta-soft), var(--terracotta))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
            }}>
              👧
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--ink-muted)',
              }}>
                Child
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 500,
                marginTop: 2,
              }}>
                {household.child.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                Age {household.child.age} · {household.child.kindergarten}
              </div>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="section-label">Members · {members.length}</div>
        <div className="card card-inset" style={{ padding: 0 }}>
          {members.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              borderBottom: i < members.length - 1 ? '1px solid rgba(43,38,32,0.06)' : 'none',
            }}>
              <div style={{ position: 'relative' }}>
                <Avatar member={m} size="lg" />
                {m.online && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: 'var(--sage)',
                    border: '2px solid var(--paper)',
                  }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {m.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 2,
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: m.role === 'Owner' ? 'var(--terracotta-deep)' : 'var(--ink-muted)',
                    background: m.role === 'Owner' ? 'var(--terracotta-soft)' : 'var(--cream)',
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}>
                    {m.role}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    {m.online ? 'Online now' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Invite */}
        <div style={{ padding: '16px 24px' }}>
          <button onClick={handleInvite} className="btn-primary" style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <Icons.Plus width={18} height={18} />
            Invite co-parent or caregiver
          </button>
          <p style={{
            fontSize: 12,
            color: 'var(--ink-muted)',
            textAlign: 'center',
            marginTop: 10,
            lineHeight: 1.5,
          }}>
            Everyone sees the same checklist in real time.<br />
            Changes sync instantly.
          </p>
        </div>

        {/* Role legend */}
        <div className="section-label">Roles</div>
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { role: 'Owner', desc: 'Full access, billing, can delete household' },
            { role: 'Parent', desc: 'Edit everything, invite members, import docs' },
            { role: 'Caregiver', desc: 'Check items and mark absences; no structural changes' },
            { role: 'Viewer', desc: 'Read-only access for grandparents and others' },
          ].map(r => (
            <div key={r.role} style={{
              display: 'flex',
              gap: 10,
              padding: '8px 12px',
              background: 'var(--cream)',
              borderRadius: 10,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: 'var(--ink)',
                minWidth: 72,
              }}>
                {r.role}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                {r.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast message={toast} show={!!toast} />
    </>
  );
}
