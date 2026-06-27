'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react'

export default function AdminPaymentsPage() {
  const [paymentsList, setPaymentsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionPendingId, setActionPendingId] = useState<string | null>(null)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/data?table=payments_tk')
      const result = await res.json()
      setPaymentsList(result.data || [])
    } catch {
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
        await supabase
          .from('ppdb_tk')
          .update({ payment_status: 'Verified', status: 'Verifikasi Berkas' })
          .eq('id', payment.ppdb_id)
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
    switch (status) {
      case 'Pending': return <Badge className="bg-amber-100 text-amber-800 border-none rounded-full px-3 py-1 font-bold">Pending</Badge>
      case 'Verified': return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-full px-3 py-1 font-bold">Terverifikasi</Badge>
      case 'Rejected': return <Badge className="bg-rose-100 text-rose-800 border-none rounded-full px-3 py-1 font-bold">Ditolak</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800 border-none rounded-full px-3 py-1 font-bold">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Verifikasi Pembayaran</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Konfirmasi biaya pendaftaran calon siswa baru sebesar Rp 250.000.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadData} variant="outline" className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs cursor-pointer">
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Payments List */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Semua Transaksi Masuk</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Verifikasi bukti transfer bank atau QRIS dari calon orang tua siswa.</CardDescription>
          </div>
          <DollarSign className="text-primary-green" />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data transaksi...</div>
          ) : paymentsList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada transaksi pendaftaran masuk.</div>
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
                  {paymentsList.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-55/10 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-primary-blue">{pay.ppdb_tk?.student_name || 'N/A'}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">ID: {pay.id.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4 font-bold text-gray-700">{pay.method}</td>
                      <td className="p-4 font-black text-primary-green">
                        Rp {pay.amount.toLocaleString('id-ID')}
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
                      <td className="p-4 pr-8 text-right space-x-2">
                        {pay.status === 'Pending' && (
                          <>
                            <Button
                              onClick={() => handleVerify(pay.id, true)}
                              disabled={actionPendingId === pay.id}
                              className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer"
                            >
                              Verifikasi
                            </Button>
                            <Button
                              onClick={() => handleVerify(pay.id, false)}
                              disabled={actionPendingId === pay.id}
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer"
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        {pay.status === 'Verified' && (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">Lunas</Badge>
                        )}
                        {pay.status === 'Rejected' && (
                          <Badge className="bg-rose-50 text-rose-600 border-none font-bold">Ditolak</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
