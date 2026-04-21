import React, { useState, useMemo } from 'react';
import ChecklistRow from '../components/ChecklistRow';
import { AvatarStack, Toast } from '../components/Shared';
import { dailyItems, eventItems, members, currentUserId } from '../data/seed';

export default function TodayScreen() {
  // Track checked items: { itemId: { by: userId, at: 'timestamp' } }
  const [checkedMap, setCheckedMap] = useState({
    i1: { by: 'u1', at: '7:42' }, // Water bottle — Anna already checked
  });
  const [toast, setToast] = useState(null);

  const allItems = [...eventItems, ...dailyItems]; // event items show first
  const totalCount = allItems.length;
  const checkedCount = Object.keys(checkedMap).length;
  const allPacked = checkedCount === totalCount;
  const criticalRemaining = useMemo(
    () => allItems.filter(i => i.critical && !checkedMap[i.id]).length,
    [checkedMap, allItems]
  );

  const handleToggle = (itemId) => {
    setCheckedMap(prev => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        const now = new Date();
        next[itemId] = {
          by: currentUserId,
          at: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        };
        // Check if this completion finishes everything
        if (Object.keys(next).length === totalCount) {
          setTimeout(() => setToast('Bag packed! 🎉'), 100);
          setTimeout(() => setToast(null), 2400);
        }
      }
      return next;
    });
  };

  return (
    <>
      <div className="screen-body">
        {/* Header with greeting */}
        <div style={{ padding: '20px 24px 12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
          }}>
            <div>
              <div className="screen-eyebrow">Tuesday · April 21</div>
              <h1 className="screen-title">
                Good morning,<br />
                <em>Anna</em>
              </h1>
            </div>
            <AvatarStack members={members} />
          </div>
        </div>

        {/* Progress summary card */}
        <div className="card card-inset" style={{
          marginTop: 16,
          padding: 18,
          background: allPacked
            ? 'linear-gradient(135deg, #B8D4C2 0%, #5A8C6F 100%)'
            : 'linear-gradient(135deg, #F5DFA0 0%, #E8B84A 100%)',
          border: 'none',
          color: allPacked ? 'white' : 'var(--ink)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.75 }}>
                Today's bag
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 500,
                marginTop: 4,
                lineHeight: 1.15,
              }}>
                {allPacked
                  ? 'All packed & ready'
                  : criticalRemaining > 0
                    ? `${criticalRemaining} essential${criticalRemaining > 1 ? 's' : ''} to go`
                    : `${totalCount - checkedCount} item${totalCount - checkedCount > 1 ? 's' : ''} left`}
              </div>
            </div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
            }}>
              {checkedCount}/{totalCount}
            </div>
          </div>
          {/* Progress bar */}
          <div style={{
            marginTop: 14,
            height: 6,
            background: 'rgba(255,255,255,0.35)',
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(checkedCount / totalCount) * 100}%`,
              background: 'white',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Today's event banner */}
        <div style={{ padding: '8px 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: 'var(--sun-soft)',
            borderRadius: 'var(--r-md)',
          }}>
            <span style={{ fontSize: 20 }}>🏊</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#8A6B12' }}>
                TODAY'S SPECIAL
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                Swimming day — extra items added
              </div>
            </div>
          </div>
        </div>

        {/* Checklist items */}
        <div className="section-label">Packing list</div>
        <div className="card card-inset" style={{ padding: 0 }}>
          {allItems.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              checked={!!checkedMap[item.id]}
              checkedBy={checkedMap[item.id]?.by}
              checkedAt={checkedMap[item.id]?.at}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Quick action — mark absent */}
        <div style={{ padding: '4px 24px 24px' }}>
          <button className="btn-ghost" style={{ width: '100%' }}>
            Mark Emma absent today
          </button>
        </div>
      </div>

      <Toast message={toast} show={!!toast} />
    </>
  );
}
