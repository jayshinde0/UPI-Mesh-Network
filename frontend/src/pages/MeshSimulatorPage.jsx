import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMeshStore } from '../store/meshStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Network, Activity, Zap, AlertTriangle, CheckCircle, XCircle,
  Clock, Radio, Shield, Wifi, WifiOff, RefreshCw, Play,
  Trash2, Hash, Lock, ArrowRight, Server, Smartphone
} from 'lucide-react'
import { toast } from '../hooks/useToast'

export default function MeshSimulatorPage() {
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [isInjecting, setIsInjecting] = useState(false)
  const [isFlushing, setIsFlushing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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

  // Fetch data on mount and periodically
  useEffect(() => {
    const fetchData = () => {
      fetchDevices()
      fetchPackets()
    }

    fetchData()
    const interval = setInterval(fetchData, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [fetchDevices, fetchPackets])

  const handleFlushBridges = async () => {
    setIsFlushing(true)
    try {
      await flushBridges()
      toast.success('Bridge Nodes Flushed', 'All bridge nodes are now online with internet connectivity')
    } catch (error) {
      toast.error('Error', error.message || 'Failed to flush bridge nodes')
    } finally {
      setIsFlushing(false)
    }
  }

  const handleInjectPacket = async (packetId) => {
    setIsInjecting(true)
    setSelectedPacket(packetId)
    try {
      await injectPacket(packetId)
      toast.success('Packet Injected', 'Packet has been injected into the mesh network for propagation')
    } catch (error) {
      toast.error('Injection Failed', error.message || 'Failed to inject packet into mesh')
    } finally {
      setIsInjecting(false)
      setSelectedPacket(null)
    }
  }

  const handleSimulateTamper = async (packetId) => {
    try {
      await simulateTamper(packetId)
      toast.info('Tampering Simulated', 'Packet has been tampered with for testing integrity checks')
    } catch (error) {
      toast.error('Error', error.message || 'Failed to simulate tampering')
    }
  }

  const handleResetMesh = async () => {
    setIsResetting(true)
    try {
      await resetMesh()
      toast.success('Mesh Reset', 'Mesh network has been reset to initial state')
    } catch (error) {
      toast.error('Error', error.message || 'Failed to reset mesh')
    } finally {
      setIsResetting(false)
    }
  }

  const handleRandomizeDevices = async () => {
    try {
      await randomizeDevices()
      toast.success('Devices Randomized', 'Device online statuses have been randomized')
    } catch (error) {
      toast.error('Error', error.message || 'Failed to randomize devices')
    }
  }

  const onlineDevices = devices.filter(d => d.online)
  const bridgeDevices = devices.filter(d => d.bridge)
  const onlineBridges = bridgeDevices.filter(d => d.online)
  const relayDevices = devices.filter(d => !d.bridge)

  const pendingPackets = packets.filter(p => 
    p.status === 'PENDING' || p.status === 'INJECTED'
  )
  const propagatingPackets = packets.filter(p => p.status === 'PROPAGATING')
  const settledPackets = packets.filter(p => p.status === 'SETTLED' || p.status === 'COMPLETED')
  const failedPackets = packets.filter(p => 
    p.status === 'FAILED' || p.status === 'TAMPERED' || p.status === 'EXPIRED'
  )

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'INJECTED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'PROPAGATING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'SETTLED':
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'FAILED':
      case 'TAMPERED':
      case 'EXPIRED':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'INJECTED':
        return <Clock className="w-4 h-4" />
      case 'PROPAGATING':
        return <Radio className="w-4 h-4 animate-pulse" />
      case 'SETTLED':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'FAILED':
      case 'TAMPERED':
      case 'EXPIRED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-cyan-400" />
            Mesh Network Simulator
          </h1>
          <p className="text-gray-400 mt-1">
            Inject packets, simulate propagation, and test mesh network behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      {/* Stats Overview */}
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
                  <Server className="w-4 h-4 text-purple-400" />
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
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-bold text-blue-400">
                    {pendingPackets.length}
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
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Radio className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Propagating</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {propagatingPackets.length}
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
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Settled</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {settledPackets.length}
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
                <div className="p-2 rounded-lg bg-red-500/20">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Failed</p>
                  <p className="text-lg font-bold text-red-400">
                    {failedPackets.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Control Panel */}
      <Card className="glass cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Simulation Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="cyber"
              onClick={handleFlushBridges}
              disabled={isFlushing}
              className="gap-2"
            >
              {isFlushing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              Flush Bridge Nodes
            </Button>

            <Button
              variant="outline"
              onClick={handleRandomizeDevices}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Randomize Devices
            </Button>

            <Button
              variant="outline"
              onClick={handleResetMesh}
              disabled={isResetting}
              className="gap-2"
            >
              {isResetting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Reset Mesh
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                fetchDevices()
                fetchPackets()
              }}
              className="gap-2 ml-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">How to use:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-300/80">
                  <li>Click "Flush Bridge Nodes" to bring all bridge devices online</li>
                  <li>Find a pending packet in the list below</li>
                  <li>Click "Inject Packet" to start mesh propagation</li>
                  <li>Watch the packet status change as it propagates through the mesh</li>
                  <li>When it reaches a bridge, settlement happens automatically</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mesh Devices */}
        <Card className="glass cyber-border lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Mesh Devices ({devices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {devices.length === 0 ? (
                <div className="text-center text-gray-500 py-8 px-4">
                  <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No devices found</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {devices.map((device) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {device.bridge ? (
                            <Server className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Smartphone className="w-5 h-5 text-cyan-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {device.deviceId}
                            </p>
                            <p className="text-xs text-gray-500">
                              {device.bridge ? 'Bridge Node' : 'Relay Node'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {device.online ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              <Wifi className="w-3 h-3 mr-1" />
                              Online
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              <WifiOff className="w-3 h-3 mr-1" />
                              Offline
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mesh Packets */}
        <Card className="glass cyber-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Mesh Packets ({packets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {packets.length === 0 ? (
                <div className="text-center text-gray-500 py-8 px-4">
                  <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No packets found</p>
                  <p className="text-xs mt-1">Create a payment to generate packets</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {packets.map((packet) => (
                    <motion.div
                      key={packet.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <code className="text-xs font-mono text-gray-400 truncate">
                              {packet.packetHash?.slice(0, 16)}...
                            </code>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getStatusColor(packet.status)}`}>
                              {getStatusIcon(packet.status)}
                              <span className="ml-1">{packet.status}</span>
                            </Badge>
                            
                            <Badge variant="outline" className="text-xs">
                              TTL: {packet.ttl}
                            </Badge>
                            
                            {packet.transactionId && (
                              <Badge variant="outline" className="text-xs">
                                Tx: {packet.transactionId.slice(0, 8)}
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-gray-500">
                            Created: {new Date(packet.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          {(packet.status === 'PENDING' || packet.status === 'INJECTED') && (
                            <Button
                              size="sm"
                              variant="cyber"
                              onClick={() => handleInjectPacket(packet.id)}
                              disabled={isInjecting && selectedPacket === packet.id}
                              className="gap-2 whitespace-nowrap"
                            >
                              {isInjecting && selectedPacket === packet.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              Inject Packet
                            </Button>
                          )}
                          
                          {packet.status === 'PROPAGATING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSimulateTamper(packet.id)}
                              className="gap-2 whitespace-nowrap"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Tamper
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                          <ArrowRight className="inline w-3 h-3 mx-1" />
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
    </div>
  )
}
