export default function CalendarPage() {
  return (
    <div className="flex flex-col px-5 pt-12">
      <h1 className="text-3xl font-bold italic mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        <em style={{ color: 'var(--terracotta)' }}>Calendar</em>
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-muted)' }}>
        Closures, vacations, absences &amp; events
      </p>
      <div className="rounded-3xl p-8 text-center" style={{ background: 'var(--cream)' }}>
        <p className="text-4xl mb-3">📅</p>
        <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>Coming in the next session</p>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
          Month view with colour-coded days
        </p>
      </div>
    </div>
  )
}
