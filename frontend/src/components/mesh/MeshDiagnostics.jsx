import React, { useEffect, useState } from 'react'
import { useMeshStore } from '../../store/meshStore'
import { useAuthStore } from '../../store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  CheckCircle, XCircle, AlertTriangle, RefreshCw, 
  Wifi, Database, Shield, Activity 
} from 'lucide-react'

const MeshDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    auth: { status: 'checking', message: 'Checking authentication...' },
    backend: { status: 'checking', message: 'Checking backend connection...' },
    devices: { status: 'checking', message: 'Checking mesh devices...' },
    websocket: { status: 'checking', message: 'Checking WebSocket connection...' }
  })

  const { 
    devices, 
    packets, 
    wsConnected, 
    fetchDevices, 
    fetchPackets,
    randomizeDevices,
    flushBridges 
  } = useMeshStore()
  
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    // Check authentication
    if (isAuthenticated && user) {
      setDiagnostics(prev => ({
        ...prev,
        auth: { status: 'success', message: `Logged in as ${user.fullName} (${user.role})` }
      }))
    } else {
      setDiagnostics(prev => ({
        ...prev,
        auth: { status: 'error', message: 'Not authenticated. Please log in.' }
      }))
      return
    }

    // Check WebSocket
    setDiagnostics(prev => ({
      ...prev,
      websocket: { 
        status: wsConnected ? 'success' : 'warning', 
        message: wsConnected ? 'WebSocket connected' : 'WebSocket disconnected (using polling)' 
      }
    }))

    // Check backend and fetch devices
    try {
      await fetchDevices()
      await fetchPackets()
      
      setDiagnostics(prev => ({
        ...prev,
        backend: { status: 'success', message: 'Backend API responding' }
      }))

      // Check devices
      if (devices && devices.length > 0) {
        const onlineCount = devices.filter(d => d.online).length
        setDiagnostics(prev => ({
          ...prev,
          devices: { 
            status: onlineCount > 0 ? 'success' : 'warning', 
            message: `Found ${devices.length} devices (${onlineCount} online)` 
          }
        }))
      } else {
        setDiagnostics(prev => ({
          ...prev,
          devices: { status: 'warning', message: 'No mesh devices found. Initialize the mesh network.' }
        }))
      }
    } catch (error) {
      setDiagnostics(prev => ({
        ...prev,
        backend: { status: 'error', message: `Backend error: ${error.message}` },
        devices: { status: 'error', message: 'Cannot fetch devices due to backend error' }
      }))
    }
  }

  const initializeMesh = async () => {
    try {
      await randomizeDevices()
      await flushBridges()
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait a bit
      await runDiagnostics()
    } catch (error) {
      console.error('Failed to initialize mesh:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-emerald-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Mesh Network Diagnostics
            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              className="ml-auto gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Authentication Status */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-gray-700">
              <Shield className="w-5 h-5 text-cyan-400" />
              <div className="flex-1">
                <p className="font-medium text-white">Authentication</p>
                <p className={`text-sm ${getStatusColor(diagnostics.auth.status)}`}>
                  {diagnostics.auth.message}
                </p>
              </div>
              {getStatusIcon(diagnostics.auth.status)}
            </div>

            {/* Backend Connection */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-gray-700">
              <Database className="w-5 h-5 text-cyan-400" />
              <div className="flex-1">
                <p className="font-medium text-white">Backend API</p>
                <p className={`text-sm ${getStatusColor(diagnostics.backend.status)}`}>
                  {diagnostics.backend.message}
                </p>
              </div>
              {getStatusIcon(diagnostics.backend.status)}
            </div>

            {/* WebSocket Connection */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-gray-700">
              <Wifi className="w-5 h-5 text-cyan-400" />
              <div className="flex-1">
                <p className="font-medium text-white">Real-time Connection</p>
                <p className={`text-sm ${getStatusColor(diagnostics.websocket.status)}`}>
                  {diagnostics.websocket.message}
                </p>
              </div>
              {getStatusIcon(diagnostics.websocket.status)}
            </div>

            {/* Mesh Devices */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-gray-700">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div className="flex-1">
                <p className="font-medium text-white">Mesh Network</p>
                <p className={`text-sm ${getStatusColor(diagnostics.devices.status)}`}>
                  {diagnostics.devices.message}
                </p>
              </div>
              {getStatusIcon(diagnostics.devices.status)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {diagnostics.devices.status === 'warning' && (
              <Button
                variant="cyber"
                size="sm"
                onClick={initializeMesh}
                className="gap-2"
              >
                <Activity className="w-3.5 h-3.5" />
                Initialize Mesh Network
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/mesh'}
              className="gap-2"
            >
              <Activity className="w-3.5 h-3.5" />
              Go to Mesh Simulator
            </Button>
          </div>

          {/* Current Data Summary */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 rounded-lg bg-black/20">
              <p className="text-gray-500">Total Devices</p>
              <p className="text-xl font-bold text-white">{devices?.length || 0}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-black/20">
              <p className="text-gray-500">Online Devices</p>
              <p className="text-xl font-bold text-emerald-400">
                {devices?.filter(d => d.online).length || 0}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-black/20">
              <p className="text-gray-500">Bridge Nodes</p>
              <p className="text-xl font-bold text-purple-400">
                {devices?.filter(d => d.bridge).length || 0}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-black/20">
              <p className="text-gray-500">Total Packets</p>
              <p className="text-xl font-bold text-cyan-400">{packets?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MeshDiagnostics