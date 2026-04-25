'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ItemRow = {
  id: string
  name: string
  emoji: string | null
  bg_color: string | null
  category: string | null
  quantity: number
  min_quantity: number
  notes: string | null
}

const DEFAULT_BG = '#F5EFE4'

const TILE_COLORS = [
  '#F5EFE4', // cream
  '#FBE2D2', // peach
  '#E8E2D0', // sand
  '#D9E5DD', // mint
  '#E5DCE8', // lavender
  '#E0E8EC', // sky
  '#F4E4C8', // pale gold
  '#F0DCDC', // blush
]

const QUICK_EMOJI = ['👕','👖','🧦','👟','🥾','🧥','🌂','🧤','🎒','💧','🍎','🧴','🩹','🧸','☂️','👒','🩳','🧢','🧴','🪥','🧻']

const DEFAULT_CATEGORIES = ['Clothes', 'Shoes', 'Outerwear', 'Supplies', 'Other']

export default function InventoryPage() {
  const supabase = createClient()
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [items, setItems] = useState<ItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [editing, setEditing] = useState<ItemRow | null>(null)
  const [adding, setAdding] = useState(false)

  // Bootstrap household + initial items
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
      const { data } = await supabase
        .from('inventory_items')
        .select('id, name, emoji, bg_color, category, quantity, min_quantity, notes')
        .eq('household_id', houseId)
        .order('name', { ascending: true })
      if (cancelled) return
      setHouseholdId(houseId)
      setItems((data as ItemRow[] | null) ?? [])
      setLoading(false)
    }
    init()
    return () => { cancelled = true }
  }, [supabase])

  // Realtime subscription
  useEffect(() => {
    if (!householdId) return
    const channel = supabase
      .channel(`inventory_items:${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items', filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as { id?: string }).id
            if (oldId) setItems(prev => prev.filter(i => i.id !== oldId))
            return
          }
          const row = payload.new as ItemRow
          setItems(prev => {
            const exists = prev.some(i => i.id === row.id)
            const next = exists
              ? prev.map(i => i.id === row.id ? row : i)
              : [...prev, row]
            return next.sort((a, b) => a.name.localeCompare(b.name))
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [householdId, supabase])

  const categories = useMemo(() => {
    const present = new Set(items.map(i => i.category).filter(Boolean) as string[])
    return ['All', ...Array.from(present).sort()]
  }, [items])

  const visibleItems = useMemo(() => {
    if (activeCategory === 'All') return items
    return items.filter(i => i.category === activeCategory)
  }, [items, activeCategory])

  const lowStockCount = items.filter(i => i.quantity < i.min_quantity).length

  async function adjustQuantity(item: ItemRow, delta: number) {
    const newQty = Math.max(0, item.quantity + delta)
    if (newQty === item.quantity) return
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i))
    await supabase
      .from('inventory_items')
      .update({ quantity: newQty, last_verified_at: new Date().toISOString() })
      .eq('id', item.id)
  }

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
      <header className="px-5 pt-12 pb-3">
        <h1 className="text-3xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>Inventory</em>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          What&apos;s already at the kindergarten
        </p>
      </header>

      {/* ── Stats card ── */}
      {items.length > 0 && (
        <div className="mx-5 mb-3 rounded-3xl p-4 flex items-center justify-between"
             style={{ background: lowStockCount > 0 ? 'var(--cream)' : 'var(--cream)' }}>
          <div>
            <p className="text-2xl font-bold leading-none"
               style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
              {items.length} <span className="text-sm font-medium"
                                   style={{ color: 'var(--ink-muted)' }}>items</span>
            </p>
            {lowStockCount > 0 && (
              <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--rose)' }}>
                {lowStockCount} running low
              </p>
            )}
          </div>
          <button
            onClick={() => setAdding(true)}
            className="text-sm font-semibold rounded-full px-4 py-2 active:scale-95 transition-transform"
            style={{ background: 'var(--terracotta)', color: 'white' }}
          >
            + Add
          </button>
        </div>
      )}

      {/* ── Category filter ── */}
      {categories.length > 1 && (
        <div className="mb-3">
          <div className="flex gap-2 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => {
              const active = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex-shrink-0 text-sm font-semibold rounded-full px-4 py-2 transition-all active:scale-95"
                  style={{
                    background: active ? 'var(--ink)' : 'var(--cream)',
                    color: active ? 'white' : 'var(--ink)',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {items.length === 0 ? (
        <div className="mx-5 rounded-3xl p-8 text-center" style={{ background: 'var(--cream)' }}>
          <p className="text-4xl mb-3">🗄️</p>
          <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>Nothing tracked yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--ink-muted)' }}>
            Add spare clothes, shoes, or supplies you keep at the kindergarten.
          </p>
          <button
            onClick={() => setAdding(true)}
            className="text-sm font-semibold rounded-full px-5 py-2.5 active:scale-95 transition-transform"
            style={{ background: 'var(--terracotta)', color: 'white' }}
          >
            + Add first item
          </button>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="mx-5 rounded-3xl p-6 text-center" style={{ background: 'var(--cream)' }}>
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            No items in {activeCategory}.
          </p>
        </div>
      ) : (
        <div className="mx-5 grid grid-cols-2 gap-3 pb-6">
          {visibleItems.map(item => {
            const isOut = item.quantity === 0
            const isLow = item.quantity > 0 && item.quantity < item.min_quantity
            return (
              <div
                key={item.id}
                className="rounded-3xl p-4 flex flex-col gap-3"
                style={{
                  background: item.bg_color ?? DEFAULT_BG,
                  minHeight: 168,
                }}
              >
                <button
                  onClick={() => setEditing(item)}
                  className="flex-1 flex flex-col items-start gap-2 text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-3xl leading-none">{item.emoji ?? '📦'}</span>
                    {(isOut || isLow) && (
                      <span
                        className="text-[10px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide"
                        style={{
                          background: isOut ? 'var(--rose)' : 'var(--sun)',
                          color: 'white',
                        }}
                      >
                        {isOut ? 'Out' : 'Low'}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm leading-tight"
                     style={{ color: 'var(--ink)' }}>
                    {item.name}
                  </p>
                </button>

                {/* Stepper */}
                <div className="flex items-center justify-between rounded-full px-1 py-1"
                     style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <button
                    onClick={() => adjustQuantity(item, -1)}
                    disabled={item.quantity === 0}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold active:scale-90 transition-transform"
                    style={{
                      background: 'transparent',
                      color: item.quantity === 0 ? 'var(--ink-muted)' : 'var(--ink)',
                      opacity: item.quantity === 0 ? 0.4 : 1,
                    }}
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <span className="font-bold text-lg leading-none"
                        style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => adjustQuantity(item, 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold active:scale-90 transition-transform"
                    style={{ background: 'var(--ink)', color: 'white' }}
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(adding || editing) && householdId && (
        <ItemSheet
          householdId={householdId}
          item={editing}
          onClose={() => { setAdding(false); setEditing(null) }}
          onSaved={() => { setAdding(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Add / edit bottom sheet
// ─────────────────────────────────────────────────────────────

function ItemSheet({
  householdId,
  item,
  onClose,
  onSaved,
}: {
  householdId: string
  item: ItemRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const isEdit = item !== null

  const [name, setName] = useState(item?.name ?? '')
  const [emoji, setEmoji] = useState(item?.emoji ?? '📦')
  const [bgColor, setBgColor] = useState(item?.bg_color ?? DEFAULT_BG)
  const [category, setCategory] = useState(item?.category ?? 'Clothes')
  const [quantity, setQuantity] = useState(item?.quantity ?? 1)
  const [minQty, setMinQty] = useState(item?.min_quantity ?? 1)
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!name.trim()) {
      setError('Please add a name.')
      return
    }
    setError(null)
    setSaving(true)

    const payload = {
      household_id: householdId,
      name: name.trim(),
      emoji: emoji || null,
      bg_color: bgColor,
      category: category || null,
      quantity,
      min_quantity: Math.max(0, minQty),
      notes: notes.trim() || null,
      last_verified_at: new Date().toISOString(),
    }

    const { error: dbError } = isEdit && item
      ? await supabase.from('inventory_items').update(payload).eq('id', item.id)
      : await supabase.from('inventory_items').insert(payload)

    setSaving(false)
    if (dbError) {
      setError(dbError.message)
      return
    }
    onSaved()
  }

  async function remove() {
    if (!item) return
    if (!confirm(`Delete "${item.name}"?`)) return
    setSaving(true)
    await supabase.from('inventory_items').delete().eq('id', item.id)
    setSaving(false)
    onSaved()
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

        {/* Preview */}
        <div className="flex items-center gap-3 mb-4 rounded-2xl p-3"
             style={{ background: bgColor }}>
          <span className="text-3xl">{emoji}</span>
          <p className="font-bold text-base flex-1 truncate"
             style={{ color: 'var(--ink)' }}>
            {name || 'Item name'}
          </p>
        </div>

        {/* Name */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Name
        </label>
        <input
          autoFocus={!isEdit}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Spare pants"
          className="w-full rounded-2xl px-4 py-3 mb-3 text-base"
          style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
        />

        {/* Emoji picker */}
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
              style={{
                background: emoji === e ? 'var(--terracotta)' : 'var(--cream)',
              }}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Tile colour
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {TILE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setBgColor(c)}
              className="w-9 h-9 rounded-full active:scale-90 transition-transform"
              style={{
                background: c,
                border: bgColor === c
                  ? '3px solid var(--ink)'
                  : '2px solid var(--cream)',
              }}
              aria-label={`Colour ${c}`}
            />
          ))}
        </div>

        {/* Category */}
        <label className="block text-xs font-semibold mb-1"
               style={{ color: 'var(--ink-muted)' }}>
          Category
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {DEFAULT_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="text-sm font-semibold rounded-full px-3 py-1.5 active:scale-95 transition-transform"
              style={{
                background: category === c ? 'var(--ink)' : 'var(--cream)',
                color: category === c ? 'white' : 'var(--ink)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Quantity + min */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1"
                   style={{ color: 'var(--ink-muted)' }}>
              Quantity
            </label>
            <input
              type="number"
              min={0}
              value={quantity}
              onChange={e => setQuantity(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-2xl px-4 py-3 text-base"
              style={{ background: 'var(--cream)', color: 'var(--ink)', outline: 'none' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1"
                   style={{ color: 'var(--ink-muted)' }}>
              Min before low
            </label>
            <input
              type="number"
              min={0}
              value={minQty}
              onChange={e => setMinQty(Math.max(0, Number(e.target.value)))}
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
          rows={2}
          placeholder="Size, colour, where it's stored…"
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
          className="w-full rounded-full py-3 font-bold text-base active:scale-[0.98] transition-transform mb-2"
          style={{
            background: 'var(--terracotta)',
            color: 'white',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
        </button>

        {isEdit && (
          <button
            onClick={remove}
            disabled={saving}
            className="w-full rounded-full py-3 font-semibold text-sm active:scale-[0.98] transition-transform"
            style={{ background: 'transparent', color: 'var(--rose)' }}
          >
            Delete item
          </button>
        )}
      </div>
    </div>
  )
}
