import { Link, useLocation } from 'react-router-dom'
import { RefreshCw, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useMeshStore } from '../../store/meshStore'
import { formatCurrency } from '../../lib/utils'
import { useEffect } from 'react'
import { Button } from '../ui/button'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview' },
  '/payment': { title: 'Send Payment', sub: 'Payments' },
  '/transactions': { title: 'Transactions', sub: 'Payments' },
  '/mesh': { title: 'Mesh Simulator', sub: 'Network' },
  '/topology': { title: 'Network Topology', sub: 'Network' },
  '/encryption': { title: 'Encryption Lab', sub: 'Security' },
  '/analytics': { title: 'Analytics', sub: 'Insights' },
  '/logs': { title: 'Live Logs', sub: 'Network' },
  '/admin': { title: 'Admin Panel', sub: 'System' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { user, refreshProfile } = useAuthStore()
  const { dashboardStats, fetchDashboard, wsConnected } = useMeshStore()
  const page = pageTitles[pathname] || { title: 'UPI Mesh', sub: '' }

  useEffect(() => {
    fetchDashboard()
    refreshProfile()
  }, [pathname])

  const refresh = () => {
    fetchDashboard()
    refreshProfile()
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0a0a0e]/95 px-5 backdrop-blur-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <span>{page.sub}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-500">{page.title}</span>
        </div>
        <h1 className="truncate text-base font-semibold tracking-tight text-white">
          {page.title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {pathname === '/dashboard' && (
          <Link to="/payment" className="hidden sm:block">
            <Button size="sm" className="h-8">
              Send payment
            </Button>
          </Link>
        )}

        {user?.balance != null && (
          <div className="hidden items-baseline gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 md:flex">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Balance
            </span>
            <span className="font-mono text-sm font-semibold text-white">
              {formatCurrency(user.balance)}
            </span>
          </div>
        )}

        {dashboardStats && (
          <div className="hidden items-baseline gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 lg:flex">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Mesh
            </span>
            <span className="font-mono text-sm font-semibold text-cyan-400">
              {dashboardStats.networkHealth?.toFixed(0)}%
            </span>
          </div>
        )}

        <div
          className="hidden items-center gap-1.5 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-xs sm:flex"
          title={wsConnected ? 'WebSocket connected' : 'WebSocket disconnected'}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              wsConnected ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
          />
          <span className="text-zinc-500">{wsConnected ? 'Live' : 'Offline'}</span>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-white"
          aria-label="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
