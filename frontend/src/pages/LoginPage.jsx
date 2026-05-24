import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from '../hooks/useToast'
import MatrixRain from '../components/effects/MatrixRain'

export default function LoginPage() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form)
    if (result.success) {
      toast.success('Welcome back!', 'Logged in successfully')
      navigate('/dashboard')
    } else {
      toast.error('Login failed', result.error)
    }
  }

  const fillDemo = (user, pass) => setForm({ usernameOrEmail: user, password: pass })

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
      <MatrixRain />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass cyber-border rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sign In</h1>
              <p className="text-xs text-gray-500">UPI Offline Mesh Network</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Username or Email</label>
              <Input
                placeholder="alice or alice@upimesh.dev"
                value={form.usernameOrEmail}
                onChange={e => setForm(f => ({ ...f, usernameOrEmail: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="cyber" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Authenticating...</> : 'Sign In'}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-3 text-center">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              {[['alice','Alice@123','User'],['admin','Admin@123','Admin'],['bob','Bob@1234','User'],['charlie','Charlie@1','User']].map(([u,p,r]) => (
                <button key={u} onClick={() => fillDemo(u, p)}
                  className="text-left px-3 py-2 rounded-lg bg-white/3 border border-white/8 hover:border-cyan-500/30 transition-all">
                  <p className="text-xs text-cyan-400 font-mono">{u}</p>
                  <p className="text-[10px] text-gray-500">{r}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
