import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMeshStore } from '../store/meshStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import MeshDiagnostics from '../components/mesh/MeshDiagnostics'
import PaymentSimulationPlayback from '../components/simulation/PaymentSimulationPlayback'
import {
  Network, Activity, Zap, AlertTriangle, CheckCircle,
  Clock, TrendingUp, BarChart3, Wifi, GitBranch, Shield
} from 'lucide-react'

export default function MeshTopologyPage() {
  const [activeTab, setActiveTab] = useState('simulation')
  const [realTimeStats, setRealTimeStats] = useState({
    totalPackets: 0,
    propagatingPackets: 0,
    completedPackets: 0,
    failedPackets: 0,
    averageTTL: 0,
    networkHealth: 0,
    throughput: 0,
  })

  const {
    devices,
    packets,
    liveEvents,
    fetchDevices,
    fetchPackets,
    injectPacket,
    simulateTamper,
    resetMesh,
    flushBridges,
    randomizeDevices,
  } = useMeshStore()

  // Real-time data fetching
  useEffect(() => {
    const fetchData = () => {
      fetchDevices()
      fetchPackets()
    }

    fetchData()
    const interval = setInterval(fetchData, 2000) // Update every 2 seconds
    return () => clearInterval(interval)
  }, [fetchDevices, fetchPackets])

  // Calculate real-time statistics
  useEffect(() => {
    const onlineDevices = devices.filter(d => d.online)
    const propagating = packets.filter(p => p.status === 'PROPAGATING' || p.status === 'INJECTED')
    const completed = packets.filter(p => p.status === 'COMPLETED')
    const failed = packets.filter(p => p.status === 'FAILED' || p.status === 'TAMPERED')
    
    const avgTTL = packets.length > 0 
      ? packets.reduce((sum, p) => sum + (p.ttl || 0), 0) / packets.length 
      : 0

    const networkHealth = devices.length > 0 
      ? (onlineDevices.length / devices.length) * 100 
      : 0

    // Simulate throughput based on recent packet activity
    const recentPackets = packets.filter(p => {
      const packetTime = new Date(p.timestamp || Date.now())
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return packetTime > fiveMinutesAgo
    })

    setRealTimeStats({
      totalPackets: packets.length,
      propagatingPackets: propagating.length,
      completedPackets: completed.length,
      failedPackets: failed.length,
      averageTTL: avgTTL,
      networkHealth: networkHealth,
      throughput: recentPackets.length,
    })
  }, [devices, packets])

  const onlineDevices = devices.filter(d => d.online)
  const bridgeDevices = devices.filter(d => d.bridge)
  const onlineBridges = bridgeDevices.filter(d => d.online)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass cyber-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Online Devices</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {onlineDevices.length}/{devices.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass cyber-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bridge Nodes</p>
                  <p className="text-lg font-bold text-purple-400">
                    {onlineBridges.length}/{bridgeDevices.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass cyber-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Activity className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Propagating</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {realTimeStats.propagatingPackets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass cyber-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {realTimeStats.completedPackets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass cyber-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Failed</p>
                  <p className="text-lg font-bold text-red-400">
                    {realTimeStats.failedPackets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass cyber-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Health</p>
                  <p className="text-lg font-bold text-blue-400">
                    {realTimeStats.networkHealth.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Visualization */}
      <Card className="glass cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Live Mesh Topology Visualization
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="simulation" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Live Simulation
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Diagnostics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simulation" className="space-y-4">
              <PaymentSimulationPlayback />
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-4">
              <MeshDiagnostics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live Events Feed */}
      <Card className="glass cyber-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Live Network Events
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {liveEvents.length} events
              </span>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            <AnimatePresence>
              {liveEvents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for network events...</p>
                </div>
              ) : (
                liveEvents.slice(0, 50).map((event, index) => (
                  <motion.div
                    key={`${event.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'SETTLEMENT' ? 'bg-emerald-400' :
                      event.type === 'TAMPER' ? 'bg-red-400' :
                      event.type === 'BRIDGE' ? 'bg-purple-400' :
                      event.type === 'PROPAGATION' ? 'bg-yellow-400' :
                      'bg-cyan-400'
                    } animate-pulse`} />
                    
                    <span className="text-xs text-gray-500 font-mono min-w-[60px]">
                      {event.ts?.slice(11, 19) || new Date().toLocaleTimeString()}
                    </span>
                    
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.type === 'SETTLEMENT' ? 'bg-emerald-500/20 text-emerald-400' :
                      event.type === 'TAMPER' ? 'bg-red-500/20 text-red-400' :
                      event.type === 'BRIDGE' ? 'bg-purple-500/20 text-purple-400' :
                      event.type === 'PROPAGATION' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {event.type}
                    </span>
                    
                    <div className="flex-1 text-sm text-gray-300">
                      {event.fromDevice && event.toDevice && (
                        <span>
                          <span className="text-cyan-400">{event.fromDevice}</span>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="text-purple-400">{event.toDevice}</span>
                        </span>
                      )}
                      {event.bridgeDevice && (
                        <span>Bridge: <span className="text-purple-400">{event.bridgeDevice}</span></span>
                      )}
                      {event.message && (
                        <span className="text-gray-400">{event.message}</span>
                      )}
                    </div>
                    
                    {event.packetHash && (
                      <span className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">
                        {event.packetHash.slice(0, 8)}...
                      </span>
                    )}
                    
                    {event.ttl !== undefined && (
                      <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                        TTL: {event.ttl}
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Average TTL</p>
                <p className="text-xl font-bold text-white">
                  {realTimeStats.averageTTL.toFixed(1)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Packets</p>
                <p className="text-xl font-bold text-white">
                  {realTimeStats.totalPackets}
                </p>
              </div>
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Throughput (5min)</p>
                <p className="text-xl font-bold text-white">
                  {realTimeStats.throughput}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Success Rate</p>
                <p className="text-xl font-bold text-white">
                  {realTimeStats.totalPackets > 0 
                    ? ((realTimeStats.completedPackets / realTimeStats.totalPackets) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}