'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Sparkles, UserCheck } from 'lucide-react'

export default function PPDBStatusPage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [ppdbData, setPpdbData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
          
          // Query PPDB status by student name and birth date
          const { data: ppdb } = await supabase
            .from('ppdb_tk')
            .select('*')
            .eq('student_name', stud.nama)
            .eq('birth_date', stud.tanggal_lahir)
            .maybeSingle()
          if (ppdb) {
            setPpdbData(ppdb)
          }
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

            // Query PPDB status
            const { data: ppdb } = await supabase
              .from('ppdb_tk')
              .select('*')
              .eq('student_name', stud.nama)
              .eq('birth_date', stud.tanggal_lahir)
              .maybeSingle()
            if (ppdb) {
              setPpdbData(ppdb)
            }
          }
        }
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Memuat status pendaftaran PPDB...</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted': return <Badge className="bg-blue-100 text-blue-800 border-none rounded-full px-3 py-1 font-bold">Baru</Badge>
      case 'Verifikasi Berkas': return <Badge className="bg-amber-100 text-amber-800 border-none rounded-full px-3 py-1 font-bold">Verifikasi Berkas</Badge>
      case 'Diterima': return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-full px-3 py-1 font-bold">Diterima</Badge>
      case 'Ditolak': return <Badge className="bg-rose-100 text-rose-800 border-none rounded-full px-3 py-1 font-bold">Ditolak</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800 border-none rounded-full px-3 py-1 font-bold">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <UserCheck size={12} className="text-amber-400" />
            <span>PPDB Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Status Pendaftaran PPDB</h1>
          <p className="text-gray-300 font-medium text-xs">Informasi berkas pendaftaran dan status verifikasi calon siswa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PPDB Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <FileText className="text-primary-green" />
                  Detail Registrasi PPDB
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">Status administratif pendaftaran anak Anda.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-5 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span>ID Pendaftaran:</span>
                <span className="text-primary-blue font-extrabold font-mono">{ppdbData?.id || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span>Program Kelas:</span>
                <span className="text-primary-blue font-bold">{ppdbData?.class_program || 'Reguler'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span>Tanggal Registrasi:</span>
                <span className="text-primary-blue font-bold">
                  {ppdbData?.created_at 
                    ? new Date(ppdbData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span>Status Kelulusan:</span>
                <span>{ppdbData ? getStatusBadge(ppdbData.status) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Status Pembayaran PPDB:</span>
                <Badge className={ppdbData?.payment_status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                  {ppdbData?.payment_status === 'Verified' ? 'Lunas / Terverifikasi' : 'Menunggu Verifikasi'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Profile */}
        <div className="lg:col-span-5">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Profil Calon Siswa</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama Lengkap:</span>
                <span className="text-primary-blue font-extrabold">{studentData?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span>NIK Anak:</span>
                <span className="text-primary-blue font-bold font-mono">{studentData?.nik || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tempat Lahir:</span>
                <span className="text-primary-blue font-bold">{studentData?.tempat_lahir}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Lahir:</span>
                <span className="text-primary-blue font-bold">{studentData?.tanggal_lahir}</span>
              </div>
              <div className="flex justify-between">
                <span>Alamat Tinggal:</span>
                <span className="text-primary-blue font-bold text-right max-w-[180px] leading-relaxed">{studentData?.alamat}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
