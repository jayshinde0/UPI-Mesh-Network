import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Send,
  History,
  Lock,
  BarChart3,
  ScrollText,
  ShieldCheck,
  LogOut,
  Zap,
  GitBranch,
  Network,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useMeshStore } from '../../store/meshStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/payment', icon: Send, label: 'Send Payment' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/mesh', icon: Network, label: 'Mesh Simulator' },
  { to: '/mesh-topology', icon: GitBranch, label: 'Topology' },
  { to: '/encryption', icon: Lock, label: 'Encryption' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/logs', icon: ScrollText, label: 'Live Logs' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { wsConnected } = useMeshStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0e]">
      <div className="border-b border-white/[0.06] px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
            <Zap className="h-4 w-4 text-cyan-400" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">UPI Mesh</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              Console
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3">
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
            wsConnected
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-zinc-800/80 text-zinc-500'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              wsConnected ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
          />
          {wsConnected ? 'Realtime connected' : 'Realtime offline'}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
              }`
            }
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
            {user?.fullName?.[0] ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{user?.fullName}</p>
            <p className="truncate font-mono text-[10px] text-zinc-600">{user?.upiId}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
