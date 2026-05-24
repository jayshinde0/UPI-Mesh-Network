import { useMeshStore } from '../store/meshStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ScrollText, Trash2, Download } from 'lucide-react'

const typeConfig = {
  PACKET:      { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20' },
  PROPAGATION: { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  SETTLEMENT:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  BRIDGE:      { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20' },
  TAMPER:      { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
  RESET:       { color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
}

export default function LiveLogsPage() {
  const { liveEvents, wsConnected } = useMeshStore()

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(liveEvents, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'mesh-logs.json'; a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
            wsConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {wsConnected ? 'Live Stream Active' : 'Disconnected'}
          </div>
          <span className="text-xs text-gray-500">{liveEvents.length} events</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportLogs} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      <Card className="glass cyber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-cyan-400" />
            Real-Time Event Stream
            <span className="ml-auto text-xs font-mono text-gray-500">
              {new Date().toLocaleTimeString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-280px)] overflow-y-auto font-mono text-xs">
            {liveEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ScrollText className="w-12 h-12 mb-3 opacity-20" />
                <p>No events yet. Send a payment or run a simulation.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {liveEvents.map((ev, i) => {
                  const cfg = typeConfig[ev.type] || typeConfig.PACKET
                  return (
                    <motion.div
                      key={`${ev.ts}-${i}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/2 transition-colors`}
                    >
                      {/* Timestamp */}
                      <span className="text-gray-600 shrink-0 w-20">{ev.ts?.slice(11, 23)}</span>

                      {/* Type badge */}
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {ev.type}
                      </span>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        {ev.type === 'PROPAGATION' && (
                          <span className="text-gray-300">
                            <span className="text-cyan-400">{ev.fromDevice}</span>
                            <span className="text-gray-600"> → </span>
                            <span className="text-purple-400">{ev.toDevice}</span>
                            {ev.ttl !== undefined && <span className="text-gray-600 ml-2">TTL:{ev.ttl} HOP:{ev.hop}</span>}
                          </span>
                        )}
                        {ev.type === 'SETTLEMENT' && (
                          <span className="text-emerald-400">
                            Settled via {ev.bridgeDeviceId ?? 'bridge'} · {ev.senderUpiId} → {ev.receiverUpiId}
                          </span>
                        )}
                        {ev.type === 'BRIDGE' && (
                          <span className="text-purple-400">
                            Bridge received: {ev.bridgeDevice} ({ev.bridgeName})
                          </span>
                        )}
                        {ev.type === 'TAMPER' && (
                          <span className="text-red-400">
                            TAMPER DETECTED: {ev.reason} [{ev.hash?.slice(0, 12)}]
                          </span>
                        )}
                        {ev.type === 'PACKET' && (
                          <span className="text-cyan-400">
                            Packet {ev.status}: {ev.hash?.slice(0, 16) ?? ev.packetId}
                          </span>
                        )}
                        {ev.type === 'RESET' && (
                          <span className="text-yellow-400">Mesh simulation reset at {ev.timestamp}</span>
                        )}
                      </div>

                      {/* Hash */}
                      {ev.packetHash && (
                        <span className="text-gray-700 shrink-0 hidden lg:block">
                          [{ev.packetHash.slice(0, 8)}]
                        </span>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
