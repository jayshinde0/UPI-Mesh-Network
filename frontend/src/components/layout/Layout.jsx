import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useEffect } from 'react'
import { connectWebSocket, disconnectWebSocket, subscribe, WS_TOPICS } from '../../lib/websocket'
import { useMeshStore } from '../../store/meshStore'

export default function Layout() {
  const { setWsConnected, pushLiveEvent, updatePacket, fetchDashboard } = useMeshStore()

  useEffect(() => {
    const client = connectWebSocket(
      () => {
        setWsConnected(true)
        // Subscribe to all live topics
        subscribe(WS_TOPICS.PACKETS, (data) => {
          pushLiveEvent({ type: 'PACKET', ...data, ts: new Date().toISOString() })
          updatePacket(data)
        })
        subscribe(WS_TOPICS.PROPAGATION, (data) => {
          pushLiveEvent({ type: 'PROPAGATION', ...data, ts: new Date().toISOString() })
        })
        subscribe(WS_TOPICS.SETTLEMENTS, (data) => {
          pushLiveEvent({ type: 'SETTLEMENT', ...data, ts: new Date().toISOString() })
          fetchDashboard()
        })
        subscribe(WS_TOPICS.BRIDGE, (data) => {
          pushLiveEvent({ type: 'BRIDGE', ...data, ts: new Date().toISOString() })
        })
        subscribe(WS_TOPICS.TAMPER, (data) => {
          pushLiveEvent({ type: 'TAMPER', ...data, ts: new Date().toISOString() })
        })
        subscribe(WS_TOPICS.MESH_RESET, (data) => {
          pushLiveEvent({ type: 'RESET', ...data, ts: new Date().toISOString() })
        })
      },
      () => setWsConnected(false)
    )
    return () => disconnectWebSocket()
  }, [])

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden cyber-grid-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
