import { useToast } from '../../hooks/useToast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error:   <AlertCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  info:    <Info className="w-4 h-4 text-cyan-400" />,
}

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error:   'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  info:    'border-cyan-500/30 bg-cyan-500/10',
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm ${colors[toast.type] || colors.info}`}
          >
            <div className="mt-0.5">{icons[toast.type] || icons.info}</div>
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-sm font-semibold text-white">{toast.title}</p>}
              {toast.message && <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>}
            </div>
            <button onClick={() => dismiss(toast.id)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
