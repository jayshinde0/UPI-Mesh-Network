import { create } from 'zustand'

let toastId = 0

export const useToast = create((set, get) => ({
  toasts: [],

  toast: ({ title, message, type = 'info', duration = 4000 }) => {
    const id = ++toastId
    set(state => ({ toasts: [...state.toasts, { id, title, message, type }] }))
    setTimeout(() => get().dismiss(id), duration)
    return id
  },

  dismiss: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id),
  })),
}))

// Convenience helpers
export const toast = {
  success: (title, message) => useToast.getState().toast({ title, message, type: 'success' }),
  error:   (title, message) => useToast.getState().toast({ title, message, type: 'error' }),
  warning: (title, message) => useToast.getState().toast({ title, message, type: 'warning' }),
  info:    (title, message) => useToast.getState().toast({ title, message, type: 'info' }),
}
