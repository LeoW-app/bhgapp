import React, { useState } from 'react';
import { Icons } from '../components/Shared';
import { events, TODAY } from '../data/seed';

const TYPE_COLORS = {
  closure: 'var(--c-closure)',
  vacation: 'var(--c-vacation)',
  absence: 'var(--c-absence)',
  event: 'var(--c-event)',
};

const TYPE_LABELS = {
  closure: 'Closed',
  vacation: 'Vacation',
  absence: 'Absent',
  event: 'Event',
};

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getEventsByDate() {
  const map = {};
  events.forEach(e => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return map;
}

export default function CalendarScreen() {
  const [viewMonth, setViewMonth] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useState(formatDate(TODAY));

  const eventMap = getEventsByDate();

  // Build calendar grid (Monday start)
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0, Sunday = 6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isToday = (d) => d && d === TODAY.getDate() && month === TODAY.getMonth() && year === TODAY.getFullYear();

  const selectedEvents = selected ? (eventMap[selected] || []) : [];

  const goPrev = () => setViewMonth(new Date(year, month - 1, 1));
  const goNext = () => setViewMonth(new Date(year, month + 1, 1));

  return (
    <div className="screen-body">
      <div className="screen-header">
        <div className="screen-eyebrow">Calendar</div>
        <h1 className="screen-title">Emma's <em>month</em></h1>
      </div>

      {/* Month nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 24px 16px',
      }}>
        <button onClick={goPrev} style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--cream)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink)',
        }}>
          <Icons.ChevronLeft />
        </button>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>
          {monthName}
        </div>
        <button onClick={goNext} style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--cream)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink)',
        }}>
          <Icons.ChevronRight />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        padding: '0 20px',
        marginBottom: 8,
      }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: i >= 5 ? 'var(--ink-muted)' : 'var(--ink-soft)',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        padding: '0 20px',
        gap: 4,
      }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ aspectRatio: '1' }} />;
          const dateStr = formatDate(new Date(year, month, d));
          const dayEvents = eventMap[dateStr] || [];
          const primaryType = dayEvents[0]?.type;
          const isSelected = selected === dateStr;
          const today = isToday(d);
          const dow = new Date(year, month, d).getDay();
          const isWeekend = dow === 0 || dow === 6;

          return (
            <button
              key={i}
              onClick={() => setSelected(dateStr)}
              style={{
                aspectRatio: '1',
                borderRadius: 10,
                background: isSelected
                  ? 'var(--terracotta)'
                  : primaryType
                    ? TYPE_COLORS[primaryType]
                    : isWeekend
                      ? 'transparent'
                      : 'var(--cream)',
                color: isSelected ? 'white' : 'var(--ink)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: today ? 800 : 600,
                fontSize: 14,
                position: 'relative',
                border: today && !isSelected ? '2px solid var(--terracotta)' : 'none',
                transition: 'transform 0.1s ease',
              }}
            >
              {d}
              {dayEvents.length > 0 && !isSelected && (
                <div style={{
                  display: 'flex',
                  gap: 2,
                  marginTop: 2,
                }}>
                  {dayEvents.slice(0, 3).map((_, k) => (
                    <div key={k} style={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: 'var(--ink-soft)',
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date details */}
      <div className="section-label" style={{ marginTop: 20 }}>
        {selected === formatDate(TODAY) ? 'Today' : new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>

      {selectedEvents.length === 0 ? (
        <div style={{
          padding: '16px 24px',
          margin: '0 20px 16px',
          background: 'var(--cream)',
          borderRadius: 'var(--r-md)',
          fontSize: 14,
          color: 'var(--ink-muted)',
          fontStyle: 'italic',
        }}>
          Nothing scheduled. Tap + to add.
        </div>
      ) : (
        <div className="card card-inset" style={{ padding: 0 }}>
          {selectedEvents.map((ev, i) => (
            <div key={ev.id} style={{
              display: 'flex',
              gap: 14,
              padding: '14px 18px',
              borderBottom: i < selectedEvents.length - 1 ? '1px solid rgba(43,38,32,0.06)' : 'none',
              alignItems: 'center',
            }}>
              <div style={{
                width: 6,
                height: 40,
                borderRadius: 3,
                background: TYPE_COLORS[ev.type],
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-muted)',
                }}>
                  {TYPE_LABELS[ev.type]}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                  {ev.title}
                </div>
                {ev.checklist && (
                  <div style={{ marginTop: 6 }}>
                    <span className="chip">📋 {ev.checklist} list attached</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <div style={{ padding: '4px 24px 24px' }}>
        <button className="btn-primary" style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <Icons.Plus width={18} height={18} />
          Add event or absence
        </button>
      </div>
    </div>
  );
}
