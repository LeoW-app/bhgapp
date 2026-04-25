'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type EventType = 'closure' | 'vacation' | 'absence' | 'event' | 'note'

type EventRow = {
  id: string
  type: EventType
  title: string
  starts_on: string
  ends_on: string | null
  notes: string | null
}

const TYPE_META: Record<EventType, { label: string; color: string; emoji: string }> = {
  closure:  { label: 'Closure',  color: 'var(--rose)',      emoji: '🚫' },
  vacation: { label: 'Vacation', color: 'var(--sun)',       emoji: '🌴' },
  absence:  { label: 'Absence',  color: 'var(--lavender)',  emoji: '🤒' },
  event:    { label: 'Event',    color: 'var(--sage)',      emoji: '🎉' },
  note:     { label: 'Note',     color: 'var(--sky)',       emoji: '📝' },
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseYmd(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

// Days in the visible 6×7 grid, starting on Monday
function buildGrid(viewMonth: Date): Date[] {
  const first = startOfMonth(viewMonth)
  // JS getDay: 0=Sun..6=Sat. We want Monday = 0.
  const offset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - offset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function eventCoversDate(ev: EventRow, dateStr: string) {
  const start = ev.starts_on
  const end = ev.ends_on ?? ev.starts_on
  return dateStr >= start && dateStr <= end
}

function formatDateLong(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatRange(start: string, end: string | null) {
  if (!end || end === start) {
    return parseYmd(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  const s = parseYmd(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = parseYmd(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${s} – ${e}`
}

export default function CalendarPage() {
  const supabase = createClient()
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<string>(() => ymd(new Date()))
  const [events, setEvents] = useState<EventRow[]>([])
  const [addOpen, setAddOpen] = useState(false)

  // Bootstrap: get household
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: m } = await supabase
        .from('memberships')
        .select('household_id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (m?.household_id) setHouseholdId(m.household_id)
      setLoading(false)
    }
    init()
  }, [supabase])

  // Load events for the visible window (a bit wider than the month)
  useEffect(() => {
    if (!householdId) return
    let cancelled = false
    async function fetchEvents(houseId: string, anchor: Date) {
      const grid = buildGrid(anchor)
      const fromStr = ymd(grid[0])
      const toStr = ymd(grid[grid.length - 1])
      const { data } = await supabase
        .from('events')
        .select('id, type, title, starts_on, ends_on, notes')
        .eq('household_id', houseId)
        .or(`and(starts_on.lte.${toStr},ends_on.gte.${fromStr}),and(starts_on.lte.${toStr},ends_on.is.null,starts_on.gte.${fromStr})`)
        .order('starts_on', { ascending: true })
      if (!cancelled) setEvents((data as EventRow[] | null) ?? [])
    }
    fetchEvents(householdId, viewMonth)
    return () => { cancelled = true }
  }, [householdId, viewMonth, supabase])

  const grid = useMemo(() => buildGrid(viewMonth), [viewMonth])
  const today = ymd(new Date())

  // Map ymd → events on that day
  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventRow[]>()
    for (const d of grid) {
      const key = ymd(d)
      const list = events.filter(ev => eventCoversDate(ev, key))
      if (list.length) map.set(key, list)
    }
    return map
  }, [grid, events])

  const selectedEvents = useMemo(() => {
    return events.filter(ev => eventCoversDate(ev, selected))
  }, [events, selected])

  function gotoMonth(delta: number) {
    setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }

  async function handleDelete(id: string) {
    if (!householdId) return
    setEvents(prev => prev.filter(e => e.id !== id))
    await supabase.from('events').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-3xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>Calendar</em>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          Closures, vacations, absences &amp; events
        </p>
      </header>

      {/* ── Month nav ── */}
      <div className="mx-5 mb-3 flex items-center justify-between">
        <button
          onClick={() => gotoMonth(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: 'var(--cream)', color: 'var(--ink)' }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <button
          onClick={() => {
            const now = new Date()
            setViewMonth(startOfMonth(now))
            setSelected(ymd(now))
          }}
          className="font-bold text-lg"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
        >
          {monthLabel}
        </button>
        <button
          onClick={() => gotoMonth(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: 'var(--cream)', color: 'var(--ink)' }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* ── Weekday header ── */}
      <div className="mx-5 grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold py-1"
               style={{ color: 'var(--ink-muted)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Month grid ── */}
      <div className="mx-5 grid grid-cols-7 gap-1 mb-4">
        {grid.map(d => {
          const key = ymd(d)
          const inMonth = d.getMonth() === viewMonth.getMonth()
          const isToday = key === today
          const isSelected = key === selected
          const dayEvents = eventsByDay.get(key) ?? []
          const dotColors = Array.from(new Set(dayEvents.map(e => TYPE_META[e.type].color))).slice(0, 3)

          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className="relative flex flex-col items-center justify-start pt-1.5 rounded-xl transition-all active:scale-95"
              style={{
                aspectRatio: '1 / 1',
                background: isSelected ? 'var(--terracotta)' : isToday ? 'var(--cream)' : 'transparent',
                color: isSelected ? 'white' : inMonth ? 'var(--ink)' : 'var(--ink-muted)',
                opacity: inMonth ? 1 : 0.4,
              }}
            >
              <span className="text-sm font-semibold leading-none">
                {d.getDate()}
              </span>
              {dotColors.length > 0 && (
                <div className="absolute bottom-1.5 flex gap-0.5">
                  {dotColors.map((c, i) => (
                    <span key={i} className="rounded-full"
                          style={{
                            width: 5, height: 5,
                            background: isSelected ? 'white' : c,
                          }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Selected day section ── */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          {formatDateLong(parseYmd(selected))}
        </h2>
        <button
          onClick={() => setAddOpen(true)}
          className="text-sm font-semibold rounded-full px-4 py-2 active:scale-95 transition-transform"
          style={{ background: 'var(--terracotta)', color: 'white' }}
        >
          + Add
        </button>
      </div>

      <div className="px-5 flex flex-col gap-2 pb-6">
        {selectedEvents.length === 0 ? (
          <div className="rounded-3xl p-6 text-center" style={{ background: 'var(--cream)' }}>
            <p className="text-2xl mb-1">✨</p>
            <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Nothing planned</p>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>
              Tap “+ Add” to add an event for this day.
            </p>
          </div>
        ) : (
          selectedEvents.map(ev => {
            const meta = TYPE_META[ev.type]
            return (
              <div key={ev.id}
                   className="flex items-start gap-3 rounded-2xl p-4"
                   style={{ background: 'var(--paper)', border: '1.5px solid var(--cream)' }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                     style={{ background: meta.color, color: 'white' }}>
                  {meta.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold text-base truncate" style={{ color: 'var(--ink)' }}>
                      {ev.title}
                    </p>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                    {meta.label} · {formatRange(ev.starts_on, ev.ends_on)}
                  </p>
                  {ev.notes && (
                    <p className="text-sm mt-1.5" style={{ color: 'var(--ink-soft)' }}>
                      {ev.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm active:scale-95 transition-transform"
                  style={{ color: 'var(--ink-muted)' }}
                  aria-label="Delete entry"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>

      {addOpen && householdId && (
        <AddEventSheet
          householdId={householdId}
          defaultDate={selected}
          onClose={() => setAddOpen(false)}
          onCreated={(ev) => {
            setEvents(prev => [...prev, ev].sort((a, b) => a.starts_on.localeCompare(b.starts_on)))
            setAddOpen(false)
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Add-event bottom sheet
// ─────────────────────────────────────────────────────────────

function AddEventSheet({
  householdId,
  defaultDate,
  onClose,
  onCreated,
}: {
  householdId: string
  defaultDate: string
  onClose: () => void
  onCreated: (ev: EventRow) => void
}) {
  const supabase = createClient()
  const [type, setType] = useState<EventType>('event')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(defaultDate)
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim()) {
      setError('Please add a title.')
      return
    }
    if (endDate && endDate < startDate) {
      setError('End date can’t be before start date.')
      return
    }
    setError(null)
    setSaving(true)
    const { data, error: dbError } = await supabase
      .from('events')
      .insert({
        household_id: householdId,
        type,
        title: title.trim(),
        starts_on: startDate,
        ends_on: endDate || null,
        notes: notes.trim() || null,
      })
      .select('id, type, title, starts_on, ends_on, notes')
      .single()
    setSaving(false)
    if (dbError || !data) {
      setError(dbError?.message ?? 'Could not save.')
      return
    }
    onCreated(data as EventRow)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl p-5 pb-8"
        style={{ background: 'var(--paper)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            New entry
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--cream)', color: 'var(--ink)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(TYPE_META) as EventType[]).map(t => {
            const meta = TYPE_META[t]
            const active = type === t
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: active ? meta.color : 'var(--cream)',
                  color: active ? 'white' : 'var(--ink)',
                }}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </button>
            )
          })}
        </div>

        {/* Title */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Title
        </label>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Field trip to the farm"
          className="w-full rounded-2xl px-4 py-3 mb-3 text-base"
          style={{
            background: 'var(--cream)',
            color: 'var(--ink)',
            border: '1.5px solid transparent',
            outline: 'none',
          }}
        />

        {/* Dates */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1"
                   style={{ color: 'var(--ink-muted)' }}>
              Starts
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-base"
              style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1"
                   style={{ color: 'var(--ink-muted)' }}>
              Ends (optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-base"
              style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
            />
          </div>
        </div>

        {/* Notes */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything to remember…"
          className="w-full rounded-2xl px-4 py-3 mb-4 text-base resize-none"
          style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
        />

        {error && (
          <p className="text-sm mb-3" style={{ color: 'var(--rose)' }}>
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-full py-3 font-bold text-base active:scale-[0.98] transition-transform"
          style={{
            background: 'var(--terracotta)',
            color: 'white',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save entry'}
        </button>
      </div>
    </div>
  )
}
