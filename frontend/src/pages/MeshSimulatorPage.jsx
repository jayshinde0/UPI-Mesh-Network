import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMeshStore } from '../store/meshStore'
import { formatDate, getStatusBg, truncateHash } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { toast } from '../hooks/useToast'
import {
  Radio, Zap, RefreshCw, Shield, Copy, Wifi, WifiOff,
  Play, RotateCcw, AlertTriangle, Activity
} from 'lucide-react'

export default function MeshSimulatorPage() {
  const {
    devices, packets, fetchDevices, fetchPackets,
    injectPacket, simulateTamper, resetMesh, flushBridges,
    randomizeDevices, toggleDevice, liveEvents
  } = useMeshStore()
  const [loading, setLoading] = useState({})

  useEffect(() => {
    fetchDevices()
    fetchPackets()
    const interval = setInterval(() => { fetchDevices(); fetchPackets() }, 3000)
    return () => clearInterval(interval)
  }, [])

  const action = async (key, fn, successMsg) => {
    setLoading(l => ({ ...l, [key]: true }))
    try {
      await fn()
      toast.success('Done', successMsg)
    } catch (e) {
      toast.error('Error', e.message)
    } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  const propagatingPackets = packets.filter(p => p.status === 'PROPAGATING' || p.status === 'INJECTED')
  const onlineDevices = devices.filter(d => d.online)
  const bridgeDevices = devices.filter(d => d.bridge)

  return (
    <div className="space-y-6">
      {/* Control panel */}
      <Card className="glass cyber-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Simulation Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="cyber" size="sm" className="gap-2"
              onClick={() => action('inject', () => {
                const p = propagatingPackets[0]
                if (!p) throw new Error('No pending packets')
                return injectPacket(p.id)
              }, 'Packet injected into mesh')}
              disabled={loading.inject || propagatingPackets.length === 0}>
              <Zap className="w-3.5 h-3.5" />
              {loading.inject ? 'Injecting...' : 'Inject Packet'}
            </Button>

            <Button variant="outline" size="sm" className="gap-2"
              onClick={() => action('flush', flushBridges, 'All bridge nodes online')}
              disabled={loading.flush}>
              <Wifi className="w-3.5 h-3.5" />
              Flush Bridge Nodes
            </Button>

            <Button variant="outline" size="sm" className="gap-2"
              onClick={() => action('randomize', randomizeDevices, 'Device statuses randomized')}
              disabled={loading.randomize}>
              <RefreshCw className="w-3.5 h-3.5" />
              Randomize Devices
            </Button>

            <Button variant="destructive" size="sm" className="gap-2"
              onClick={() => action('reset', resetMesh, 'Mesh simulation reset')}
              disabled={loading.reset}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Mesh
            </Button>

            <Button variant="warning" size="sm" className="gap-2"
              onClick={() => action('tamper', () => {
                const p = packets.find(p => p.status === 'PROPAGATING')
                if (!p) throw new Error('No propagating packets')
                return simulateTamper(p.id)
              }, 'Packet tampered')}
              disabled={loading.tamper}>
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Tampering
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              Mesh Devices
              <span className="ml-auto text-xs text-gray-500">{onlineDevices.length}/{devices.length} online</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {devices.map(d => (
                <motion.div key={d.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/2 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${d.online ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{d.deviceName}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{d.deviceId}</p>
                  </div>
                  {d.bridge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">BRIDGE</span>
                  )}
                  <button onClick={() => toggleDevice(d.deviceId)}
                    className={`p-1 rounded transition-colors ${d.online ? 'text-emerald-400 hover:text-red-400' : 'text-gray-600 hover:text-emerald-400'}`}>
                    {d.online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                  </button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Packets */}
        <Card className="glass cyber-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Mesh Packets
              <span className="ml-auto text-xs text-gray-500">{packets.length} total</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {packets.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">No packets yet. Send a payment to inject one.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Hash','From','To','TTL','Hops','Status'].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {packets.slice(0, 50).map((p, i) => (
                      <motion.tr key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="border-b border-white/5 hover:bg-white/2"
                      >
                        <td className="px-3 py-2 font-mono text-gray-400">{truncateHash(p.packetHash, 10)}</td>
                        <td className="px-3 py-2 font-mono text-cyan-400 truncate max-w-[80px]">{p.senderUpiId?.split('@')[0]}</td>
                        <td className="px-3 py-2 font-mono text-purple-400 truncate max-w-[80px]">{p.receiverUpiId?.split('@')[0]}</td>
                        <td className="px-3 py-2 text-yellow-400 font-mono">{p.ttl}</td>
                        <td className="px-3 py-2 text-gray-400">{p.hopCount}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBg(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live propagation events */}
      <Card className="glass cyber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Live Propagation Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-48 overflow-y-auto font-mono text-xs">
            {liveEvents.length === 0 ? (
              <p className="text-center text-gray-500 py-6">Waiting for propagation events...</p>
            ) : (
              liveEvents.slice(0, 30).map((ev, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-4 py-1.5 border-b border-white/5"
                >
                  <span className="text-gray-600">{ev.ts?.slice(11,19)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    ev.type === 'SETTLEMENT' ? 'bg-emerald-500/20 text-emerald-400' :
                    ev.type === 'TAMPER'     ? 'bg-red-500/20 text-red-400' :
                    ev.type === 'BRIDGE'     ? 'bg-purple-500/20 text-purple-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>{ev.type}</span>
                  <span className="text-gray-400">
                    {ev.fromDevice && `${ev.fromDevice} → ${ev.toDevice}`}
                    {ev.bridgeDevice && `Bridge: ${ev.bridgeDevice}`}
                    {ev.packetHash && ` [${ev.packetHash?.slice(0,8)}]`}
                  </span>
                  {ev.ttl !== undefined && <span className="text-gray-600 ml-auto">TTL:{ev.ttl}</span>}
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
