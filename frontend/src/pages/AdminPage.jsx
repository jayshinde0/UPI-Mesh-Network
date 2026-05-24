import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../lib/api'
import { formatCurrency, formatDate, getStatusBg, truncateHash } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { toast } from '../hooks/useToast'
import { ShieldCheck, Users, Package, AlertTriangle, Copy, CheckCircle, XCircle } from 'lucide-react'

const tabs = ['Users', 'All Packets', 'Tampered', 'Duplicates', 'Settlements']

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Users')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchTab = async (tab) => {
    setLoading(true)
    try {
      let res
      if (tab === 'Users')       res = await adminApi.getUsers()
      if (tab === 'All Packets') res = await adminApi.getAllPackets()
      if (tab === 'Tampered')    res = await adminApi.getTamperedPackets()
      if (tab === 'Duplicates')  res = await adminApi.getDuplicatePackets()
      if (tab === 'Settlements') res = await adminApi.getSettlements()
      setData(d => ({ ...d, [tab]: res.data.data }))
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTab(activeTab) }, [activeTab])

  const toggleUser = async (id) => {
    await adminApi.toggleUser(id)
    fetchTab('Users')
    toast.success('User status toggled')
  }

  const rows = data[activeTab] ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
        <ShieldCheck className="w-5 h-5 text-red-400" />
        <div>
          <p className="text-sm font-semibold text-white">Admin Panel</p>
          <p className="text-xs text-gray-400">Full system access — handle with care</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === t
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <Card className="glass cyber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {activeTab === 'Users'       && <Users className="w-4 h-4 text-cyan-400" />}
            {activeTab === 'All Packets' && <Package className="w-4 h-4 text-purple-400" />}
            {activeTab === 'Tampered'    && <AlertTriangle className="w-4 h-4 text-red-400" />}
            {activeTab === 'Duplicates'  && <Copy className="w-4 h-4 text-orange-400" />}
            {activeTab === 'Settlements' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {activeTab}
            <span className="ml-auto text-xs text-gray-500 font-normal">{rows.length} records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded shimmer" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-10">No records found</p>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'Users' && (
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-white/5">
                    {['Name','Username','UPI ID','Balance','Role','Status','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {rows.map((u, i) => (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3 text-white font-medium">{u.fullName}</td>
                        <td className="px-4 py-3 font-mono text-cyan-400">{u.username}</td>
                        <td className="px-4 py-3 font-mono text-purple-400">{u.upiId}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400">{formatCurrency(u.balance ?? 0)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.active
                            ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3 h-3" />Active</span>
                            : <span className="flex items-center gap-1 text-red-400"><XCircle className="w-3 h-3" />Inactive</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <Button variant={u.active ? 'destructive' : 'success'} size="sm"
                            onClick={() => toggleUser(u.id)}>
                            {u.active ? 'Disable' : 'Enable'}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}

              {(activeTab === 'All Packets' || activeTab === 'Tampered' || activeTab === 'Duplicates') && (
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-white/5">
                    {['Hash','From','To','TTL','Hops','Status','Tampered','Created'].map(h => (
                      <th key={h} className="text-left px-3 py-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {rows.slice(0, 100).map((p, i) => (
                      <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                        className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-3 py-2 font-mono text-gray-400">{truncateHash(p.packetHash, 10)}</td>
                        <td className="px-3 py-2 font-mono text-cyan-400">{p.senderUpiId?.split('@')[0]}</td>
                        <td className="px-3 py-2 font-mono text-purple-400">{p.receiverUpiId?.split('@')[0]}</td>
                        <td className="px-3 py-2 text-yellow-400">{p.ttl}</td>
                        <td className="px-3 py-2 text-gray-400">{p.hopCount}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBg(p.status)}`}>{p.status}</span>
                        </td>
                        <td className="px-3 py-2">
                          {p.tampered
                            ? <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Yes</span>
                            : <span className="text-gray-600">No</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-gray-500">{formatDate(p.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'Settlements' && (
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-white/5">
                    {['Hash','From','To','Amount','Bridge','Status','Time (ms)','Created'].map(h => (
                      <th key={h} className="text-left px-3 py-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {rows.slice(0, 100).map((s, i) => (
                      <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                        className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-3 py-2 font-mono text-gray-400">{truncateHash(s.packetHash, 10)}</td>
                        <td className="px-3 py-2 font-mono text-cyan-400">{s.senderUpiId?.split('@')[0]}</td>
                        <td className="px-3 py-2 font-mono text-purple-400">{s.receiverUpiId?.split('@')[0]}</td>
                        <td className="px-3 py-2 font-mono text-white font-bold">{s.amount ? formatCurrency(s.amount) : '—'}</td>
                        <td className="px-3 py-2 text-gray-400 font-mono">{s.bridgeDeviceId ?? '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBg(s.status)}`}>{s.status}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-400">{s.processingTimeMs}ms</td>
                        <td className="px-3 py-2 text-gray-500">{formatDate(s.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
