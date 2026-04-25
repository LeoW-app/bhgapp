'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ListKind = 'daily' | 'event' | 'weather'

type ChecklistRow = {
  id: string
  kind: ListKind
  name: string
  description: string | null
}

type ChecklistWithCount = ChecklistRow & { itemCount: number }

const KIND_META: Record<ListKind, { title: string; subtitle: string; emoji: string; color: string }> = {
  daily:   { title: 'Daily routines', subtitle: 'Used on the home screen every day', emoji: '☀️', color: 'var(--terracotta)' },
  event:   { title: 'Event lists',    subtitle: 'For trips, parties, special days', emoji: '🎉', color: 'var(--sage)' },
  weather: { title: 'Weather lists',  subtitle: 'Rainy days, cold days, hot days',  emoji: '🌦️', color: 'var(--sky)' },
}

const KIND_ORDER: ListKind[] = ['daily', 'event', 'weather']

export default function ListsPage() {
  const supabase = createClient()
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [lists, setLists] = useState<ChecklistWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancelled) setLoading(false); return }
      const { data: m } = await supabase
        .from('memberships')
        .select('household_id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!m?.household_id) { if (!cancelled) setLoading(false); return }
      const houseId = m.household_id

      const { data: rawLists } = await supabase
        .from('checklists')
        .select('id, kind, name, description')
        .eq('household_id', houseId)
        .order('name', { ascending: true })

      const listsArr = (rawLists as ChecklistRow[] | null) ?? []
      let withCounts: ChecklistWithCount[] = listsArr.map(l => ({ ...l, itemCount: 0 }))

      if (listsArr.length > 0) {
        const ids = listsArr.map(l => l.id)
        const { data: items } = await supabase
          .from('checklist_items')
          .select('id, checklist_id')
          .in('checklist_id', ids)
        const counts = new Map<string, number>()
        for (const it of items ?? []) {
          counts.set(it.checklist_id, (counts.get(it.checklist_id) ?? 0) + 1)
        }
        withCounts = listsArr.map(l => ({ ...l, itemCount: counts.get(l.id) ?? 0 }))
      }

      if (cancelled) return
      setHouseholdId(houseId)
      setLists(withCounts)
      setLoading(false)
    }
    init()
    return () => { cancelled = true }
  }, [supabase])

  const grouped = useMemo(() => {
    const map: Record<ListKind, ChecklistWithCount[]> = { daily: [], event: [], weather: [] }
    for (const l of lists) map[l.kind].push(l)
    return map
  }, [lists])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>Lists</em>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Checklist templates — daily, event &amp; weather
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="text-sm font-semibold rounded-full px-4 py-2 active:scale-95 transition-transform mt-1"
          style={{ background: 'var(--terracotta)', color: 'white' }}
        >
          + New
        </button>
      </header>

      <div className="flex flex-col gap-6 pb-6">
        {KIND_ORDER.map(kind => {
          const meta = KIND_META[kind]
          const kindLists = grouped[kind]
          return (
            <section key={kind} className="px-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{meta.emoji}</span>
                <div>
                  <h2 className="text-base font-bold leading-tight"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                    {meta.title}
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {meta.subtitle}
                  </p>
                </div>
              </div>

              {kindLists.length === 0 ? (
                <div className="rounded-2xl p-4 text-center" style={{ background: 'var(--cream)' }}>
                  <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    No {meta.title.toLowerCase()} yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {kindLists.map(l => (
                    <Link
                      key={l.id}
                      href={`/lists/${l.id}`}
                      className="flex items-center gap-3 rounded-2xl p-4 active:scale-[0.99] transition-transform"
                      style={{ background: 'var(--paper)', border: '1.5px solid var(--cream)' }}
                    >
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                        style={{ background: meta.color, color: 'white' }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-base truncate" style={{ color: 'var(--ink)' }}>
                          {l.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                          {l.itemCount} {l.itemCount === 1 ? 'item' : 'items'}
                          {l.description ? ` · ${l.description}` : ''}
                        </p>
                      </div>
                      <span style={{ color: 'var(--ink-muted)' }}>›</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {adding && householdId && (
        <NewListSheet
          householdId={householdId}
          onClose={() => setAdding(false)}
          onCreated={(created) => {
            setLists(prev =>
              [...prev, { ...created, itemCount: 0 }].sort((a, b) => a.name.localeCompare(b.name))
            )
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// New list bottom sheet
// ─────────────────────────────────────────────────────────────

function NewListSheet({
  householdId,
  onClose,
  onCreated,
}: {
  householdId: string
  onClose: () => void
  onCreated: (list: ChecklistRow) => void
}) {
  const supabase = createClient()
  const [kind, setKind] = useState<ListKind>('event')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!name.trim()) {
      setError('Please give the list a name.')
      return
    }
    setError(null)
    setSaving(true)
    const { data, error: dbError } = await supabase
      .from('checklists')
      .insert({
        household_id: householdId,
        kind,
        name: name.trim(),
        description: description.trim() || null,
      })
      .select('id, kind, name, description')
      .single()
    setSaving(false)
    if (dbError || !data) {
      setError(dbError?.message ?? 'Could not create the list.')
      return
    }
    onCreated(data as ChecklistRow)
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
            New list
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

        {/* Kind */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Type
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {KIND_ORDER.map(k => {
            const meta = KIND_META[k]
            const active = kind === k
            return (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold active:scale-95 transition-transform"
                style={{
                  background: active ? meta.color : 'var(--cream)',
                  color: active ? 'white' : 'var(--ink)',
                }}
              >
                <span>{meta.emoji}</span>
                <span>{meta.title.replace(' lists', '').replace(' routines', '')}</span>
              </button>
            )
          })}
        </div>

        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Field trip"
          className="w-full rounded-2xl px-4 py-3 mb-3 text-base"
          style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
        />

        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Description (optional)
        </label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="A short note about when this list is used"
          className="w-full rounded-2xl px-4 py-3 mb-4 text-base"
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
          style={{ background: 'var(--terracotta)', color: 'white', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Create list'}
        </button>
      </div>
    </div>
  )
}
