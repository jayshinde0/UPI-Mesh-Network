import PublicNavbar from './PublicNavbar'

export default function AuthShell({ children, aside }) {
  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <div className="pointer-events-none fixed inset-0 cyber-grid-bg opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,0.12),transparent)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicNavbar />

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:flex-row lg:items-stretch lg:gap-12 lg:py-12">
          {aside && (
            <aside className="mb-10 lg:mb-0 lg:flex lg:w-[44%] lg:flex-col lg:justify-center">
              {aside}
            </aside>
          )}
          <div className={`flex flex-col justify-center ${aside ? 'lg:w-[56%]' : 'mx-auto w-full max-w-md'}`}>
            {children}
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/[0.06] py-4 text-center text-xs text-zinc-600">
          Educational simulation · Not affiliated with NPCI or real UPI
        </footer>
      </div>
    </div>
  )
}
