'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  FileSpreadsheet,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react'

export default function ReportsPage() {
  const [ppdbList, setPpdbList] = useState<any[]>([])
  const [paymentsList, setPaymentsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const [ppdbRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/data?table=ppdb_tk&orderBy=created_at&ascending=false'),
        fetch('/api/admin/data?table=payments_tk')
      ])
      const [ppdbResult, paymentsResult] = await Promise.all([ppdbRes.json(), paymentsRes.json()])
      setPpdbList(ppdbResult.data || [])
      setPaymentsList(paymentsResult.data || [])
    } catch {
      setPpdbList([]); setPaymentsList([])
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  // Compute stats
  const totalPPDB = ppdbList.length
  const pending = ppdbList.filter(a => ['Submitted', 'Verifikasi Berkas'].includes(a.status)).length
  const accepted = ppdbList.filter(a => a.status === 'Diterima').length
  const rejected = ppdbList.filter(a => a.status === 'Ditolak').length

  const verifiedPayments = paymentsList.filter(p => p.status === 'Verified')
  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const pendingPayments = paymentsList.filter(p => p.status === 'Pending').length

  const acceptanceRate = totalPPDB > 0 ? Math.round((accepted / totalPPDB) * 100) : 0

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />
  }

  const filteredPPDB = useMemo(() => {
    return ppdbList.filter((app) => {
      const matchSearch =
        !searchQuery ||
        (app.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(app.id).toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || app.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [ppdbList, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredPPDB.length / pageSize) || 1
  const paginatedPPDB = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPPDB.slice(start, start + pageSize)
  }, [filteredPPDB, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-primary-blue">Laporan SPMB</h1>
        <p className="text-gray-500 font-semibold text-xs mt-1">Ringkasan statistik seleksi penerimaan murid baru dan keuangan.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Users, color: 'bg-primary-blue/10 text-primary-blue', label: 'Total Pendaftar', value: totalPPDB },
          { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Menunggu Review', value: pending },
          { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', label: 'Diterima', value: accepted },
          { icon: XCircle, color: 'bg-rose-100 text-rose-700', label: 'Ditolak', value: rejected },
        ].map((stat, i) => (
          <Card key={i} className="bg-white rounded-3xl shadow-sm border-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <stat.icon size={22} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">{stat.label}</div>
                <div className="text-2xl font-black text-primary-blue">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center"><DollarSign size={20} /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Total Pendapatan PPDB</div>
                <div className="text-xl font-black text-primary-green">Rp {totalRevenue.toLocaleString('id-ID')}</div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">{verifiedPayments.length} pembayaran diverifikasi</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center"><Clock size={20} /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Pembayaran Menunggu</div>
                <div className="text-xl font-black text-amber-600">{pendingPayments} Transaksi</div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">Perlu verifikasi bukti transfer</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center"><TrendingUp size={20} /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-gray-400">Tingkat Penerimaan</div>
                <div className="text-xl font-black text-primary-blue">{acceptanceRate}%</div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold">{accepted} dari {totalPPDB} pendaftar diterima</p>
          </CardContent>
        </Card>
      </div>

      {/* SPMB Table */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Semua Pendaftaran SPMB</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Rekap seluruh pendaftaran seleksi penerimaan murid baru ({filteredPPDB.length} pendaftar).</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <TableSearchFilter
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder="Cari nama calon siswa..."
            />

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) {
                  setStatusFilter(val)
                  setCurrentPage(1)
                }
              }}
            >
              <SelectTrigger className="h-9 w-36 bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Submitted">Baru Masuk</SelectItem>
                <SelectItem value="Verifikasi Berkas">Verifikasi</SelectItem>
                <SelectItem value="Diterima">Diterima</SelectItem>
                <SelectItem value="Ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat laporan...</div>
          ) : filteredPPDB.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada data pendaftar yang sesuai.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Nama Calon Siswa</th>
                    <th className="p-4">Tgl. Daftar</th>
                    <th className="p-4">Status PPDB</th>
                    <th className="p-4">Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedPPDB.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-primary-blue">{app.student_name}</div>
                        <div className="text-[10px] text-gray-400 font-semibold">{app.id.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4 text-xs text-gray-600 font-semibold">
                        {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4">{getStatusBadge(app.status)}</td>
                      <td className="p-4">
                        <StatusBadge status={app.payment_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPPDB.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  )
}
