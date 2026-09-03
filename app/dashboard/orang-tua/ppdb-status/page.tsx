'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  FileText,
  Sparkles,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Ruler,
  PackageCheck,
  Building2,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
            student_name: payload.username === 'orangtua' ? 'Althaf Syahputra' : '',
          },
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
    return <div className="p-8 text-center text-gray-400 text-xs font-bold">Memuat status pendaftaran PPDB...</div>
  }

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />
  }

  const childDetails = (ppdbData?.child_details as Record<string, any>) || {}
  const schedules = childDetails.schedules || {}

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <UserCheck size={12} className="text-amber-400" />
            <span>SPMB Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Status Pendaftaran &amp; Jadwal SPMB</h1>
          <p className="text-gray-300 font-medium text-xs">
            Informasi kelulusan, jadwal observasi, pengukuran dan pengambilan seragam ananda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SPMB Administrative Status Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <FileText className="text-primary-green" />
                  Detail Registrasi SPMB
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">
                  Status administratif pendaftaran ananda.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-5 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span>ID Pendaftaran:</span>
                <span className="text-primary-blue font-extrabold font-mono">{ppdbData?.id || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span>Tanggal Registrasi:</span>
                <span className="text-primary-blue font-bold">
                  {ppdbData?.created_at
                    ? new Date(ppdbData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span>Status Kelulusan SPMB:</span>
                <span>{ppdbData ? getStatusBadge(ppdbData.status) : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Status Uang Pendaftaran:</span>
                <StatusBadge
                  status={ppdbData?.payment_status}
                  customLabel={ppdbData?.payment_status === 'Verified' ? 'Lunas / Terverifikasi (Rp 250.000)' : 'Menunggu Verifikasi Transfer'}
                />
              </div>
            </CardContent>
          </Card>

          {/* ─── JADWAL SPMB SINKRON (Observasi, Ukur Seragam, Ambil Seragam) ─── */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-primary-blue uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[#07A363]" />
              Jadwal &amp; Agenda SPMB Ananda (Tersinkronisasi)
            </h2>

            {/* Card 1: Observasi & Wawancara */}
            <Card className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-primary-blue">1. Observasi &amp; Wawancara</h3>
                    <p className="text-[11px] text-gray-400">Pengenalan minat anak &amp; wawancara orang tua</p>
                  </div>
                </div>
                {schedules.observation_date ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                    Terjadwal
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-500 border-none text-[10px]">
                    Belum Ditentukan
                  </Badge>
                )}
              </div>

              <div className="bg-[#F8F6F2] rounded-2xl p-4 text-xs space-y-1.5 font-medium text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hari / Tanggal:</span>
                  <span className="font-bold text-primary-blue">
                    {schedules.observation_date
                      ? new Date(schedules.observation_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Menunggu konfirmasi panitia'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Waktu:</span>
                  <span className="font-bold text-primary-blue">{schedules.observation_time || '08.30 - 10.30 WIB'}</span>
                </div>
                {schedules.observation_notes && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Catatan Observasi:</span>
                    <p className="italic text-primary-blue font-semibold mt-0.5">&ldquo;{schedules.observation_notes}&rdquo;</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Card 2: Pengukuran Seragam */}
            <Card className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-primary-blue">2. Pengukuran Seragam Sekolah</h3>
                    <p className="text-[11px] text-gray-400">Penyesuaian ukuran seragam batik, rompi, &amp; olahraga</p>
                  </div>
                </div>
                <Badge className={cn('text-[10px] font-bold', schedules.uniform_size ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-500 border-none')}>
                  Ukuran: {schedules.uniform_size || 'Belum Diukur'}
                </Badge>
              </div>

              <div className="bg-[#F8F6F2] rounded-2xl p-4 text-xs space-y-1.5 font-medium text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Jadwal Pengukuran:</span>
                  <span className="font-bold text-primary-blue">
                    {schedules.uniform_measure_date
                      ? new Date(schedules.uniform_measure_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Menunggu konfirmasi panitia'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ukuran Seragam:</span>
                  <span className="font-extrabold text-purple-700 font-mono text-sm">{schedules.uniform_size || '-'}</span>
                </div>
                {schedules.uniform_measure_notes && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Catatan Ukuran:</span>
                    <p className="italic text-primary-blue font-semibold mt-0.5">{schedules.uniform_measure_notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Card 3: Pengambilan Seragam */}
            <Card className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <PackageCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-primary-blue">3. Pengambilan Seragam &amp; Atribut</h3>
                    <p className="text-[11px] text-gray-400">Pengambilan paket seragam lengkap di sekolah</p>
                  </div>
                </div>
                <Badge
                  className={cn(
                    'text-[10px] font-black',
                    schedules.uniform_pickup_status === 'Sudah Diambil' && 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    schedules.uniform_pickup_status === 'Siap Diambil' && 'bg-blue-50 text-blue-800 border-blue-200',
                    (!schedules.uniform_pickup_status || schedules.uniform_pickup_status === 'Belum Siap') && 'bg-amber-50 text-amber-800 border-amber-200'
                  )}
                >
                  Status: {schedules.uniform_pickup_status || 'Belum Siap'}
                </Badge>
              </div>

              <div className="bg-[#F8F6F2] rounded-2xl p-4 text-xs space-y-1.5 font-medium text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Jadwal Pengambilan:</span>
                  <span className="font-bold text-primary-blue">
                    {schedules.uniform_pickup_date
                      ? new Date(schedules.uniform_pickup_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Akan diinfokan setelah seragam selesai dijahit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lokasi Pengambilan:</span>
                  <span className="font-bold text-primary-blue">Kantor Tata Usaha TK Istiqamah</span>
                </div>
                {schedules.uniform_pickup_notes && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Catatan Pengambilan:</span>
                    <p className="italic text-primary-blue font-semibold mt-0.5">{schedules.uniform_pickup_notes}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Child Profile & Help Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Profil Calon Siswa</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama Lengkap:</span>
                <span className="text-primary-blue font-extrabold">{studentData?.nama || ppdbData?.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span>NIK Anak:</span>
                <span className="text-primary-blue font-bold font-mono">{studentData?.nik || childDetails.nik || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Lahir:</span>
                <span className="text-primary-blue font-bold">
                  {studentData?.tanggal_lahir || ppdbData?.birth_date || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Alamat Domisili:</span>
                <span className="text-primary-blue font-bold text-right max-w-[180px] leading-relaxed">
                  {studentData?.alamat || childDetails.alamat || '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[32px] shadow-sm border-none p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary-blue font-black text-xs">
              <Info size={16} className="text-primary-green" />
              <span>Bantuan &amp; Konsultasi SPMB</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              Jika Anda ingin mengubah jadwal observasi atau bertanya seputar kelengkapan seragam sekolah, silakan hubungi Narahubung PPDB kami melalui WhatsApp:
            </p>
            <a
              href="https://wa.me/628112198853?text=Halo%20Admin%20PPDB%20TK%20Istiqamah,%20saya%20ingin%20bertanya%20mengenai%20jadwal%20observasi%20dan%20seragam."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Hubungi Narahubung (0811 2198 853)</span>
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}
