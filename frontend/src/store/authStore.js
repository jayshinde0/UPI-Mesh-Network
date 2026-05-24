import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, userApi } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await authApi.login(credentials)
          const { accessToken, refreshToken, user } = data.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.error || 'Login failed'
          set({ error: msg, isLoading: false })
          return { success: false, error: msg }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await authApi.register(userData)
          const { accessToken, refreshToken, user } = data.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false })
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.error || 'Registration failed'
          set({ error: msg, isLoading: false })
          return { success: false, error: msg }
        }
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      refreshProfile: async () => {
        try {
          const { data } = await userApi.getMe()
          set({ user: data.data })
        } catch {}
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'upi-mesh-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
