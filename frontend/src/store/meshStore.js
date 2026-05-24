import { create } from 'zustand'
import { meshApi, analyticsApi, bridgeApi } from '../lib/api'

export const useMeshStore = create((set, get) => ({
  devices: [],
  packets: [],
  settlementLogs: [],
  dashboardStats: null,
  liveEvents: [],        // real-time propagation events
  wsConnected: false,
  loading: false,

  setWsConnected: (val) => set({ wsConnected: val }),

  // Push a live event (max 100 kept)
  pushLiveEvent: (event) => set(state => ({
    liveEvents: [event, ...state.liveEvents].slice(0, 100),
  })),

  // Update a packet in the list when WS fires
  updatePacket: (packetData) => set(state => ({
    packets: state.packets.map(p =>
      p.id === packetData.packetId || p.packetHash === packetData.hash
        ? { ...p, status: packetData.status ?? p.status }
        : p
    ),
  })),

  fetchDevices: async () => {
    try {
      const { data } = await meshApi.getDevices()
      set({ devices: data.data })
    } catch {}
  },

  fetchPackets: async () => {
    try {
      const { data } = await meshApi.getPackets()
      set({ packets: data.data })
    } catch {}
  },

  fetchDashboard: async () => {
    try {
      const { data } = await analyticsApi.getDashboard()
      set({ dashboardStats: data.data })
    } catch {}
  },

  fetchSettlementLogs: async () => {
    try {
      const { data } = await bridgeApi.getLogs()
      set({ settlementLogs: data.data })
    } catch {}
  },

  injectPacket: async (packetId) => {
    const { data } = await meshApi.injectPacket(packetId)
    return data
  },

  simulateTamper: async (packetId) => {
    const { data } = await meshApi.simulateTamper(packetId)
    await get().fetchPackets()
    return data
  },

  resetMesh: async () => {
    await meshApi.resetMesh()
    await get().fetchPackets()
    await get().fetchDevices()
  },

  flushBridges: async () => {
    await meshApi.flushBridges()
    await get().fetchDevices()
  },

  randomizeDevices: async () => {
    await meshApi.randomizeDevices()
    await get().fetchDevices()
  },

  toggleDevice: async (deviceId) => {
    await meshApi.toggleDevice(deviceId)
    await get().fetchDevices()
  },
}))
