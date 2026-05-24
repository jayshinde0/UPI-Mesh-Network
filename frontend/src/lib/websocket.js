import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let stompClient = null
const subscribers = new Map()

export function connectWebSocket(onConnected, onDisconnected) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('/api/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('[WS] Connected to mesh network')
      onConnected?.()
    },
    onDisconnect: () => {
      console.log('[WS] Disconnected')
      onDisconnected?.()
    },
    onStompError: (frame) => {
      console.error('[WS] STOMP error:', frame)
    },
  })
  stompClient.activate()
  return stompClient
}

export function disconnectWebSocket() {
  if (stompClient?.active) {
    stompClient.deactivate()
  }
}

export function subscribe(topic, callback) {
  if (!stompClient?.active) return null
  const sub = stompClient.subscribe(topic, (message) => {
    try {
      const data = JSON.parse(message.body)
      callback(data)
    } catch {
      callback(message.body)
    }
  })
  subscribers.set(topic, sub)
  return sub
}

export function unsubscribe(topic) {
  const sub = subscribers.get(topic)
  if (sub) {
    sub.unsubscribe()
    subscribers.delete(topic)
  }
}

export function isConnected() {
  return stompClient?.active ?? false
}

// Topic constants
export const WS_TOPICS = {
  PACKETS:      '/topic/packets',
  PROPAGATION:  '/topic/propagation',
  SETTLEMENTS:  '/topic/settlements',
  DEVICES:      '/topic/devices',
  BRIDGE:       '/topic/bridge',
  TAMPER:       '/topic/tamper',
  MESH_RESET:   '/topic/mesh-reset',
}
