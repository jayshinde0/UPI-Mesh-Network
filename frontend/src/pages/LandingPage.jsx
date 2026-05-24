import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Zap, Shield, Radio, Lock, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import MatrixRain from '../components/effects/MatrixRain'
import PublicNavbar from '../components/layout/PublicNavbar'

const features = [
  { icon: Radio,  title: 'Mesh Propagation',  desc: 'Payments travel hop-by-hop through nearby devices using gossip protocol with TTL management.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Lock,   title: 'AES-256-GCM + RSA', desc: 'Hybrid encryption: payload encrypted with AES-GCM, key wrapped with RSA-OAEP for maximum security.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Shield, title: 'Tamper Detection',  desc: 'SHA-256 hash verification detects any packet modification. Tampered packets are instantly rejected.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Zap,    title: 'Idempotent Settlement', desc: 'Redis SETNX prevents duplicate settlements. Atomic compare-and-set ensures exactly-once processing.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      <MatrixRain />

      <div className="relative z-10">
        <PublicNavbar />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            SIMULATION PLATFORM · EDUCATIONAL PURPOSE
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text">Offline UPI</span>
            <br />
            <span className="text-white">Mesh Network</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Send payments without internet. Encrypted packets travel through nearby devices
            via Bluetooth-style mesh propagation until a bridge node reaches connectivity.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register">
              <Button variant="cyber" size="lg" className="gap-2">
                Launch Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </motion.div>

        {/* Animated mesh preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 w-full max-w-3xl mx-auto"
        >
          <MeshPreview />
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass cyber-border rounded-xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo credentials */}
      <section className="relative z-10 px-8 pb-20 max-w-2xl mx-auto text-center">
        <div className="glass cyber-border rounded-xl p-6">
          <h3 className="font-semibold text-white mb-4">Demo Credentials</h3>
          <div className="grid grid-cols-2 gap-3 text-sm font-mono">
            {[
              ['alice / Alice@123', 'User'],
              ['admin / Admin@123', 'Admin'],
              ['bob / Bob@1234', 'User'],
              ['charlie / Charlie@1', 'User'],
            ].map(([cred, role]) => (
              <div key={cred} className="bg-white/3 rounded-lg p-3 text-left">
                <p className="text-cyan-400">{cred}</p>
                <p className="text-gray-500 text-xs">{role}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">UPI PIN for all demo accounts: <span className="text-cyan-400 font-mono">1234</span></p>
        </div>
      </section>
    </div>
  )
}

function MeshPreview() {
  const nodes = [
    { x: 80,  y: 60,  label: 'Alice',   color: '#00d4ff', bridge: false },
    { x: 240, y: 30,  label: 'Relay-1', color: '#7c3aed', bridge: false },
    { x: 400, y: 60,  label: 'Relay-2', color: '#7c3aed', bridge: false },
    { x: 560, y: 30,  label: 'Bridge',  color: '#10b981', bridge: true  },
    { x: 160, y: 130, label: 'Relay-3', color: '#7c3aed', bridge: false },
    { x: 320, y: 130, label: 'Relay-4', color: '#7c3aed', bridge: false },
    { x: 480, y: 130, label: 'Bob',     color: '#ec4899', bridge: false },
  ]
  const edges = [[0,1],[1,2],[2,3],[0,4],[4,5],[5,6],[2,5],[1,4],[3,6]]

  return (
    <div className="glass cyber-border rounded-2xl p-6">
      <svg viewBox="0 0 640 180" className="w-full">
        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x} y1={nodes[a].y}
            x2={nodes[b].x} y2={nodes[b].y}
            stroke="rgba(0,212,255,0.2)" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <motion.circle
              cx={n.x} cy={n.y} r={n.bridge ? 14 : 10}
              fill={n.color + '22'} stroke={n.color} strokeWidth="1.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08 }}
            />
            {n.bridge && (
              <motion.circle
                cx={n.x} cy={n.y} r={20}
                fill="none" stroke={n.color} strokeWidth="1" opacity="0.3"
                animate={{ r: [20, 28, 20], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <text x={n.x} y={n.y + 26} textAnchor="middle" fill={n.color}
              fontSize="9" fontFamily="monospace">{n.label}</text>
          </g>
        ))}
        {/* Animated packet */}
        <motion.circle
          r={4} fill="#00d4ff"
          animate={{ cx: [80,240,400,560], cy: [60,30,60,30] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }}
        />
      </svg>
      <p className="text-center text-xs text-gray-500 mt-2 font-mono">
        Encrypted packet propagating through mesh → Bridge node → Settlement
      </p>
    </div>
  )
}
