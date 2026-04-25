'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'

type ItemRow = {
  id: string
  emoji: string | null
  title: string
  critical: boolean
  position: number
  checked: boolean
  checkerColor: string | null
  checkerName: string | null
}

type MemberInfo = { display_name: string | null; avatar_color: string | null }

type EventType = 'closure' | 'vacation' | 'absence' | 'event' | 'note'

type WeekEvent = {
  id: string
  type: EventType
  title: string
  starts_on: string
  ends_on: string | null
}

const EVENT_META: Record<EventType, { label: string; color: string; emoji: string }> = {
  closure:  { label: 'Closure',  color: 'var(--rose)',     emoji: '🚫' },
  vacation: { label: 'Vacation', color: 'var(--sun)',      emoji: '🌴' },
  absence:  { label: 'Absence',  color: 'var(--lavender)', emoji: '🤒' },
  event:    { label: 'Event',    color: 'var(--sage)',     emoji: '🎉' },
  note:     { label: 'Note',     color: 'var(--sky)',      emoji: '📝' },
}

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

function thisWeekRange(now: Date) {
  // Monday → Sunday (matches the calendar grid)
  const day = now.getDay() // 0 = Sun
  const offset = (day + 6) % 7
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(now.getDate() - offset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { from: ymd(monday), to: ymd(sunday) }
}

function shortDateRange(start: string, end: string | null) {
  if (!end || end === start) {
    return parseYmd(start).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
  }
  const s = parseYmd(start).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
  const e = parseYmd(end).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
  return `${s} – ${e}`
}

function todayDate() {
  return new Date().toISOString().split('T')[0]
}

function greetingPhrase(name: string) {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 18) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

export default function TodayPage() {
  const supabase = createClient()
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [myColor, setMyColor] = useState('#C66B3D')
  const [myName, setMyName] = useState('You')
  const [childName, setChildName] = useState('your child')
  const [noChecklist, setNoChecklist] = useState(false)
  const [weekEvents, setWeekEvents] = useState<WeekEvent[]>([])

  const loadChecklist = useCallback(
    async (houseId: string, uid: string, memberMap: Record<string, MemberInfo>) => {
      const today = todayDate()

      const { data: checklists } = await supabase
        .from('checklists')
        .select('id')
        .eq('household_id', houseId)
        .eq('kind', 'daily')

      if (!checklists || checklists.length === 0) {
        setNoChecklist(true)
        setLoading(false)
        return
      }

      const checklistIds = checklists.map(c => c.id)

      const { data: rawItems } = await supabase
        .from('checklist_items')
        .select('id, emoji, title, critical, position')
        .in('checklist_id', checklistIds)
        .order('position')

      if (!rawItems) { setLoading(false); return }

      const itemIds = rawItems.map(i => i.id)

      const { data: states } = await supabase
        .from('check_states')
        .select('item_id, checked_by')
        .eq('household_id', houseId)
        .eq('on_date', today)
        .in('item_id', itemIds)

      const stateMap = new Map((states || []).map(s => [s.item_id, s.checked_by as string]))

      setItems(
        rawItems.map(item => {
          const checkerId = stateMap.get(item.id)
          const checker = checkerId ? memberMap[checkerId] : null
          return {
            id: item.id,
            emoji: item.emoji,
            title: item.title,
            critical: item.critical,
            position: item.position,
            checked: stateMap.has(item.id),
            checkerColor: checker?.avatar_color ?? null,
            checkerName: checker?.display_name ?? null,
          }
        })
      )
      setLoading(false)
    },
    [supabase]
  )

  useEffect(() => {
    let memberMap: Record<string, MemberInfo> = {}

    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: membership } = await supabase
        .from('memberships')
        .select('household_id, avatar_color, display_name')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!membership) {
        // User has no household yet — send them to setup
        window.location.href = '/setup'
        return
      }

      const houseId = membership.household_id
      setHouseholdId(houseId)
      setMyColor(membership.avatar_color ?? '#C66B3D')
      setMyName(membership.display_name ?? 'You')

      const { data: household } = await supabase
        .from('households')
        .select('child_name')
        .eq('id', houseId)
        .maybeSingle()

      if (household?.child_name) setChildName(household.child_name)

      // Build member lookup for avatar colours
      const { data: members } = await supabase
        .from('memberships')
        .select('user_id, display_name, avatar_color')
        .eq('household_id', houseId)

      memberMap = Object.fromEntries(
        (members ?? []).map(m => [m.user_id, { display_name: m.display_name, avatar_color: m.avatar_color }])
      )

      await loadChecklist(houseId, user.id, memberMap)

      // Events for this week
      const { from, to } = thisWeekRange(new Date())
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, type, title, starts_on, ends_on')
        .eq('household_id', houseId)
        .or(`and(starts_on.lte.${to},ends_on.gte.${from}),and(starts_on.lte.${to},ends_on.is.null,starts_on.gte.${from})`)
        .order('starts_on', { ascending: true })
      setWeekEvents((eventsData as WeekEvent[] | null) ?? [])

      // Realtime subscription
      const channel = supabase
        .channel(`check_states:${houseId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'check_states', filter: `household_id=eq.${houseId}` },
          () => loadChecklist(houseId, user.id, memberMap)
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    bootstrap()
  }, [supabase, loadChecklist])

  async function toggleItem(id: string, checked: boolean) {
    if (!householdId || !userId) return
    const today = todayDate()

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, checked: !checked, checkerColor: !checked ? myColor : null, checkerName: !checked ? myName : null }
        : item
    ))

    if (checked) {
      await supabase.from('check_states').delete().eq('item_id', id).eq('on_date', today)
    } else {
      await supabase.from('check_states').upsert({
        household_id: householdId,
        item_id: id,
        on_date: today,
        checked_by: userId,
        checked_at: new Date().toISOString(),
      })
    }
  }

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length
  const allDone = totalCount > 0 && checkedCount === totalCount
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  const greeting = greetingPhrase(myName)
  const [greetBase, greetHighlight] = greeting.split(', ')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-4">
        <p className="text-base font-medium" style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl font-bold mt-1 leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          {greetBase},{' '}
          <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>{greetHighlight}</em>
        </h1>
      </header>

      {/* ── Progress card ── */}
      <div className="mx-5 mb-4 rounded-3xl p-5"
           style={{ background: allDone ? 'var(--sage)' : 'var(--cream)' }}>
        {allDone ? (
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎉</span>
            <div>
              <p className="font-bold text-lg leading-tight" style={{ color: 'white', fontFamily: 'var(--font-display)' }}>
                All packed!
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {childName} is ready to go.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                  {checkedCount} <span className="text-base font-medium" style={{ color: 'var(--ink-muted)' }}>
                    of {totalCount} packed
                  </span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                  for {childName}
                </p>
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--terracotta)' }}>
                {Math.round(progress)}%
              </p>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'var(--terracotta)' }}
              />
            </div>
          </>
        )}
      </div>

      {/* ── This week ── */}
      {weekEvents.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between px-5 mb-2">
            <h2 className="text-base font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              This week
            </h2>
            <Link
              href="/calendar"
              className="text-xs font-semibold"
              style={{ color: 'var(--terracotta)' }}
            >
              See all →
            </Link>
          </div>
          <div className="flex gap-2 px-5 overflow-x-auto pb-1"
               style={{ scrollbarWidth: 'none' }}>
            {weekEvents.map(ev => {
              const meta = EVENT_META[ev.type]
              return (
                <Link
                  key={ev.id}
                  href="/calendar"
                  className="flex-shrink-0 rounded-2xl px-3 py-2.5 flex items-center gap-2.5"
                  style={{
                    background: 'var(--paper)',
                    border: '1.5px solid var(--cream)',
                    minWidth: 180,
                    maxWidth: 240,
                  }}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base"
                    style={{ background: meta.color, color: 'white' }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-tight truncate"
                       style={{ color: 'var(--ink)' }}>
                      {ev.title}
                    </p>
                    <p className="text-[11px] mt-0.5"
                       style={{ color: 'var(--ink-muted)' }}>
                      {shortDateRange(ev.starts_on, ev.ends_on)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Checklist ── */}
      {noChecklist ? (
        <div className="mx-5 p-6 rounded-3xl text-center" style={{ background: 'var(--cream)' }}>
          <p className="text-2xl mb-2">📋</p>
          <p className="font-semibold" style={{ color: 'var(--ink)' }}>No checklist yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Go to Lists to create one.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col px-5 gap-2">
          {items.map(item => (
            <li key={item.id}>
              <button
                onClick={() => toggleItem(item.id, item.checked)}
                className="w-full flex items-center gap-4 rounded-2xl px-4 transition-all active:scale-[0.98]"
                style={{
                  minHeight: 64,
                  background: item.checked ? 'var(--cream)' : 'var(--paper)',
                  border: `1.5px solid ${item.checked ? 'transparent' : 'var(--cream)'}`,
                }}
              >
                {/* Check circle */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full transition-all"
                  style={{
                    width: 28,
                    height: 28,
                    background: item.checked ? 'var(--sage)' : 'transparent',
                    border: `2px solid ${item.checked ? 'var(--sage)' : 'var(--ink-muted)'}`,
                  }}
                >
                  {item.checked && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Emoji */}
                <span className="text-xl flex-shrink-0" style={{ width: 28, textAlign: 'center' }}>
                  {item.emoji ?? '📦'}
                </span>

                {/* Title + critical dot */}
                <span
                  className="flex-1 text-left font-semibold text-base"
                  style={{
                    color: item.checked ? 'var(--ink-muted)' : 'var(--ink)',
                    textDecoration: item.checked ? 'line-through' : 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {item.title}
                </span>

                {/* Critical dot (only when unchecked) */}
                {item.critical && !item.checked && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                       style={{ background: 'var(--rose)' }} />
                )}

                {/* Checker avatar */}
                {item.checked && item.checkerColor && (
                  <Avatar
                    name={item.checkerName ?? '?'}
                    color={item.checkerColor}
                    size={28}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Bottom spacer so last item isn't hidden behind tab bar */}
      <div className="h-6" />
    </div>
  )
}
