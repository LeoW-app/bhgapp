// Mock data representing one household's kindergarten life
// In a real app this would come from a backend API

export const household = {
  id: "hh_001",
  name: "Emma's Kindergarten",
  child: {
    name: "Emma",
    age: 4,
    kindergarten: "Sonnenschein Kita",
  },
};

export const members = [
  { id: "u1", name: "Anna", initial: "A", color: "#C66B3D", role: "Owner", online: true },
  { id: "u2", name: "Marco", initial: "M", color: "#5A8C6F", role: "Parent", online: true },
  { id: "u3", name: "Oma Lise", initial: "L", color: "#8B6F9E", role: "Viewer", online: false },
];

// Current user (which member is using the app right now)
export const currentUserId = "u1";

// Today's date is hardcoded so the prototype is stable
export const TODAY = new Date(2026, 3, 21); // April 21, 2026 — a Tuesday

// Daily default items (appear every day)
export const dailyItems = [
  { id: "i1", emoji: "💧", title: "Water bottle", critical: true, notes: "The blue one" },
  { id: "i2", emoji: "🥪", title: "Lunchbox", critical: true, notes: "Check there's fruit" },
  { id: "i3", emoji: "👟", title: "Indoor shoes", critical: false },
  { id: "i4", emoji: "👕", title: "Spare clothes", critical: false, notes: "Refresh on Mondays" },
  { id: "i5", emoji: "🧸", title: "Comfort toy", critical: false, notes: "Only Fri — Hoppi bunny" },
  { id: "i6", emoji: "📓", title: "Communication notebook", critical: false },
];

// Event-specific items for today (Tuesday = swimming)
export const eventItems = [
  { id: "e1", emoji: "🩱", title: "Swimsuit", critical: true, eventTag: "Swimming" },
  { id: "e2", emoji: "🏖️", title: "Towel", critical: true, eventTag: "Swimming" },
  { id: "e3", emoji: "🥽", title: "Goggles", critical: false, eventTag: "Swimming" },
];

// Calendar events for the visible month
export const events = [
  // Past
  { id: "ev1", date: "2026-04-06", type: "closure", title: "Staff training day" },
  { id: "ev2", date: "2026-04-10", type: "event", title: "Costume day" },
  { id: "ev3", date: "2026-04-13", type: "absence", title: "Sick — fever" },
  { id: "ev4", date: "2026-04-14", type: "absence", title: "Sick — recovering" },
  // Today and upcoming
  { id: "ev5", date: "2026-04-21", type: "event", title: "Swimming day", checklist: "Swimming" },
  { id: "ev6", date: "2026-04-24", type: "event", title: "Forest trip", checklist: "Forest" },
  { id: "ev7", date: "2026-04-28", type: "event", title: "Parent coffee morning" },
  { id: "ev8", date: "2026-05-01", type: "closure", title: "Public holiday" },
  { id: "ev9", date: "2026-05-04", type: "vacation", title: "Family vacation", endDate: "2026-05-08" },
  { id: "ev10", date: "2026-05-05", type: "vacation", title: "Family vacation" },
  { id: "ev11", date: "2026-05-06", type: "vacation", title: "Family vacation" },
  { id: "ev12", date: "2026-05-07", type: "vacation", title: "Family vacation" },
  { id: "ev13", date: "2026-05-08", type: "vacation", title: "Family vacation" },
];

// Activity feed entries (last few changes in the household)
export const activity = [
  { id: "a1", userId: "u1", action: "checked", target: "Water bottle", at: "Today, 7:42 AM" },
  { id: "a2", userId: "u2", action: "added", target: "absence for Friday", at: "Yesterday, 9:12 PM" },
  { id: "a3", userId: "u1", action: "added", target: "Swimming day event", at: "2 days ago" },
  { id: "a4", userId: "u2", action: "checked", target: "Lunchbox", at: "2 days ago, 7:38 AM" },
  { id: "a5", userId: "u3", action: "joined", target: "the household as Viewer", at: "1 week ago" },
];

// Reusable checklist templates
export const checklistTemplates = [
  {
    id: "t1",
    name: "Daily default",
    kind: "daily",
    itemCount: 6,
    description: "Runs every kindergarten day",
  },
  {
    id: "t2",
    name: "Swimming",
    kind: "event",
    itemCount: 3,
    description: "Attached to Swimming day events",
  },
  {
    id: "t3",
    name: "Forest trip",
    kind: "event",
    itemCount: 4,
    description: "Attached to Forest trip events",
  },
  {
    id: "t4",
    name: "Rainy day",
    kind: "weather",
    itemCount: 3,
    description: "Activates when forecast >60% rain",
  },
];

export const memberById = (id) => members.find((m) => m.id === id) || members[0];
