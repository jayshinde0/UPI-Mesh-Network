import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, ArrowRight, Wallet } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from '../hooks/useToast'
import AuthShell from '../components/layout/AuthShell'

function RegisterAside() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500/90">
        Join the network
      </p>
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        Create your
        <span className="block text-zinc-400">mesh identity</span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
        Get a unique UPI ID, demo balance, and access to the full offline payment simulator.
      </p>

      <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-emerald-400/90">Starter balance</p>
          <p className="mt-1 text-sm text-zinc-500">
            New accounts receive ₹10,000 demo balance for testing payments and mesh flows.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    upiPin: '',
  })
  const [showPwd, setShowPwd] = useState(false)
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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

  const upiPreview = form.username ? `${form.username}@upimesh` : 'username@upimesh'

  return (
    <AuthShell aside={<RegisterAside />}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-white/[0.08] bg-[#0c0c12]/90 p-6 shadow-2xl shadow-black/40 sm:p-8"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Create account</h2>
          <p className="mt-1 text-sm text-zinc-500">All fields marked below are required unless noted.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Username</label>
              <Input placeholder="alice" value={form.username} onChange={set('username')} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">Full name</label>
              <Input placeholder="Alice Sharma" value={form.fullName} onChange={set('fullName')} required />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Email</label>
            <Input
              type="email"
              placeholder="alice@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Password</label>
            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                placeholder="Min 8 chars"
                value={form.password}
                onChange={set('password')}
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Phone <span className="text-zinc-600">(optional)</span>
              </label>
              <Input placeholder="9876543210" value={form.phoneNumber} onChange={set('phoneNumber')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">UPI PIN</label>
              <Input
                type="password"
                placeholder="1234"
                maxLength={6}
                value={form.upiPin}
                onChange={set('upiPin')}
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs text-zinc-500">
            Your UPI ID will be{' '}
            <span className="font-mono font-medium text-cyan-400">{upiPreview}</span>
          </div>

          <Button type="submit" variant="default" className="h-11 w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}
