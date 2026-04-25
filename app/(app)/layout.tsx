import { TabBar } from '@/components/TabBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Page content scrolls above the fixed tab bar */}
      <main className="flex-1 pb-[80px]">
        {children}
      </main>
      <TabBar />
    </div>
  )
}
