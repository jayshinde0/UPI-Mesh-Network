import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getMe:         () => api.get('/users/me'),
  getByUpiId:    (upiId) => api.get(`/users/upi/${upiId}`),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  send:            (data) => api.post('/payments/send', data),
  getTransactions: () => api.get('/payments/transactions'),
  getBalance:      () => api.get('/payments/balance'),
}

// ── Mesh ──────────────────────────────────────────────────────────────────────
export const meshApi = {
  getDevices:        () => api.get('/mesh/devices'),
  getOnlineDevices:  () => api.get('/mesh/devices/online'),
  toggleDevice:      (id) => api.post(`/mesh/devices/${id}/toggle`),
  getPackets:        () => api.get('/mesh/packets'),
  getPacketAudit:    (id) => api.get(`/mesh/packets/${id}/audit`),
  injectPacket:      (id) => api.post(`/mesh/simulate/inject/${id}`),
  simulateTamper:    (id) => api.post(`/mesh/simulate/tamper/${id}`),
  resetMesh:         () => api.post('/mesh/simulate/reset'),
  flushBridges:      () => api.post('/mesh/simulate/flush-bridges'),
  randomizeDevices:  () => api.post('/mesh/simulate/randomize-devices'),
}

// ── Bridge ────────────────────────────────────────────────────────────────────
export const bridgeApi = {
  settle:     (packetId, bridgeDeviceId) => api.post(`/bridge/settle/${packetId}`, { bridgeDeviceId }),
  getLogs:    () => api.get('/bridge/logs'),
  getLogsByHash: (hash) => api.get(`/bridge/logs/${hash}`),
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard:   () => api.get('/analytics/dashboard'),
  getNetwork:     () => api.get('/analytics/network'),
  getTopSenders:  () => api.get('/analytics/top-senders'),
}

// ── Encryption ────────────────────────────────────────────────────────────────
export const encryptionApi = {
  encrypt:    (plaintext) => api.post('/encryption/encrypt', { plaintext }),
  decrypt:    (data) => api.post('/encryption/decrypt', data),
  hash:       (data) => api.post('/encryption/hash', { data }),
  getPublicKey: () => api.get('/encryption/public-key'),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers:          () => api.get('/admin/users'),
  toggleUser:        (id) => api.post(`/admin/users/${id}/toggle`),
  getAllPackets:      () => api.get('/admin/packets'),
  getTamperedPackets:() => api.get('/admin/packets/tampered'),
  getDuplicatePackets:()=> api.get('/admin/packets/duplicate'),
  getSettlements:    () => api.get('/admin/settlements'),
}

export default api
