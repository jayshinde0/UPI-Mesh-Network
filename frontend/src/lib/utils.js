import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  }).format(new Date(dateStr))
}

export function truncateHash(hash, len = 12) {
  if (!hash) return '—'
  return hash.length > len ? `${hash.slice(0, len)}...` : hash
}

export function getStatusColor(status) {
  const map = {
    SETTLED:    'text-emerald-400',
    PENDING:    'text-yellow-400',
    PROPAGATING:'text-cyan-400',
    DUPLICATE:  'text-orange-400',
    TAMPERED:   'text-red-400',
    FAILED:     'text-red-500',
    EXPIRED:    'text-gray-400',
    INJECTED:   'text-blue-400',
    BRIDGE_RECEIVED: 'text-purple-400',
    SUCCESS:    'text-emerald-400',
    INSUFFICIENT_BALANCE: 'text-red-400',
  }
  return map[status] || 'text-gray-400'
}

export function getStatusBg(status) {
  const map = {
    SETTLED:    'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    PENDING:    'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    PROPAGATING:'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
    DUPLICATE:  'bg-orange-400/10 text-orange-400 border-orange-400/20',
    TAMPERED:   'bg-red-400/10 text-red-400 border-red-400/20',
    FAILED:     'bg-red-500/10 text-red-500 border-red-500/20',
    EXPIRED:    'bg-gray-400/10 text-gray-400 border-gray-400/20',
    INJECTED:   'bg-blue-400/10 text-blue-400 border-blue-400/20',
    BRIDGE_RECEIVED: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    SUCCESS:    'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  }
  return map[status] || 'bg-gray-400/10 text-gray-400 border-gray-400/20'
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
