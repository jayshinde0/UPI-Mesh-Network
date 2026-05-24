import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMeshStore } from '../store/meshStore'
import { useAuthStore } from '../store/authStore'
import { formatCurrency, getStatusBg, formatDate } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, Shield, Copy, AlertTriangle, Radio, Wifi,
  Users, Clock, Activity, Zap
} from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, sub, glow }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className={`glass cyber-border rounded-xl p-5 ${glow}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg ${color.replace('text-','bg-').replace('400','500/10')} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className={`text-2xl font-black font-mono ${color}`}>{value}</span>
    </div>
    <p className="text-sm font-medium text-white">{title}</p>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </motion.div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass cyber-border rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-cyan-400 font-mono font-bold">{payload[0]?.value} txns</p>
    </div>
  )
}

export default function DashboardPage() {
  const { dashboardStats, fetchDashboard, liveEvents, wsConnected } = useMeshStore()
  const { user } = useAuthStore()

  useEffect(() => { fetchDashboard() }, [])

  const stats = dashboardStats
  const chartData = stats?.transactionsPerMinute?.map(d => ({
    time: d.time?.slice(11, 16) ?? '',
    count: Number(d.count),
  })) ?? []

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-mono">{user?.upiId}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className={wsConnected ? 'text-emerald-400' : 'text-red-400'}>
            {wsConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </motion.div>

      {/* Balance hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent border border-cyan-500/20"
      >
        <div className="absolute inset-0 cyber-grid-bg opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Available Balance</p>
            <p className="text-4xl font-black text-white font-mono">
              {formatCurrency(user?.balance ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-mono">{user?.accountNumber}</p>
          </div>
          <div className="text-right">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.3)]">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        {/* Network health bar */}
        {stats && (
          <div className="relative z-10 mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Network Health</span>
              <span className="text-cyan-400 font-mono">{stats.networkHealth?.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.networkHealth ?? 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Transactions" value={stats?.totalTransactions ?? 0}
          icon={TrendingUp} color="text-cyan-400" sub="All time" glow="glow-blue" />
        <StatCard title="Settled" value={stats?.settledTransactions ?? 0}
          icon={Shield} color="text-emerald-400" sub="Successfully processed" glow="glow-green" />
        <StatCard title="Duplicates Blocked" value={stats?.duplicatePackets ?? 0}
          icon={Copy} color="text-orange-400" sub="Idempotency protection" />
        <StatCard title="Tampered Rejected" value={stats?.tamperedPackets ?? 0}
          icon={AlertTriangle} color="text-red-400" sub="Hash mismatch" glow="glow-red" />
        <StatCard title="Active Devices" value={stats?.activeDevices ?? 0}
          icon={Radio} color="text-purple-400" sub="Online mesh nodes" glow="glow-purple" />
        <StatCard title="Bridge Nodes" value={stats?.onlineBridgeDevices ?? 0}
          icon={Wifi} color="text-blue-400" sub="Internet-connected" />
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0}
          icon={Users} color="text-pink-400" sub="Registered accounts" />
        <StatCard title="Pending Packets" value={stats?.pendingPackets ?? 0}
          icon={Clock} color="text-yellow-400" sub="In propagation" />
      </div>

      {/* Chart + Live feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Transactions per Minute
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2}
                    fill="url(#txGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                No transaction data yet. Send a payment to see live charts.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live events */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[220px] overflow-y-auto">
              {liveEvents.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">Waiting for events...</p>
              ) : (
                liveEvents.slice(0, 20).map((ev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 px-4 py-2 border-b border-white/5 last:border-0"
                  >
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      ev.type === 'SETTLEMENT' ? 'bg-emerald-500/20 text-emerald-400' :
                      ev.type === 'TAMPER'     ? 'bg-red-500/20 text-red-400' :
                      ev.type === 'BRIDGE'     ? 'bg-purple-500/20 text-purple-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>{ev.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 truncate font-mono">
                        {ev.packetHash?.slice(0,12) ?? ev.bridgeDevice ?? ev.status ?? '—'}
                      </p>
                      <p className="text-[10px] text-gray-600">{ev.ts?.slice(11,19)}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      {stats?.recentTransactions?.length > 0 && (
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Sender','Receiver','Amount','Status','Time'].map(h => (
                      <th key={h} className="text-left px-4 py-2 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransactions.map((t, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-2 font-mono text-cyan-400">{t.senderUpiId}</td>
                      <td className="px-4 py-2 font-mono text-purple-400">{t.receiverUpiId}</td>
                      <td className="px-4 py-2 font-mono text-white font-semibold">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBg(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
