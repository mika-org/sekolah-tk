'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  DollarSign,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'

import { syncPpdbToStudent } from '@/actions/admin'

export default function AdminPaymentsPage() {
  const [paymentsList, setPaymentsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionPendingId, setActionPendingId] = useState<string | null>(null)

  // Search & Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payments_tk')
      .select('*, ppdb_tk(student_name)')
      .order('id', { ascending: false })

    if (!error && data) {
      setPaymentsList(data)
    } else {
      setPaymentsList([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleVerify = async (id: string, approve: boolean) => {
    setActionPendingId(id)
    const newStatus = approve ? 'Verified' : 'Rejected'
    
    // Update payment status
    const { error } = await supabase
      .from('payments_tk')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('Gagal mengupdate status: ' + error.message)
    } else {
      // Retrieve the ppdb_id to update payment status in ppdb table too if verified
      const payment = paymentsList.find(p => p.id === id)
      if (payment && approve) {
        if (payment.ppdb_id) {
          const syncResult = await syncPpdbToStudent(payment.ppdb_id)
          if (syncResult.success) {
            toast.success('Pembayaran terverifikasi & data murid berhasil diaktifkan!')
          }
        }
      } else if (payment && !approve) {
        await supabase
          .from('ppdb_tk')
          .update({ payment_status: 'Rejected' })
          .eq('id', payment.ppdb_id)
      }

      setPaymentsList(prev => prev.map(p => 
        p.id === id 
          ? { ...p, status: newStatus }
          : p
      ))
    }
    setActionPendingId(null)
  }

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />
  }

  const filteredList = useMemo(() => {
    return paymentsList.filter((pay) => {
      const studentName = pay.ppdb_tk?.student_name || ''
      const matchSearch =
        !searchQuery ||
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(pay.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(pay.method).toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || pay.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [paymentsList, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, currentPage, pageSize])

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Verifikasi Pembayaran</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Konfirmasi biaya pendaftaran calon siswa baru.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadData} variant="outline" className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Muat Ulang
          </Button>
        </div>
      </div>

      {/* Payments List */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Semua Transaksi Masuk</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Verifikasi bukti transfer bank atau QRIS dari calon orang tua siswa ({filteredList.length} transaksi).</CardDescription>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <TableSearchFilter
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder="Cari nama siswa / metode..."
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
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Verified">Terverifikasi</SelectItem>
                <SelectItem value="Rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data transaksi...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada transaksi yang sesuai.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Calon Siswa</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Jumlah</th>
                    <th className="p-4">Bukti</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedList.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-primary-blue">{pay.ppdb_tk?.student_name || 'N/A'}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">ID: {pay.id.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4 font-bold text-gray-700">{pay.method}</td>
                      <td className="p-4 font-black text-primary-green">
                        Rp {Number(pay.amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        {pay.proof ? (
                          <a
                            href={pay.proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary-blue hover:text-primary-green font-bold transition-colors"
                          >
                            <span>Lihat Bukti</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs font-semibold">Tidak ada berkas</span>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(pay.status)}</td>
                      <td className="p-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pay.status === 'Pending' ? (
                            <>
                              <Button
                                onClick={() => handleVerify(pay.id, true)}
                                disabled={actionPendingId === pay.id}
                                className="h-8 bg-primary-green hover:bg-primary-green/90 text-white font-bold rounded-xl text-xs px-3 cursor-pointer shadow-2xs"
                              >
                                {actionPendingId === pay.id ? 'Memproses...' : 'Verifikasi'}
                              </Button>
                              <Button
                                onClick={() => handleVerify(pay.id, false)}
                                disabled={actionPendingId === pay.id}
                                variant="outline"
                                className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs px-3 cursor-pointer"
                              >
                                Tolak
                              </Button>
                            </>
                          ) : (
                            <span className="text-gray-300 text-xs font-semibold">—</span>
                          )}
                        </div>
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
            totalItems={filteredList.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

    </div>
  )
}
