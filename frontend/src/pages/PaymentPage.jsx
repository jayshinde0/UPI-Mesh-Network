import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Lock, CheckCircle, Loader2, Search, Radio } from 'lucide-react'
import { paymentApi, userApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { formatCurrency, truncateHash } from '../lib/utils'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { toast } from '../hooks/useToast'

const steps = ['Enter Details', 'Verify & Encrypt', 'Inject to Mesh']

export default function PaymentPage() {
  const { user, refreshProfile } = useAuthStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ receiverUpiId: '', amount: '', upiPin: '', note: '' })
  const [receiver, setReceiver] = useState(null)
  const [packet, setPacket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const lookupReceiver = async () => {
    if (!form.receiverUpiId) return
    setLookingUp(true)
    try {
      const { data } = await userApi.getByUpiId(form.receiverUpiId)
      setReceiver(data.data)
      toast.success('Receiver found', data.data.fullName)
    } catch {
      toast.error('Not found', 'UPI ID does not exist')
      setReceiver(null)
    } finally { setLookingUp(false) }
  }

  const handleSend = async () => {
    setLoading(true)
    try {
      const { data } = await paymentApi.send({
        receiverUpiId: form.receiverUpiId,
        amount: parseFloat(form.amount),
        upiPin: form.upiPin,
        note: form.note,
      })
      setPacket(data.data)
      setStep(2)
      refreshProfile()
      toast.success('Packet injected!', 'Payment is propagating through mesh')
    } catch (err) {
      toast.error('Payment failed', err.response?.data?.error || 'Unknown error')
    } finally { setLoading(false) }
  }

  const reset = () => {
    setStep(0); setForm({ receiverUpiId: '', amount: '', upiPin: '', note: '' })
    setReceiver(null); setPacket(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-emerald-500 text-white' :
              i === step ? 'bg-cyan-500 text-black' :
              'bg-white/10 text-gray-500'
            }`}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs ${i === step ? 'text-white' : 'text-gray-500'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Enter details */}
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="w-4 h-4 text-cyan-400" /> Send Payment via Mesh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Receiver lookup */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Receiver UPI ID</label>
                  <div className="flex gap-2">
                    <Input placeholder="bob@upimesh" value={form.receiverUpiId} onChange={set('receiverUpiId')} />
                    <Button variant="outline" size="icon" onClick={lookupReceiver} disabled={lookingUp}>
                      {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {receiver && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                        {receiver.fullName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{receiver.fullName}</p>
                        <p className="text-xs text-gray-400 font-mono">{receiver.upiId}</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Amount (₹)</label>
                  <Input type="number" placeholder="500.00" min="1" max="100000"
                    value={form.amount} onChange={set('amount')} />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: <span className="text-cyan-400 font-mono">{formatCurrency(user?.balance ?? 0)}</span>
                  </p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Note (optional)</label>
                  <Input placeholder="Lunch split, rent, etc." value={form.note} onChange={set('note')} />
                </div>

                <Button variant="cyber" className="w-full" onClick={() => setStep(1)}
                  disabled={!form.receiverUpiId || !form.amount || parseFloat(form.amount) <= 0}>
                  Continue to Verify
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 1: Verify & PIN */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="glass cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4 text-purple-400" /> Verify & Encrypt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="bg-white/3 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">From</span>
                    <span className="text-cyan-400 font-mono">{user?.upiId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">To</span>
                    <span className="text-purple-400 font-mono">{form.receiverUpiId}</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Amount</span>
                    <span className="text-white font-bold text-lg font-mono">{formatCurrency(parseFloat(form.amount))}</span>
                  </div>
                </div>

                {/* Encryption info */}
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 text-xs space-y-1">
                  <p className="text-purple-400 font-semibold">🔐 Encryption Flow</p>
                  <p className="text-gray-400">1. Generate random AES-256 key</p>
                  <p className="text-gray-400">2. Encrypt payload with AES-GCM</p>
                  <p className="text-gray-400">3. Wrap AES key with RSA-OAEP public key</p>
                  <p className="text-gray-400">4. Compute SHA-256 hash for integrity</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">UPI PIN</label>
                  <Input type="password" placeholder="Enter your 4-6 digit PIN"
                    maxLength={6} value={form.upiPin} onChange={set('upiPin')} />
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                  <Button variant="cyber" className="flex-1" onClick={handleSend}
                    disabled={loading || !form.upiPin}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Encrypting...</> : 'Send & Inject'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Success */}
        {step === 2 && packet && (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass border-emerald-500/30">
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto"
                >
                  <Radio className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-white">Packet Injected!</h3>
                  <p className="text-sm text-gray-400 mt-1">Your payment is propagating through the mesh network</p>
                </div>
                <div className="bg-white/3 rounded-lg p-4 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Packet Hash</span>
                    <span className="text-cyan-400">{truncateHash(packet.packetHash, 20)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TTL</span>
                    <span className="text-white">{packet.ttl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-yellow-400">{packet.status}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={reset}>New Payment</Button>
                  <Button variant="secondary" className="flex-1" onClick={() => window.location.href = '/mesh'}>
                    View in Mesh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
