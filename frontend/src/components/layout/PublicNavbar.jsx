import { Link, useLocation } from 'react-router-dom'
import { Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'

const links = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Sign In' },
  { to: '/register', label: 'Register' },
]

export default function PublicNavbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (to) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08080c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 transition-colors group-hover:border-cyan-500/40">
            <Zap className="h-4 w-4 text-cyan-400" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-white">
              UPI Mesh
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              Offline Network
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-white/8 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {pathname !== '/login' && (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-zinc-300">
                Sign In
              </Button>
            </Link>
          )}
          {pathname !== '/register' && (
            <Link to="/register">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#08080c] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                  isActive(to) ? 'bg-white/8 text-white' : 'text-zinc-400'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-white/[0.06] pt-3">
            <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/register" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="default" size="sm" className="w-full">
                Register
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
