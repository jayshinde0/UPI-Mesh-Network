import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMeshStore } from '../store/meshStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Network, RefreshCw, Wifi, WifiOff } from 'lucide-react'

export default function NetworkTopologyPage() {
  const { devices, packets, fetchDevices, fetchPackets, liveEvents } = useMeshStore()
  const [animatedPackets, setAnimatedPackets] = useState([])
  const svgRef = useRef(null)

  useEffect(() => {
    fetchDevices()
    fetchPackets()
    const interval = setInterval(() => { fetchDevices(); fetchPackets() }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Animate packets on new propagation events
  useEffect(() => {
    const propEvents = liveEvents.filter(e => e.type === 'PROPAGATION').slice(0, 5)
    setAnimatedPackets(propEvents)
  }, [liveEvents])

  // Build edges: connect nearby devices (simple distance-based)
  const edges = []
  devices.forEach((d, i) => {
    devices.forEach((d2, j) => {
      if (j <= i) return
      const dx = (d.xPosition ?? 0) - (d2.xPosition ?? 0)
      const dy = (d.yPosition ?? 0) - (d2.yPosition ?? 0)
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 250) edges.push([d, d2])
    })
  })

  const getNodeColor = (d) => {
    if (!d.online) return '#374151'
    if (d.bridge) return '#10b981'
    if (d.deviceType === 'ORIGIN') return '#00d4ff'
    return '#7c3aed'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          {[
            { color: '#00d4ff', label: 'Origin' },
            { color: '#7c3aed', label: 'Relay' },
            { color: '#10b981', label: 'Bridge' },
            { color: '#374151', label: 'Offline' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchDevices(); fetchPackets() }}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <Card className="glass cyber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            Live Mesh Topology
            <span className="ml-auto text-xs text-gray-500">
              {devices.filter(d => d.online).length}/{devices.length} nodes online
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black/30 rounded-xl overflow-hidden" style={{ height: 520 }}>
            <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1050 560">
              {/* Grid */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="1" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edges */}
              {edges.map(([a, b], i) => (
                <line key={i}
                  x1={a.xPosition} y1={a.yPosition}
                  x2={b.xPosition} y2={b.yPosition}
                  stroke={a.online && b.online ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth="1"
                  strokeDasharray={a.online && b.online ? 'none' : '4,4'}
                />
              ))}

              {/* Animated packet travel */}
              {animatedPackets.map((ev, i) => {
                const from = devices.find(d => d.deviceId === ev.fromDevice)
                const to   = devices.find(d => d.deviceId === ev.toDevice)
                if (!from || !to) return null
                return (
                  <motion.circle key={`${ev.ts}-${i}`} r={5} fill="#00d4ff"
                    filter="url(#glow)"
                    initial={{ cx: from.xPosition, cy: from.yPosition, opacity: 1 }}
                    animate={{ cx: to.xPosition, cy: to.yPosition, opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                  />
                )
              })}

              {/* Nodes */}
              {devices.map(d => {
                const color = getNodeColor(d)
                const r = d.bridge ? 16 : d.deviceType === 'ORIGIN' ? 14 : 11
                return (
                  <g key={d.id}>
                    {/* Pulse ring for online bridge */}
                    {d.online && d.bridge && (
                      <motion.circle cx={d.xPosition} cy={d.yPosition} r={r + 8}
                        fill="none" stroke={color} strokeWidth="1" opacity="0.3"
                        animate={{ r: [r + 8, r + 20], opacity: [0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    {/* Pulse for online relay */}
                    {d.online && !d.bridge && (
                      <motion.circle cx={d.xPosition} cy={d.yPosition} r={r + 4}
                        fill="none" stroke={color} strokeWidth="0.5" opacity="0.2"
                        animate={{ r: [r + 4, r + 12], opacity: [0.2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
                      />
                    )}
                    {/* Node circle */}
                    <circle cx={d.xPosition} cy={d.yPosition} r={r}
                      fill={color + '22'} stroke={color} strokeWidth={d.online ? 1.5 : 0.5}
                      filter={d.online ? 'url(#glow)' : 'none'}
                    />
                    {/* Signal strength arc */}
                    {d.online && (
                      <text x={d.xPosition} y={d.yPosition + 4} textAnchor="middle"
                        fill={color} fontSize="8" fontFamily="monospace">
                        {d.bridge ? '⬡' : '●'}
                      </text>
                    )}
                    {/* Label */}
                    <text x={d.xPosition} y={d.yPosition + r + 14}
                      textAnchor="middle" fill={d.online ? '#9ca3af' : '#4b5563'}
                      fontSize="9" fontFamily="monospace">
                      {d.deviceName.length > 12 ? d.deviceName.slice(0, 12) : d.deviceName}
                    </text>
                    {/* Packets relayed badge */}
                    {d.packetsRelayed > 0 && (
                      <text x={d.xPosition + r} y={d.yPosition - r}
                        fill="#f59e0b" fontSize="8" fontFamily="monospace">
                        {d.packetsRelayed}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Device stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {devices.filter(d => d.bridge).map(d => (
          <Card key={d.id} className={`glass ${d.online ? 'border-emerald-500/30' : 'border-white/8'}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                {d.online ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-gray-600" />}
                <span className="text-xs font-semibold text-white truncate">{d.deviceName}</span>
              </div>
              <p className="text-xs text-gray-500">Settled: <span className="text-emerald-400 font-mono">{d.packetsSettled}</span></p>
              <p className="text-xs text-gray-500">Relayed: <span className="text-cyan-400 font-mono">{d.packetsRelayed}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
