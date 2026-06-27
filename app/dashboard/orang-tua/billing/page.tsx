'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CreditCard, CheckCircle2, Sparkles, DollarSign } from 'lucide-react'

export default function BillingPage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPending, setPaymentPending] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    
    // 1. Try to read from cookie first (custom POS-style auth)
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
      // 1. First, try to query parents_tk by user_id to get linked student_id
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
        // 2. Fallback to name-based match for mock/seeded logins
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
      // Upload bukti ke Supabase Storage (bucket: payment-proofs)
      const fileExt = paymentFile.name.split('.').pop()
      const filePath = `proofs/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, paymentFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath)

      // Save proof record to payments_tk
      await supabase.from('payments_tk').insert({
        method: 'Transfer',
        amount: 250000,
        proof: publicUrl,
        status: 'Pending'
      })

      setPaymentSuccess(true)
      toast.success('Bukti pembayaran berhasil diunggah! Status: Menunggu Verifikasi Admin.')
    } catch (err: any) {
      toast.error('Gagal mengunggah: ' + (err.message || 'Unknown error'))
    } finally {
      setPaymentPending(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

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
        {/* SPP Bills */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                <CreditCard className="text-primary-green" />
                Administrasi & Uang SPP Bulanan
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 font-semibold">Daftar tagihan aktif dan status pembayaran siswa.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-primary-blue text-sm">Tagihan SPP Juli 2026</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-semibold">Uang SPP bulanan sekolah reguler.</div>
                </div>
                <div className="font-black text-primary-green text-sm px-4 py-1.5 bg-white rounded-full shadow-sm">LUNAS</div>
              </div>

              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex justify-between items-center text-xs opacity-75">
                <div>
                  <div className="font-extrabold text-primary-blue text-sm">Tagihan SPP Agustus 2026</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-semibold">Jatuh tempo pada 10 Agustus 2026.</div>
                </div>
                <div className="font-black text-amber-700 text-sm px-4 py-1.5 bg-white rounded-full shadow-sm">Rp 250.000</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Proof */}
        <div className="lg:col-span-5">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Kirim Bukti Pembayaran Baru</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUploadPayment} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-primary-blue">Nama Siswa:</span>
                  <div className="font-extrabold text-primary-blue text-sm">{studentData?.nama}</div>
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
                        onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                        className="bg-[#F8F6F2] border-transparent text-xs rounded-xl cursor-pointer py-3 h-auto" 
                      />
                      <Button 
                        type="submit" 
                        disabled={paymentPending}
                        className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl text-xs py-3 h-auto cursor-pointer font-bold mt-2"
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
