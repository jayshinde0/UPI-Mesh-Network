import { useLocation } from 'react-router-dom'
import { Bell, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useMeshStore } from '../../store/meshStore'
import { formatCurrency } from '../../lib/utils'
import { useEffect } from 'react'

const pageTitles = {
  '/dashboard':    { title: 'Dashboard',         sub: 'Network overview & live stats' },
  '/payment':      { title: 'Send Payment',       sub: 'Inject encrypted payment into mesh' },
  '/transactions': { title: 'Transactions',       sub: 'Your payment history' },
  '/mesh':         { title: 'Mesh Simulator',     sub: 'Gossip protocol simulation' },
  '/topology':     { title: 'Network Topology',   sub: 'Live mesh node visualization' },
  '/encryption':   { title: 'Encryption Lab',     sub: 'AES-256-GCM + RSA-OAEP visualization' },
  '/analytics':    { title: 'Analytics',          sub: 'Network performance metrics' },
  '/logs':         { title: 'Live Logs',          sub: 'Real-time event stream' },
  '/admin':        { title: 'Admin Panel',        sub: 'System management' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const { user, refreshProfile } = useAuthStore()
  const { dashboardStats, fetchDashboard } = useMeshStore()
  const page = pageTitles[pathname] || { title: 'UPI Mesh', sub: '' }

  useEffect(() => {
    fetchDashboard()
    refreshProfile()
  }, [pathname])

  return (
    <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center px-6 gap-4">
      <div className="flex-1">
        <h2 className="text-base font-semibold text-white">{page.title}</h2>
        <p className="text-xs text-gray-500">{page.sub}</p>
      </div>

      {/* Balance chip */}
      {user?.balance != null && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-xs text-gray-400">Balance</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {formatCurrency(user.balance)}
          </span>
        </div>
      )}

      {/* Network health */}
      {dashboardStats && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-xs text-gray-400">Network</span>
          <span className="text-sm font-bold text-cyan-400 font-mono">
            {dashboardStats.networkHealth?.toFixed(0)}%
          </span>
        </div>
      )}

      <button
        onClick={() => { fetchDashboard(); refreshProfile() }}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
      </button>

      <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      </button>
    </header>
  )
}
