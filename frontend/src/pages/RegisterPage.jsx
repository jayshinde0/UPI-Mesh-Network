import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from '../hooks/useToast'
import MatrixRain from '../components/effects/MatrixRain'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', fullName: '', phoneNumber: '', upiPin: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form)
    if (result.success) {
      toast.success('Account created!', 'Welcome to UPI Mesh Network')
      navigate('/dashboard')
    } else {
      toast.error('Registration failed', result.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden py-10">
      <MatrixRain />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass cyber-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Create Account</h1>
              <p className="text-xs text-gray-500">Join the mesh network</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Username</label>
                <Input placeholder="alice" value={form.username} onChange={set('username')} required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
                <Input placeholder="Alice Sharma" value={form.fullName} onChange={set('fullName')} required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <Input type="email" placeholder="alice@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min 8 chars, upper+lower+digit"
                  value={form.password} onChange={set('password')} required className="pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Phone (optional)</label>
                <Input placeholder="9876543210" value={form.phoneNumber} onChange={set('phoneNumber')} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">UPI PIN (4-6 digits)</label>
                <Input type="password" placeholder="1234" maxLength={6} value={form.upiPin} onChange={set('upiPin')} required />
              </div>
            </div>

            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-xs text-gray-400">
              You'll receive <span className="text-cyan-400 font-semibold">₹10,000</span> demo balance and a unique UPI ID like <span className="text-cyan-400 font-mono">{form.username || 'username'}@upimesh</span>
            </div>

            <Button type="submit" variant="cyber" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</> : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
