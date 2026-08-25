'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { uploadPaymentProof } from '@/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import { toast } from 'sonner'
import { CreditCard, CheckCircle2, Sparkles, DollarSign, ExternalLink } from 'lucide-react'

export default function BillingPage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPending, setPaymentPending] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    
    let user = null
    const match = document.cookie.match(new RegExp('(^| )sekolah_tk_token=([^;]+)'))
    if (match) {
      try {
        const token = match[2]
        const parts = token.split('.')
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        const payload = JSON.parse(payloadJson)
        user = {
          id: payload.id,
          email: payload.email,
          user_metadata: {
            role: payload.role,
            username: payload.username,
            student_name: payload.username === 'orangtua' ? 'Althaf Syahputra' : ''
          }
        }
      } catch (e) {
        console.error('Error decoding cookie token:', e)
      }
    }

    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    }
    
    let studentId = ''

    if (user) {
      const { data: parent } = await supabase
        .from('parents_tk')
        .select('student_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (parent && parent.student_id) {
        studentId = parent.student_id
        const { data: stud } = await supabase
          .from('students_tk')
          .select('*')
          .eq('id', studentId)
          .maybeSingle()
        if (stud) {
          setStudentData(stud)
        }
      } else {
        const studentName = user.user_metadata?.student_name || (user.user_metadata?.username === 'orangtua' ? 'Althaf Syahputra' : '')
        if (studentName) {
          const { data: stud } = await supabase
            .from('students_tk')
            .select('*')
            .eq('nama', studentName)
            .maybeSingle()
          if (stud) {
            setStudentData(stud)
            studentId = stud.id
          }
        }
      }
    }

    // Load payments
    const { data: pays } = await supabase
      .from('payments_tk')
      .select('*')
      .order('id', { ascending: false })

    if (pays) {
      setPayments(pays)
    }

    setLoading(false)
  }

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentFile) {
      toast.error('Pilih berkas bukti pembayaran terlebih dahulu.')
      return
    }

    setPaymentPending(true)
    try {
      const fd = new FormData()
      fd.append('file', paymentFile)
      const uploadRes = await uploadPaymentProof(fd)
      if ('error' in uploadRes && uploadRes.error) throw new Error(uploadRes.error)

      // Save proof record to payments_tk
      const { error: insertError } = await supabase.from('payments_tk').insert({
        method: 'Transfer',
        amount: 250000,
        proof: uploadRes.proofUrl,
        status: 'Pending'
      })

      if (insertError) throw insertError

      setPaymentSuccess(true)
      toast.success('Bukti pembayaran berhasil diunggah! Status: Menunggu Verifikasi Admin.')
      loadData()
    } catch (err: any) {
      toast.error('Gagal mengunggah: ' + (err.message || 'Unknown error'))
    } finally {
      setPaymentPending(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        !searchQuery ||
        (p.method || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.status || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.amount || '').includes(searchQuery)
      return matchSearch
    })
  }, [payments, searchQuery])

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPayments.slice(start, start + pageSize)
  }, [filteredPayments, currentPage, pageSize])

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Memuat tagihan & pembayaran...</div>
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <DollarSign size={12} className="text-amber-400" />
            <span>Keuangan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Tagihan SPP & Pembayaran</h1>
          <p className="text-gray-300 font-medium text-xs">Kelola administrasi bulanan sekolah dan kirim bukti transfer Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SPP Bills & History */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <CreditCard className="text-primary-green" />
                  Riwayat Pembayaran
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">Daftar transaksi pembayaran SPP dan pendaftaran.</CardDescription>
              </div>

              <TableSearchFilter
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val)
                  setCurrentPage(1)
                }}
                placeholder="Cari transaksi..."
              />
            </CardHeader>
            <CardContent className="p-0">
              {filteredPayments.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-semibold">Belum ada riwayat transaksi pembayaran.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedPayments.map((pay) => (
                    <div key={pay.id} className="p-5 px-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div>
                        <div className="font-extrabold text-primary-blue text-sm">Pembayaran via {pay.method}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          Jumlah: <span className="font-bold text-primary-green">Rp {Number(pay.amount || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pay.proof && (
                          <a
                            href={pay.proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-blue hover:text-primary-green font-bold flex items-center gap-1"
                          >
                            <span>Bukti</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <StatusBadge status={pay.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPayments.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[5, 10, 20]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Upload Proof */}
        <div className="lg:col-span-5">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden sticky top-6">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Kirim Bukti Pembayaran Baru</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUploadPayment} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-primary-blue">Nama Siswa:</span>
                  <div className="font-extrabold text-primary-blue text-sm">{studentData?.nama || 'Murid Terdaftar'}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-extrabold text-primary-blue">Pilih Foto Bukti Transfer</Label>
                  {paymentSuccess ? (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Bukti berhasil diunggah!
                    </div>
                  ) : (
                    <>
                      <Input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                        className="bg-[#F8F6F2] border-transparent text-xs rounded-xl cursor-pointer py-3 h-auto" 
                      />
                      <Button 
                        type="submit" 
                        disabled={paymentPending}
                        className="w-full bg-primary-green hover:bg-primary-green/90 text-white rounded-xl text-xs py-3 h-auto cursor-pointer font-bold mt-2 shadow-sm"
                      >
                        {paymentPending ? 'Mengunggah...' : 'Unggah Bukti Bayar'}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
