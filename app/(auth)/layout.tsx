export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
         style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2"
             style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)' }}>
            Kindergarten Planner
          </p>
          <h1 className="text-4xl font-bold italic leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Good to see<br />
            <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>you.</em>
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}
