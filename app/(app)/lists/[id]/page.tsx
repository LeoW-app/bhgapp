'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ListKind = 'daily' | 'event' | 'weather'

type ChecklistRow = {
  id: string
  kind: ListKind
  name: string
  description: string | null
}

type ItemRow = {
  id: string
  emoji: string | null
  title: string
  critical: boolean
  position: number
}

const KIND_LABEL: Record<ListKind, string> = {
  daily: 'Daily routine',
  event: 'Event list',
  weather: 'Weather list',
}

const QUICK_EMOJI = ['👕','👖','🧦','👟','🥾','🧥','🌂','🧤','🎒','💧','🍎','🧴','🩹','🧸','📦','📝','🧴','☂️','🧢']

export default function ListDetailPage() {
  const supabase = createClient()
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const listId = params.id

  const [list, setList] = useState<ChecklistRow | null>(null)
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ItemRow | null>(null)
  const [adding, setAdding] = useState(false)
  const [renamingMeta, setRenamingMeta] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: listData } = await supabase
        .from('checklists')
        .select('id, kind, name, description')
        .eq('id', listId)
        .maybeSingle()
      if (!listData) { if (!cancelled) setLoading(false); return }
      const { data: itemData } = await supabase
        .from('checklist_items')
        .select('id, emoji, title, critical, position')
        .eq('checklist_id', listId)
        .order('position', { ascending: true })
      if (cancelled) return
      setList(listData as ChecklistRow)
      setItems((itemData as ItemRow[] | null) ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [listId, supabase])

  async function handleDeleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('checklist_items').delete().eq('id', id)
  }

  async function handleToggleCritical(item: ItemRow) {
    const next = !item.critical
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, critical: next } : i))
    await supabase.from('checklist_items').update({ critical: next }).eq('id', item.id)
  }

  async function handleDeleteList() {
    if (!list) return
    if (!confirm(`Delete the entire list "${list.name}"? This can't be undone.`)) return
    await supabase.from('checklists').delete().eq('id', list.id)
    router.push('/lists')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="px-5 pt-12">
        <Link href="/lists" className="text-sm font-semibold"
              style={{ color: 'var(--terracotta)' }}>
          ← Back to lists
        </Link>
        <p className="text-base mt-6" style={{ color: 'var(--ink-muted)' }}>
          That list could not be found.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <header className="px-5 pt-12 pb-3">
        <Link href="/lists" className="text-sm font-semibold inline-block mb-3"
              style={{ color: 'var(--terracotta)' }}>
          ← All lists
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider font-semibold"
               style={{ color: 'var(--ink-muted)' }}>
              {KIND_LABEL[list.kind]}
            </p>
            <h1 className="text-3xl font-bold leading-tight mt-1 break-words"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>{list.name}</em>
            </h1>
            {list.description && (
              <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
                {list.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setRenamingMeta(true)}
            className="flex-shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 active:scale-95 transition-transform"
            style={{ background: 'var(--cream)', color: 'var(--ink)' }}
          >
            Edit
          </button>
        </div>
      </header>

      {/* ── Items ── */}
      {items.length === 0 ? (
        <div className="mx-5 rounded-3xl p-8 text-center mb-3"
             style={{ background: 'var(--cream)' }}>
          <p className="text-3xl mb-2">📝</p>
          <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>No items yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
            Tap “+ Add item” below to start filling this list.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col px-5 gap-2 mb-3">
          {items.map(item => (
            <li key={item.id}>
              <div
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: 'var(--paper)', border: '1.5px solid var(--cream)' }}
              >
                <button
                  onClick={() => handleToggleCritical(item)}
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: item.critical ? 'var(--rose)' : 'transparent',
                    border: `2px solid ${item.critical ? 'var(--rose)' : 'var(--ink-muted)'}`,
                  }}
                  aria-label={item.critical ? 'Critical' : 'Not critical'}
                  title={item.critical ? 'Critical' : 'Mark as critical'}
                >
                  {item.critical && (
                    <span className="text-[10px] font-bold" style={{ color: 'white' }}>!</span>
                  )}
                </button>
                <button
                  onClick={() => setEditing(item)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="text-xl flex-shrink-0" style={{ width: 28, textAlign: 'center' }}>
                    {item.emoji ?? '📦'}
                  </span>
                  <span className="flex-1 font-semibold text-base"
                        style={{ color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                    {item.title}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm active:scale-95 transition-transform"
                  style={{ color: 'var(--ink-muted)' }}
                  aria-label="Delete item"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Add button ── */}
      <div className="px-5 mb-6">
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl py-3 font-semibold text-sm active:scale-[0.99] transition-transform"
          style={{ background: 'var(--cream)', color: 'var(--ink)' }}
        >
          + Add item
        </button>
      </div>

      <div className="px-5 mb-6">
        <button
          onClick={handleDeleteList}
          className="w-full rounded-full py-3 font-semibold text-sm active:scale-[0.99] transition-transform"
          style={{ background: 'transparent', color: 'var(--rose)' }}
        >
          Delete this list
        </button>
      </div>

      {adding && (
        <ItemSheet
          listId={list.id}
          item={null}
          nextPosition={items.length}
          onClose={() => setAdding(false)}
          onSaved={(saved) => {
            setItems(prev => [...prev, saved].sort((a, b) => a.position - b.position))
            setAdding(false)
          }}
        />
      )}

      {editing && (
        <ItemSheet
          listId={list.id}
          item={editing}
          nextPosition={editing.position}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems(prev => prev.map(i => i.id === saved.id ? saved : i))
            setEditing(null)
          }}
        />
      )}

      {renamingMeta && (
        <MetaSheet
          list={list}
          onClose={() => setRenamingMeta(false)}
          onSaved={(updated) => {
            setList(updated)
            setRenamingMeta(false)
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Item add/edit sheet
// ─────────────────────────────────────────────────────────────

function ItemSheet({
  listId,
  item,
  nextPosition,
  onClose,
  onSaved,
}: {
  listId: string
  item: ItemRow | null
  nextPosition: number
  onClose: () => void
  onSaved: (item: ItemRow) => void
}) {
  const supabase = createClient()
  const isEdit = item !== null
  const [emoji, setEmoji] = useState(item?.emoji ?? '📦')
  const [title, setTitle] = useState(item?.title ?? '')
  const [critical, setCritical] = useState(item?.critical ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!title.trim()) {
      setError('Please add a title.')
      return
    }
    setError(null)
    setSaving(true)
    const payload = {
      checklist_id: listId,
      emoji: emoji || null,
      title: title.trim(),
      critical,
      position: nextPosition,
    }
    const { data, error: dbError } = isEdit && item
      ? await supabase
          .from('checklist_items')
          .update({ emoji: payload.emoji, title: payload.title, critical: payload.critical })
          .eq('id', item.id)
          .select('id, emoji, title, critical, position')
          .single()
      : await supabase
          .from('checklist_items')
          .insert(payload)
          .select('id, emoji, title, critical, position')
          .single()
    setSaving(false)
    if (dbError || !data) {
      setError(dbError?.message ?? 'Could not save the item.')
      return
    }
    onSaved(data as ItemRow)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--paper)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            {isEdit ? 'Edit item' : 'New item'}
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

        {/* Title */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Title
        </label>
        <input
          autoFocus={!isEdit}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Spare clothes"
          className="w-full rounded-2xl px-4 py-3 mb-3 text-base"
          style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
        />

        {/* Emoji */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Icon
        </label>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {QUICK_EMOJI.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg active:scale-90 transition-transform"
              style={{ background: emoji === e ? 'var(--terracotta)' : 'var(--cream)' }}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Critical */}
        <button
          onClick={() => setCritical(c => !c)}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 active:scale-[0.99] transition-transform"
          style={{
            background: critical ? 'var(--cream)' : 'var(--paper)',
            border: `1.5px solid ${critical ? 'var(--rose)' : 'var(--cream)'}`,
          }}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
               style={{
                 background: critical ? 'var(--rose)' : 'transparent',
                 border: `2px solid ${critical ? 'var(--rose)' : 'var(--ink-muted)'}`,
               }}>
            {critical && <span className="text-[10px] font-bold" style={{ color: 'white' }}>!</span>}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
              Mark as critical
            </p>
            <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              Shows a red dot until checked off
            </p>
          </div>
        </button>

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
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// List meta (rename / description) sheet
// ─────────────────────────────────────────────────────────────

function MetaSheet({
  list,
  onClose,
  onSaved,
}: {
  list: ChecklistRow
  onClose: () => void
  onSaved: (list: ChecklistRow) => void
}) {
  const supabase = createClient()
  const [name, setName] = useState(list.name)
  const [description, setDescription] = useState(list.description ?? '')
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
      .update({ name: name.trim(), description: description.trim() || null })
      .eq('id', list.id)
      .select('id, kind, name, description')
      .single()
    setSaving(false)
    if (dbError || !data) {
      setError(dbError?.message ?? 'Could not save changes.')
      return
    }
    onSaved(data as ChecklistRow)
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
            Edit list
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

        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
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
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
