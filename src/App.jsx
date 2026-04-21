import React, { useState } from 'react';
import { PhoneFrame, TabBar } from './components/Shared';
import TodayScreen from './screens/TodayScreen';
import CalendarScreen from './screens/CalendarScreen';
import ListsScreen from './screens/ListsScreen';
import HouseholdScreen from './screens/HouseholdScreen';
import ActivityScreen from './screens/ActivityScreen';

const SCREEN_INFO = {
  today: {
    eyebrow: 'Primary screen',
    title: 'Today, at a glance',
    body: 'The morning screen. Open it, see what Emma needs, check items off. Everything else is supporting context.',
    bullets: [
      'Tap any row to mark it packed — syncs to your co-parent instantly',
      'Critical items show a red dot and block the "all packed" celebration',
      'Event-specific items (Swimming day) merge automatically with your daily defaults',
      'Watch the avatar appear next to items your co-parent already checked',
    ],
  },
  calendar: {
    eyebrow: 'Supporting feature',
    title: 'The kindergarten month',
    body: 'Not trying to replace Google Calendar — a focused view of kindergarten life. Closures, absences, special days.',
    bullets: [
      'Tap any day to see details — events, absences, linked checklists',
      'Multi-day vacations show as continuous blocks',
      'The color language stays consistent across the whole app',
    ],
    legend: [
      { color: 'var(--c-event)', label: 'Special event (swimming, trip)' },
      { color: 'var(--c-closure)', label: 'Kindergarten closed' },
      { color: 'var(--c-vacation)', label: 'Family vacation' },
      { color: 'var(--c-absence)', label: 'Sick / absent' },
    ],
  },
  lists: {
    eyebrow: 'Template management',
    title: 'Stackable lists',
    body: 'Three types of list stack on top of each other to build each day\'s packing checklist.',
    bullets: [
      'Daily default — the always-there items like water bottle and lunchbox',
      'Event-based — attached to calendar events like Swimming or Forest trip',
      'Weather-based — activates when conditions match (e.g., >60% rain forecast)',
      'Document import is scoped for v1.1 — a paste-text fallback ships in v1.0',
    ],
  },
  household: {
    eyebrow: 'Priority feature',
    title: 'Built for sharing',
    body: 'The whole app is designed around households, not individuals. Every piece of data is shared by default.',
    bullets: [
      'Four roles — Owner, Parent, Caregiver, Viewer — with different permissions',
      'Invite links expire in 7 days and can be revoked',
      'Green dot = member is online and could be editing right now',
      'A single user can belong to multiple households (separated parents)',
    ],
  },
  activity: {
    eyebrow: 'Coordination layer',
    title: 'No more WhatsApp chaos',
    body: 'A shared timeline of every change. Replaces the text-message coordination parents currently juggle.',
    bullets: [
      '30-day rolling history of checks, additions, and member changes',
      'Each entry shows which member made the change and when',
      'Silences duplicate notifications — if Marco packed the bag, Anna\'s reminder won\'t fire',
    ],
  },
};

export default function App() {
  const [screen, setScreen] = useState('today');

  const screens = {
    today: <TodayScreen />,
    calendar: <CalendarScreen />,
    lists: <ListsScreen />,
    household: <HouseholdScreen />,
    activity: <ActivityScreen />,
  };

  const info = SCREEN_INFO[screen];

  return (
    <div className="phone-shell">
      <PhoneFrame>
        {screens[screen]}
        <TabBar active={screen} onChange={setScreen} />
      </PhoneFrame>

      <aside className="info-panel">
        <div className="info-eyebrow">{info.eyebrow}</div>
        <h2 className="info-title">
          {info.title.split(' ').slice(0, -2).join(' ')}{' '}
          <em>{info.title.split(' ').slice(-2).join(' ')}</em>
        </h2>
        <p>{info.body}</p>
        <ul>
          {info.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        {info.legend && (
          <div className="info-panel-legend">
            <h4>Color legend</h4>
            {info.legend.map((l, i) => (
              <div key={i} className="legend-row">
                <div className="legend-swatch" style={{ background: l.color }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="info-panel-legend">
          <h4>Prototype notes</h4>
          <p style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            All interactions work — tap checklist items, switch months, jump between screens. Data resets on refresh.
          </p>
        </div>
      </aside>
    </div>
  );
}
