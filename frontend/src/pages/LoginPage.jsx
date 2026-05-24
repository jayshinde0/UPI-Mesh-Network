import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Loader2,
  Radio,
  Shield,
  ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from '../hooks/useToast'
import AuthShell from '../components/layout/AuthShell'

const DEMO_ACCOUNTS = [
  { user: 'alice', pass: 'Alice@123', role: 'User', color: 'bg-sky-500' },
  { user: 'bob', pass: 'Bob@1234', role: 'User', color: 'bg-violet-500' },
  { user: 'charlie', pass: 'Charlie@1', role: 'User', color: 'bg-amber-500' },
  { user: 'admin', pass: 'Admin@123', role: 'Admin', color: 'bg-emerald-500' },
]

function LoginAside() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500/90">
        Mesh payments
      </p>
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        Sign in to your
        <span className="block text-zinc-400">offline wallet</span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
        Send encrypted UPI packets through simulated mesh hops. Settlement runs when a
        bridge node gets connectivity.
      </p>

      <ul className="mt-8 space-y-4">
        {[
          { icon: Radio, text: 'Hop-by-hop gossip with TTL limits' },
          { icon: Shield, text: 'AES-GCM + RSA-OAEP on every packet' },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-zinc-400">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
              <Icon className="h-4 w-4 text-cyan-400/90" />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-10 hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:block">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Demo tip
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          UPI PIN for all seeded accounts is{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-cyan-400">1234</code>
        </p>
      </div>
    </motion.div>
  )
}

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
    <AuthShell aside={<LoginAside />}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-white/[0.08] bg-[#0c0c12]/90 p-6 shadow-2xl shadow-black/40 sm:p-8"
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Enter your credentials or pick a demo account below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-user" className="mb-2 block text-sm font-medium text-zinc-300">
              Username or email
            </label>
            <Input
              id="login-user"
              placeholder="alice"
              value={form.usernameOrEmail}
              onChange={(e) => setForm((f) => ({ ...f, usernameOrEmail: e.target.value }))}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="login-pwd" className="text-sm font-medium text-zinc-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Input
                id="login-pwd"
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                className="pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="default" className="h-11 w-full gap-2 text-base" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-[#0c0c12] px-3 text-zinc-600">Demo accounts</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DEMO_ACCOUNTS.map(({ user, pass, role, color }) => (
            <button
              key={user}
              type="button"
              onClick={() => fillDemo(user, pass)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 transition-all hover:border-cyan-500/25 hover:bg-white/[0.04]"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${color} text-xs font-bold text-white shadow-lg`}
              >
                {user[0].toUpperCase()}
              </span>
              <span className="font-mono text-xs font-medium text-zinc-300 group-hover:text-white">
                {user}
              </span>
              <span className="text-[10px] text-zinc-600">{role}</span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          New here?{' '}
          <Link
            to="/register"
            className="font-medium text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  )
}
