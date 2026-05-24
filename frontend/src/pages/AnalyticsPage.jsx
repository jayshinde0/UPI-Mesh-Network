import { useEffect, useState } from 'react'
import { analyticsApi } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { formatCurrency } from '../lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react'

const COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass cyber-border rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [network, setNetwork] = useState(null)
  const [topSenders, setTopSenders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsApi.getNetwork(),
      analyticsApi.getTopSenders(),
    ]).then(([n, s]) => {
      setNetwork(n.data.data)
      setTopSenders(s.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl shimmer" />)}
    </div>
  )

  const packetStatusData = network ? [
    { name: 'Settled',     value: Number(network.settledPackets)    },
    { name: 'Propagating', value: Number(network.propagatingPackets)},
    { name: 'Tampered',    value: Number(network.tamperedPackets)    },
    { name: 'Duplicate',   value: Number(network.duplicatePackets)  },
  ].filter(d => d.value > 0) : []

  const deviceData = network ? [
    { name: 'Online',  value: Number(network.onlineDevices)  },
    { name: 'Offline', value: Number(network.totalDevices) - Number(network.onlineDevices) },
    { name: 'Bridge',  value: Number(network.bridgeDevices)  },
  ] : []

  const radarData = [
    { subject: 'Settlement Rate', A: network ? (network.settledPackets / Math.max(network.totalPackets, 1)) * 100 : 0 },
    { subject: 'Network Health',  A: network ? (network.onlineDevices / Math.max(network.totalDevices, 1)) * 100 : 0 },
    { subject: 'Bridge Coverage', A: network ? (network.bridgeDevices / Math.max(network.totalDevices, 1)) * 100 : 0 },
    { subject: 'Packet Integrity',A: network ? 100 - (network.tamperedPackets / Math.max(network.totalPackets, 1)) * 100 : 100 },
    { subject: 'Dedup Rate',      A: network ? (network.duplicatePackets / Math.max(network.totalPackets, 1)) * 100 : 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Packets',  value: network?.totalPackets ?? 0,     color: 'text-cyan-400' },
          { label: 'Settled',        value: network?.settledPackets ?? 0,    color: 'text-emerald-400' },
          { label: 'Online Devices', value: network?.onlineDevices ?? 0,     color: 'text-purple-400' },
          { label: 'Bridge Nodes',   value: network?.bridgeDevices ?? 0,     color: 'text-yellow-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="glass cyber-border">
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-3xl font-black font-mono ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packet status pie */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Packet Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {packetStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={packetStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value">
                    {packetStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">No packet data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Network radar */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Network Performance Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 8 }} />
                <Radar name="Network" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top senders */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Top Senders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topSenders.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topSenders.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} />
                  <YAxis type="category" dataKey="upiId" tick={{ fill: '#9ca3af', fontSize: 9 }}
                    width={100} axisLine={false} tickFormatter={v => v?.split('@')[0]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">No data yet</div>
            )}
          </CardContent>
        </Card>

        {/* Device status bar */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-yellow-400" /> Device Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
