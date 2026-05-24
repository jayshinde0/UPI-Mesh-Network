import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { paymentApi } from '../lib/api'
import { formatCurrency, formatDate, getStatusBg, truncateHash } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { History, Search, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function TransactionsPage() {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentApi.getTransactions().then(({ data }) => {
      setTransactions(data.data)
      setFiltered(data.data)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = transactions
    if (statusFilter !== 'ALL') result = result.filter(t => t.status === statusFilter)
    if (search) result = result.filter(t =>
      t.senderUpiId?.includes(search) ||
      t.receiverUpiId?.includes(search) ||
      t.transactionHash?.includes(search)
    )
    setFiltered(result)
  }, [search, statusFilter, transactions])

  const statuses = ['ALL', 'SETTLED', 'PENDING', 'PROPAGATING', 'DUPLICATE', 'TAMPERED', 'FAILED']

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass cyber-border">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input placeholder="Search by UPI ID or hash..." className="pl-9"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass cyber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Transaction History
            <span className="ml-auto text-xs text-gray-500 font-normal">{filtered.length} records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Type','From','To','Amount','Hash','Hops','Status','Time'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const isSent = t.senderUpiId === user?.upiId
                    return (
                      <motion.tr key={t.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {isSent
                            ? <ArrowUpRight className="w-4 h-4 text-red-400" />
                            : <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                          }
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-400">{t.senderUpiId}</td>
                        <td className="px-4 py-3 font-mono text-purple-400">{t.receiverUpiId}</td>
                        <td className="px-4 py-3 font-mono font-bold text-white">{formatCurrency(t.amount)}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{truncateHash(t.transactionHash)}</td>
                        <td className="px-4 py-3 text-gray-400">{t.propagationHops ?? 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBg(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
