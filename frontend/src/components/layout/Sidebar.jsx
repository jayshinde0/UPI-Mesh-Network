import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Send, History, Radio, Lock, BarChart3,
  Network, ScrollText, ShieldCheck, LogOut, Wifi, WifiOff, Zap
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useMeshStore } from '../../store/meshStore'

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',    color: 'text-cyan-400' },
  { to: '/payment',     icon: Send,             label: 'Send Payment', color: 'text-purple-400' },
  { to: '/transactions',icon: History,          label: 'Transactions', color: 'text-blue-400' },
  { to: '/mesh',        icon: Radio,            label: 'Mesh Simulator',color: 'text-emerald-400' },
  { to: '/topology',    icon: Network,          label: 'Network Topology', color: 'text-yellow-400' },
  { to: '/encryption',  icon: Lock,             label: 'Encryption',   color: 'text-pink-400' },
  { to: '/analytics',   icon: BarChart3,        label: 'Analytics',    color: 'text-orange-400' },
  { to: '/logs',        icon: ScrollText,       label: 'Live Logs',    color: 'text-red-400' },
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
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 h-full flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">UPI Mesh</h1>
            <p className="text-[10px] text-gray-500 font-mono">OFFLINE NETWORK</p>
          </div>
        </div>
      </div>

      {/* WS Status */}
      <div className="px-4 py-2">
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
          wsConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {wsConnected
            ? <><Wifi className="w-3 h-3" /> Live Connected</>
            : <><WifiOff className="w-3 h-3" /> Disconnected</>
          }
          {wsConnected && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive
                  ? 'bg-white/8 text-white border border-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 ${isActive ? color : 'text-gray-500 group-hover:' + color}`} />
                <span className="font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1 h-4 rounded-full bg-cyan-400"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive ? 'bg-white/8 text-white border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <ShieldCheck className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
            <span className="font-medium">Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.fullName?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-[10px] text-gray-500 font-mono truncate">{user?.upiId}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  )
}
