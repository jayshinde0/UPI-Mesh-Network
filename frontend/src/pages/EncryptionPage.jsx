import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { encryptionApi } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { toast } from '../hooks/useToast'
import { Lock, Unlock, Hash, Key, ChevronRight, Loader2, Copy } from 'lucide-react'

const FlowStep = ({ step, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
    className={`flex items-start gap-3 p-4 rounded-xl border ${color} bg-opacity-5`}>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${color.replace('border-','bg-').replace('/30','/20')} ${color.replace('border-','text-').replace('/30','')}`}>
      {step}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-white mb-1">{label}</p>
      {value && (
        <p className="text-[10px] font-mono text-gray-400 break-all line-clamp-3">{value}</p>
      )}
    </div>
  </motion.div>
)

export default function EncryptionPage() {
  const [plaintext, setPlaintext] = useState('{"senderUpiId":"alice@upimesh","receiverUpiId":"bob@upimesh","amount":500,"nonce":"abc123"}')
  const [result, setResult] = useState(null)
  const [decrypted, setDecrypted] = useState(null)
  const [hash, setHash] = useState(null)
  const [hashInput, setHashInput] = useState('')
  const [publicKey, setPublicKey] = useState(null)
  const [loading, setLoading] = useState({})

  const doEncrypt = async () => {
    setLoading(l => ({ ...l, enc: true }))
    try {
      const { data } = await encryptionApi.encrypt(plaintext)
      setResult(data.data)
      setDecrypted(null)
      toast.success('Encrypted', 'Payload encrypted with AES-256-GCM + RSA-OAEP')
    } catch { toast.error('Encryption failed') }
    finally { setLoading(l => ({ ...l, enc: false })) }
  }

  const doDecrypt = async () => {
    if (!result) return
    setLoading(l => ({ ...l, dec: true }))
    try {
      const { data } = await encryptionApi.decrypt(result)
      setDecrypted(data.data.decryptedPayload)
      toast.success('Decrypted', 'Payload successfully decrypted')
    } catch { toast.error('Decryption failed') }
    finally { setLoading(l => ({ ...l, dec: false })) }
  }

  const doHash = async () => {
    setLoading(l => ({ ...l, hash: true }))
    try {
      const { data } = await encryptionApi.hash(hashInput || plaintext)
      setHash(data.data.hash)
    } catch { toast.error('Hash failed') }
    finally { setLoading(l => ({ ...l, hash: false })) }
  }

  const getKey = async () => {
    setLoading(l => ({ ...l, key: true }))
    try {
      const { data } = await encryptionApi.getPublicKey()
      setPublicKey(data.data)
    } catch { toast.error('Failed to fetch key') }
    finally { setLoading(l => ({ ...l, key: false })) }
  }

  const copy = (text) => { navigator.clipboard.writeText(text); toast.info('Copied to clipboard') }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Encryption flow diagram */}
      <Card className="glass cyber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" /> Hybrid Encryption Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400 mb-4">
            {['Plaintext JSON','AES-256 Key Gen','AES-GCM Encrypt','RSA-OAEP Wrap Key','Packet Hash (SHA-256)','Mesh Packet'].map((s, i, arr) => (
              <div key={s} className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">{s}</span>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-gray-600" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encrypt panel */}
        <Card className="glass cyber-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> Encrypt Payload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Plaintext JSON</label>
              <textarea
                className="w-full h-28 bg-white/5 border border-white/10 rounded-lg p-3 text-xs font-mono text-white resize-none focus:outline-none focus:border-cyan-500/50"
                value={plaintext}
                onChange={e => setPlaintext(e.target.value)}
              />
            </div>
            <Button variant="cyber" className="w-full gap-2" onClick={doEncrypt} disabled={loading.enc}>
              {loading.enc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Encrypt with AES-256-GCM + RSA
            </Button>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <FlowStep step="1" label="Encrypted Payload (AES-GCM)" value={result.encryptedPayload?.slice(0, 80) + '...'} color="border-cyan-500/30" delay={0} />
                  <FlowStep step="2" label="Encrypted AES Key (RSA-OAEP)" value={result.encryptedAesKey?.slice(0, 80) + '...'} color="border-purple-500/30" delay={0.1} />
                  <FlowStep step="3" label="IV (Initialization Vector)" value={result.iv} color="border-yellow-500/30" delay={0.2} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={doDecrypt} disabled={loading.dec}>
                      {loading.dec ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                      Decrypt
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => copy(JSON.stringify(result, null, 2))}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {decrypted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-emerald-400 font-semibold mb-1">✓ Decrypted Successfully</p>
                      <p className="text-[10px] font-mono text-gray-300 break-all">{decrypted}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Hash + Key panel */}
        <div className="space-y-4">
          <Card className="glass cyber-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-yellow-400" /> SHA-256 Hash
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Data to hash (leave empty to hash plaintext)"
                value={hashInput} onChange={e => setHashInput(e.target.value)} />
              <Button variant="outline" className="w-full gap-2" onClick={doHash} disabled={loading.hash}>
                {loading.hash ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
                Compute Hash
              </Button>
              {hash && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400 font-semibold mb-1">SHA-256 Hash</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono text-gray-300 break-all flex-1">{hash}</p>
                    <button onClick={() => copy(hash)} className="text-gray-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="glass cyber-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" /> RSA Public Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2" onClick={getKey} disabled={loading.key}>
                {loading.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Fetch Server Public Key
              </Button>
              {publicKey && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-emerald-400 font-semibold">{publicKey.algorithm} · {publicKey.encryptionScheme}</p>
                    <button onClick={() => copy(publicKey.publicKey)} className="text-gray-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-gray-400 break-all line-clamp-4">{publicKey.publicKey}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
