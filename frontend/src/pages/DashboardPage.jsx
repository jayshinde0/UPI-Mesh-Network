import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMeshStore } from '../store/meshStore'
import { useAuthStore } from '../store/authStore'
import { formatCurrency, getStatusBg, formatDate } from '../lib/utils'
import { Button } from '../components/ui/button'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  Shield,
  Copy,
  AlertTriangle,
  Radio,
  Wifi,
  Users,
  Clock,
  ArrowRight,
  Send,
} from 'lucide-react'

const METRICS = [
  { key: 'totalTransactions', label: 'Transactions', icon: TrendingUp },
  { key: 'settledTransactions', label: 'Settled', icon: Shield },
  { key: 'duplicatePackets', label: 'Dupes blocked', icon: Copy },
  { key: 'tamperedPackets', label: 'Tampered', icon: AlertTriangle },
  { key: 'activeDevices', label: 'Active nodes', icon: Radio },
  { key: 'onlineBridgeDevices', label: 'Bridges', icon: Wifi },
  { key: 'totalUsers', label: 'Users', icon: Users },
  { key: 'pendingPackets', label: 'Pending', icon: Clock },
]

function MetricCell({ label, value, icon: Icon }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <Icon className="h-4 w-4 shrink-0 text-zinc-600" />
        <span className="font-mono text-lg font-semibold tabular-nums text-white">
          {value ?? 0}
        </span>
      </div>
      <p className="mt-2 text-xs text-zinc-500">{label}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#121218] px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-500">{label}</p>
      <p className="mt-0.5 font-mono font-medium text-cyan-400">{payload[0]?.value} txns</p>
    </div>
  )
}

export default function DashboardPage() {
  const { dashboardStats, fetchDashboard, liveEvents } = useMeshStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchDashboard()
  }, [])

  const stats = dashboardStats
  const chartData =
    stats?.transactionsPerMinute?.map((d) => ({
      time: d.time?.slice(11, 16) ?? '',
      count: Number(d.count),
    })) ?? []

  const firstName = user?.fullName?.split(' ')[0] ?? 'there'
  const health = stats?.networkHealth ?? 0

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Hello, {firstName}
          </h2>
          <p className="mt-1 font-mono text-sm text-zinc-600">{user?.upiId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/payment">
            <Button size="sm" className="gap-2">
              <Send className="h-4 w-4" />
              New payment
            </Button>
          </Link>
          <Link to="/mesh">
            <Button variant="secondary" size="sm" className="gap-2">
              Open mesh
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Balance + health */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0c12] p-5 lg:col-span-3">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
            Available balance
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {formatCurrency(user?.balance ?? 0)}
          </p>
          {user?.accountNumber && (
            <p className="mt-2 font-mono text-xs text-zinc-600">{user.accountNumber}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c0c12] p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
              Network health
            </p>
            <span className="font-mono text-sm font-semibold text-cyan-400">
              {health.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(health, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-cyan-500"
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            Share of mesh devices online. Flush bridge nodes before settling offline payments.
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c12]">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h3 className="text-sm font-medium text-white">Network metrics</h3>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06] sm:grid-cols-4">
          {METRICS.map(({ key, label, icon }) => (
            <MetricCell
              key={key}
              label={label}
              value={stats?.[key]}
              icon={icon}
            />
          ))}
        </div>
      </div>

      {/* Chart + events */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0c12] lg:col-span-2">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <h3 className="text-sm font-medium text-white">Transactions per minute</h3>
          </div>
          <div className="p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#71717a', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#txGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-zinc-500">No chart data yet</p>
                <Link to="/payment" className="text-xs font-medium text-cyan-400 hover:underline">
                  Send your first payment →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c0c12]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h3 className="text-sm font-medium text-white">Live events</h3>
            <Link to="/logs" className="text-xs text-cyan-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {liveEvents.length === 0 ? (
              <p className="px-4 py-10 text-center text-xs text-zinc-600">
                Events appear when packets move through the mesh.
              </p>
            ) : (
              liveEvents.slice(0, 15).map((ev, i) => (
                <div
                  key={i}
                  className="flex gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      ev.type === 'SETTLEMENT'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : ev.type === 'TAMPER'
                          ? 'bg-red-500/15 text-red-400'
                          : ev.type === 'BRIDGE'
                            ? 'bg-violet-500/15 text-violet-400'
                            : 'bg-cyan-500/15 text-cyan-400'
                    }`}
                  >
                    {ev.type?.slice(0, 4) ?? 'EVT'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-zinc-300">
                      {ev.packetHash?.slice(0, 14) ?? ev.bridgeDevice ?? ev.status ?? '—'}
                    </p>
                    <p className="text-[10px] text-zinc-600">{ev.ts?.slice(11, 19)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      {stats?.recentTransactions?.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0c12]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h3 className="text-sm font-medium text-white">Recent transactions</h3>
            <Link to="/transactions" className="text-xs text-cyan-400 hover:underline">
              Full history
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-600">
                  {['Sender', 'Receiver', 'Amount', 'Status', 'Time'].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{t.senderUpiId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{t.receiverUpiId}</td>
                    <td className="px-4 py-3 font-mono text-sm font-medium text-white">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${getStatusBg(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
