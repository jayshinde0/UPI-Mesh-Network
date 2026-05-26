import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
} from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Play, Pause, RotateCcw, Zap, Shield, Radio, 
  Smartphone, Wifi, Server, Eye, Settings,
  Clock, Hash, Lock, CheckCircle, AlertTriangle,
  Activity, Network, ArrowRight, DollarSign
} from 'lucide-react'

import 'reactflow/dist/style.css'

// Custom Node Components
const PhoneNode = ({ data, selected }) => {
  const { device, isActive, hasPacket, amount, status } = data
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        selected 
          ? 'border-cyan-400 shadow-lg shadow-cyan-400/50' 
          : isActive
            ? 'border-emerald-400 shadow-lg shadow-emerald-400/30'
            : 'border-gray-600/50'
      } ${
        device.type === 'sender' ? 'bg-gradient-to-br from-blue-900/80 to-blue-800/80' :
        device.type === 'receiver' ? 'bg-gradient-to-br from-green-900/80 to-green-800/80' :
        device.type === 'bridge' ? 'bg-gradient-to-br from-purple-900/80 to-purple-800/80' :
        device.type === 'backend' ? 'bg-gradient-to-br from-orange-900/80 to-orange-800/80' :
        'bg-gradient-to-br from-gray-900/80 to-gray-800/80'
      } backdrop-blur-sm min-w-[120px]`}
    >
      {/* Pulse effect for active nodes */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-emerald-400"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* Packet indicator */}
      {hasPacket && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-black text-xs font-bold">📦</span>
        </motion.div>
      )}
      
      {/* Device icon */}
      <div className="flex items-center justify-center mb-2">
        {device.type === 'backend' ? (
          <Server className="w-8 h-8 text-orange-300" />
        ) : device.type === 'bridge' ? (
          <Wifi className="w-8 h-8 text-purple-300" />
        ) : (
          <Smartphone className="w-8 h-8 text-cyan-300" />
        )}
      </div>
      
      {/* Device name */}
      <div className="text-center">
        <p className="text-sm font-bold text-white">{device.name}</p>
        <p className="text-xs text-gray-400">{device.type}</p>
      </div>
      
      {/* Amount display */}
      {amount && (
        <div className="mt-2 text-center">
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
            ₹{amount}
          </Badge>
        </div>
      )}
      
      {/* Status indicator */}
      {status && (
        <div className="mt-1 text-center">
          <span className="text-xs text-gray-300">{status}</span>
        </div>
      )}
    </motion.div>
  )
}

// Custom Edge Component for packet animation
const AnimatedPacketEdge = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  const [packetPosition, setPacketPosition] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    if (data?.animating && !isAnimating) {
      setIsAnimating(true)
      setPacketPosition(0)
      
      const startTime = Date.now()
      const duration = 2000 // 2 seconds for animation
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        setPacketPosition(progress)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          data.onComplete && data.onComplete()
          // Reset animation flag
          if (data.resetAnimation) {
            data.resetAnimation()
          }
        }
      }
      
      requestAnimationFrame(animate)
    }
  }, [data?.animating, isAnimating])
  
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`
  const packetX = sourceX + (targetX - sourceX) * packetPosition
  const packetY = sourceY + (targetY - sourceY) * packetPosition
  
  return (
    <g>
      {/* Connection line */}
      <path
        id={id}
        d={edgePath}
        stroke={data?.color || '#06b6d4'}
        strokeWidth={data?.width || 2}
        strokeOpacity={data?.opacity || 0.6}
        fill="none"
        strokeDasharray={data?.dashed ? "5,5" : "none"}
        className="react-flow__edge-path"
      />
      
      {/* Animated packet */}
      {(data?.animating || isAnimating) && packetPosition > 0 && packetPosition < 1 && (
        <g>
          {/* Packet glow effect */}
          <circle
            cx={packetX}
            cy={packetY}
            r="15"
            fill="rgba(251, 191, 36, 0.3)"
            opacity="0.8"
          />
          <circle
            cx={packetX}
            cy={packetY}
            r="10"
            fill="rgba(251, 191, 36, 0.5)"
            opacity="0.9"
          />
          
          {/* Main packet */}
          <circle
            cx={packetX}
            cy={packetY}
            r="8"
            fill="#fbbf24"
            stroke="#ffffff"
            strokeWidth="2"
            opacity="1"
          />
          
          {/* Packet label */}
          <text
            x={packetX}
            y={packetY + 3}
            textAnchor="middle"
            fontSize="10"
            fill="#000"
            fontWeight="bold"
          >
            📦
          </text>
          
          {/* Trailing effect */}
          <circle
            cx={packetX - (targetX - sourceX) * 0.1}
            cy={packetY - (targetY - sourceY) * 0.1}
            r="4"
            fill="#fbbf24"
            opacity="0.5"
          />
        </g>
      )}
    </g>
  )
}

const nodeTypes = {
  phone: PhoneNode,
}

const edgeTypes = {
  animatedPacket: AnimatedPacketEdge,
}

const PaymentSimulationPlayback = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [chaosMode, setChaosMode] = useState(false)
  const [simulationLog, setSimulationLog] = useState([])
  const [packetDetails, setPacketDetails] = useState(null)
  const [showPacketViewer, setShowPacketViewer] = useState(false)
  const [debugMode, setDebugMode] = useState(true) // Enable debug mode by default
  const simulationRef = useRef({ shouldStop: false })
  
  const simulationSteps = [
    {
      title: "Payment Created",
      description: "Jay creates a ₹500 payment to Amey",
      duration: 2000,
      action: () => {
        addLog("💳 Payment initiated: ₹500 from Jay to Amey")
        updateNodeStatus('jay', { isActive: true, status: 'Creating payment...' })
      }
    },
    {
      title: "AES Encryption Applied", 
      description: "Payment data encrypted with AES-256",
      duration: 1500,
      action: () => {
        addLog("🔐 Applying AES-256 encryption...")
        setPacketDetails({
          hash: "2fd9ab3c8e7f1a2b",
          ttl: 5,
          encrypted: "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=",
          status: "Encrypted"
        })
        updateNodeStatus('jay', { hasPacket: true, status: 'Packet encrypted' })
      }
    },
    {
      title: "Packet Broadcasted",
      description: "Encrypted packet broadcasted to nearby devices",
      duration: 2000,
      action: () => {
        addLog("📡 Broadcasting packet to mesh network...")
        animatePacket('jay', 'user2')
        updateNodeStatus('jay', { status: 'Broadcasting...' })
      }
    },
    {
      title: "Hop 1 Complete",
      description: "Packet received by User2, TTL decremented",
      duration: 2000,
      action: () => {
        addLog("📦 Hop 1: Jay → User2 (TTL: 4)")
        updateNodeStatus('user2', { hasPacket: true, isActive: true, status: 'Relaying packet' })
        updatePacketTTL(4)
        animatePacket('user2', 'user3')
      }
    },
    {
      title: "Hop 2 Complete",
      description: "Packet forwarded through mesh network",
      duration: 2000,
      action: () => {
        addLog("📦 Hop 2: User2 → User3 (TTL: 3)")
        updateNodeStatus('user3', { hasPacket: true, isActive: true, status: 'Forwarding packet' })
        updatePacketTTL(3)
        animatePacket('user3', 'bridge')
      }
    },
    {
      title: "Bridge Node Connected",
      description: "Packet reaches bridge node with internet",
      duration: 2000,
      action: () => {
        addLog("🌐 Bridge node connected! Internet restored")
        updateNodeStatus('bridge', { hasPacket: true, isActive: true, status: 'Internet available' })
        animatePacket('bridge', 'backend')
      }
    },
    {
      title: "Packet Uploaded",
      description: "Encrypted packet uploaded to backend",
      duration: 2000,
      action: () => {
        addLog("☁️ Uploading packet to backend...")
        updateNodeStatus('backend', { hasPacket: true, isActive: true, status: 'Processing...' })
      }
    },
    {
      title: "Settlement Complete",
      description: "Backend processes payment and settles transaction",
      duration: 3000,
      action: () => {
        addLog("✅ Decrypting packet...")
        setTimeout(() => addLog("🔍 Verifying hash integrity..."), 500)
        setTimeout(() => addLog("🚫 Checking for duplicates..."), 1000)
        setTimeout(() => addLog("💰 Settlement successful!"), 1500)
        setTimeout(() => {
          updateNodeStatus('backend', { status: 'Settlement complete' })
          updateNodeStatus('amey', { isActive: true, amount: 500, status: '+₹500 received' })
        }, 2000)
      }
    }
  ]

  // Initialize simulation nodes
  useEffect(() => {
    const initialNodes = [
      {
        id: 'jay',
        type: 'phone',
        position: { x: 100, y: 200 },
        data: { 
          device: { name: "Jay's Phone", type: 'sender' },
          isActive: false,
          hasPacket: false
        }
      },
      {
        id: 'user2',
        type: 'phone', 
        position: { x: 300, y: 150 },
        data: {
          device: { name: "User 2", type: 'relay' },
          isActive: false,
          hasPacket: false
        }
      },
      {
        id: 'user3',
        type: 'phone',
        position: { x: 500, y: 200 },
        data: {
          device: { name: "User 3", type: 'relay' },
          isActive: false,
          hasPacket: false
        }
      },
      {
        id: 'bridge',
        type: 'phone',
        position: { x: 700, y: 150 },
        data: {
          device: { name: "Bridge Node", type: 'bridge' },
          isActive: false,
          hasPacket: false
        }
      },
      {
        id: 'backend',
        type: 'phone',
        position: { x: 900, y: 200 },
        data: {
          device: { name: "Backend", type: 'backend' },
          isActive: false,
          hasPacket: false
        }
      },
      {
        id: 'amey',
        type: 'phone',
        position: { x: 700, y: 350 },
        data: {
          device: { name: "Amey's Phone", type: 'receiver' },
          isActive: false,
          hasPacket: false
        }
      }
    ]

    const initialEdges = [
      { id: 'jay-user2', source: 'jay', target: 'user2', type: 'animatedPacket', data: { color: '#06b6d4', width: 2 } },
      { id: 'user2-user3', source: 'user2', target: 'user3', type: 'animatedPacket', data: { color: '#06b6d4', width: 2 } },
      { id: 'user3-bridge', source: 'user3', target: 'bridge', type: 'animatedPacket', data: { color: '#8b5cf6', width: 3 } },
      { id: 'bridge-backend', source: 'bridge', target: 'backend', type: 'animatedPacket', data: { color: '#f59e0b', width: 3, dashed: true } },
      { id: 'backend-amey', source: 'backend', target: 'amey', type: 'animatedPacket', data: { color: '#10b981', width: 3 } }
    ]

    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [])

  const addLog = (message) => {
    setSimulationLog(prev => [...prev, {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const updateNodeStatus = (nodeId, updates) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ))
  }

  const updatePacketTTL = (newTTL) => {
    setPacketDetails(prev => prev ? { ...prev, ttl: newTTL } : null)
  }

  const animatePacket = (sourceId, targetId) => {
    setEdges(edges => edges.map(edge => {
      if (edge.id === `${sourceId}-${targetId}`) {
        return { 
          ...edge, 
          data: { 
            ...edge.data, 
            animating: true,
            resetAnimation: () => {
              setEdges(prevEdges => prevEdges.map(e => 
                e.id === edge.id 
                  ? { ...e, data: { ...e.data, animating: false } }
                  : e
              ))
            }
          }
        }
      }
      return edge
    }))
  }

  const startSimulation = async () => {
    console.log('Start Simulation clicked, isPlaying:', isPlaying)
    
    if (isPlaying) {
      console.log('Simulation already playing, returning')
      return // Prevent multiple simultaneous simulations
    }
    
    console.log('Starting simulation...')
    simulationRef.current.shouldStop = false
    setIsPlaying(true)
    setCurrentStep(0)
    setSimulationLog([])
    setPacketDetails(null)
    
    // Reset nodes and edges
    setNodes(nodes => nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: false,
        hasPacket: false,
        amount: null,
        status: null
      }
    })))
    
    setEdges(edges => edges.map(edge => ({
      ...edge,
      data: { ...edge.data, animating: false }
    })))
    
    // Small delay to ensure reset completes
    await new Promise(resolve => setTimeout(resolve, 100))
    
    addLog("🚀 Starting simulation...")
    console.log('Simulation steps:', simulationSteps.length)
    
    for (let i = 0; i < simulationSteps.length; i++) {
      // Check if simulation should stop
      if (simulationRef.current.shouldStop) {
        console.log('Simulation stopped at step', i)
        addLog("⏸️ Simulation paused")
        break
      }
      
      console.log(`Executing step ${i + 1}/${simulationSteps.length}`)
      setCurrentStep(i)
      const step = simulationSteps[i]
      
      // Execute step action
      try {
        step.action()
      } catch (error) {
        console.error('Step action error:', error)
        addLog(`❌ Error in step ${i + 1}: ${error.message}`)
      }
      
      // Add chaos mode effects
      if (chaosMode && Math.random() < 0.3) {
        setTimeout(() => {
          addLog("⚠️ Network interference detected!")
          if (Math.random() < 0.5) {
            addLog("🔄 Retrying packet transmission...")
          }
        }, step.duration / 2)
      }
      
      // Wait for step duration
      await new Promise(resolve => 
        setTimeout(resolve, step.duration / simulationSpeed)
      )
    }
    
    console.log('Simulation loop completed')
    setIsPlaying(false)
    if (!simulationRef.current.shouldStop) {
      addLog("✅ Simulation completed successfully!")
    }
  }

  const stopSimulation = () => {
    simulationRef.current.shouldStop = true
    setIsPlaying(false)
  }

  const resetSimulation = () => {
    simulationRef.current.shouldStop = true
    setIsPlaying(false)
    setCurrentStep(0)
    setPacketDetails(null)
    
    // Reset all nodes
    setNodes(nodes => nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: false,
        hasPacket: false,
        amount: null,
        status: null
      }
    })))
    
    // Reset all edges
    setEdges(edges => edges.map(edge => ({
      ...edge,
      data: { ...edge.data, animating: false }
    })))
    
    setSimulationLog([{ 
      id: Date.now(), 
      message: "🔄 Simulation reset",
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card className="glass cyber-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Interactive Offline Payment Simulation
            <Badge variant="secondary" className="ml-2 bg-emerald-500/20 text-emerald-400">
              LIVE DEMO
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant={isPlaying ? "destructive" : "cyber"}
              size="sm"
              onClick={() => {
                console.log('Button clicked!')
                if (isPlaying) {
                  stopSimulation()
                } else {
                  startSimulation()
                }
              }}
              className="gap-2"
              disabled={nodes.length === 0}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause Simulation' : 'Start Simulation'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>

            <Button
              variant={showPacketViewer ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPacketViewer(!showPacketViewer)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Packet Viewer
            </Button>

            <Button
              variant={debugMode ? "default" : "outline"}
              size="sm"
              onClick={() => setDebugMode(!debugMode)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Debug Mode
            </Button>
          </div>

          {/* Simulation Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Simulation Speed</label>
              <select 
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
              >
                <option value={0.5}>0.5x (Slow)</option>
                <option value={1}>1x (Normal)</option>
                <option value={2}>2x (Fast)</option>
                <option value={5}>5x (Very Fast)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Chaos Mode</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={chaosMode}
                  onChange={(e) => setChaosMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-white">Simulate Network Issues</span>
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Current Step</label>
              <div className="text-sm text-white">
                {currentStep + 1} / {simulationSteps.length}: {simulationSteps[currentStep]?.title || 'Ready'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Visualization */}
      <Card className="glass cyber-border">
        <CardContent className="p-0">
          <div style={{ width: '100%', height: '500px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            >
              <Controls className="bg-black/50 border border-gray-600" />
              <MiniMap 
                className="bg-black/50 border border-gray-600"
                nodeColor="#06b6d4"
              />
              <Background variant="dots" gap={20} size={1} color="#374151" />
              
              {/* SVG Definitions */}
              <svg>
                <defs>
                  <radialGradient id="packetGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>

              {/* Timeline Panel */}
              <Panel position="top-center" className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-4">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <div className="text-sm text-white">
                    <span className="font-bold">Payment Flow:</span> Jay → User2 → User3 → Bridge → Backend → Amey
                  </div>
                </div>
              </Panel>

              {/* Debug Panel */}
              {debugMode && (
                <Panel position="bottom-left" className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-xs text-white space-y-1">
                    <div>Current Step: {currentStep + 1}/{simulationSteps.length}</div>
                    <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
                    <div>Speed: {simulationSpeed}x</div>
                    <div>Edges: {edges.length}</div>
                    <div>Animating Edges: {edges.filter(e => e.data?.animating).length}</div>
                  </div>
                </Panel>
              )}

              {/* Step Progress */}
              <Panel position="bottom-center" className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2">
                  {simulationSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index < currentStep ? 'bg-emerald-400' :
                        index === currentStep ? 'bg-cyan-400 animate-pulse' :
                        'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Simulation Log */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Real-time Simulation Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-64 overflow-y-auto">
              {simulationLog.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No simulation logs yet. Click "Start Simulation" to begin.
                </div>
              ) : (
                <AnimatePresence>
                  {simulationLog.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 px-4 py-2 border-b border-white/5 font-mono text-sm"
                    >
                      <span className="text-gray-500 text-xs">{log.timestamp}</span>
                      <span className="text-gray-300">{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Encrypted Packet Viewer */}
        <AnimatePresence>
          {showPacketViewer && packetDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="glass cyber-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-yellow-400" />
                    Encrypted Packet Viewer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">AES Key:</span>
                      <span className="text-yellow-400">********</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hash:</span>
                      <span className="text-cyan-400">{packetDetails.hash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">TTL:</span>
                      <span className="text-emerald-400">{packetDetails.ttl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-purple-400">{packetDetails.status}</span>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Encrypted Payload:</p>
                      <p className="text-gray-300 break-all bg-black/30 p-2 rounded">
                        {packetDetails.encrypted}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PaymentSimulationPlayback