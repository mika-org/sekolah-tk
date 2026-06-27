'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CalendarDays,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  FileText,
  CreditCard,
  Bell,
  UploadCloud,
  CheckCircle2
} from 'lucide-react'

export default function OrangTuaDashboard() {
  const [studentData, setStudentData] = useState<any>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [gradeLogs, setGradeLogs] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPending, setPaymentPending] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Default mock IDs for demo/local sandbox if user not logged in
    let studentName = 'Althaf Syahputra'
    let studentId = 'stud-1'

    if (user) {
      studentName = user.user_metadata?.student_name || studentName
      // Query database for student details
      const { data: stud } = await supabase
        .from('students_tk')
        .select('*')
        .eq('nama', studentName)
        .maybeSingle()
      if (stud) {
        setStudentData(stud)
        studentId = stud.id
      }
    } else {
      setStudentData({
        id: studentId,
        nama: studentName,
        nik: '647101...',
        nisn: '015...',
        tempat_lahir: 'Balikpapan',
        tanggal_lahir: '2021-05-17',
        jenis_kelamin: 'L',
        agama: 'Islam',
        alamat: 'Jl. Syarifuddin Yoes, RT 03 No. 4, Balikpapan',
        status: 'active'
      })
    }

    // Fetch attendance logs from attendance_tk table
    const { data: att } = await supabase
      .from('attendance_tk')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })

    // Fetch grade logs from grades table
    const { data: grd } = await supabase
      .from('grades_tk')
      .select('*')
      .eq('student_id', studentId)
      .order('id', { ascending: false })

    // Fetch announcements
    const { data: ann } = await supabase
      .from('announcements_tk')
      .select('*')
      .eq('published', true)
      .in('target', ['Semua', 'Orang Tua'])
      .order('id', { ascending: false })

    if (att && att.length > 0) {
      setAttendanceLogs(att)
    } else {
      setAttendanceLogs([
        { id: 'att-1', date: '2026-06-26', status: 'Hadir' },
        { id: 'att-2', date: '2026-06-25', status: 'Hadir' },
        { id: 'att-3', date: '2026-06-24', status: 'Izin' },
        { id: 'att-4', date: '2026-06-23', status: 'Hadir' },
      ])
    }

    if (grd && grd.length > 0) {
      setGradeLogs(grd)
    } else {
      setGradeLogs([
        { id: 'grd-1', subject: 'Hafalan & Doa', score: 90, description: 'Lancar melafalkan Surah Al-Humazah dan doa harian.' },
        { id: 'grd-2', subject: 'Calistung', score: 85, description: 'Sangat baik dalam mengeja kata beranggotakan 4 huruf.' },
        { id: 'grd-3', subject: 'Karakter & Sikap', score: 95, description: 'Menunjukkan adab makan yang baik dan suka membantu teman.' }
      ])
    }

    if (ann && ann.length > 0) {
      setAnnouncements(ann)
    } else {
      setAnnouncements([
        { id: 'ann-1', title: 'Libur Tahun Baru Hijriah', content: 'Diberitahukan kepada seluruh orang tua siswa bahwa KBM akan diliburkan pada hari Selasa dalam rangka memperingati Tahun Baru Hijriah.' },
        { id: 'ann-2', title: 'Pembagian Seragam PPDB', content: 'Bagi peserta didik baru yang sudah melunasi pembayaran uang pangkal, pengambilan seragam dapat dilakukan di kantor TU mulai pukul 08.00 WITA.' }
      ])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentFile) {
      alert('Pilih berkas bukti pembayaran terlebih dahulu.')
      return
    }

    setPaymentPending(true)
    // Mock upload delay
    setTimeout(() => {
      setPaymentPending(false)
      setPaymentSuccess(true)
      alert('Bukti pembayaran berhasil diunggah! Status: Menunggu Verifikasi Admin.')
    }, 2000)
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Memuat dashboard orang tua...</div>
  }

  // Calculate attendance ratios
  const presentCount = attendanceLogs.filter(a => a.status === 'Hadir').length
  const totalDays = attendanceLogs.length
  const presenceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-400" />
            <span>Portal Orang Tua</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Ayah / Bunda dari {studentData?.nama}</h1>
          <p className="text-gray-300 font-medium text-xs">Akses nilai, presensi, dan tagihan sekolah anak Anda dalam satu pintu.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Academic Performance (grades) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Nilai Rapor Card */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <GraduationCap className="text-primary-green" />
                  Perkembangan Akademik (Nilai Harian)
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">Update nilai kompetensi teranyar anak Anda.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {gradeLogs.map((grade) => (
                  <div key={grade.id} className="p-6 flex justify-between items-start gap-4 hover:bg-gray-50/20 transition-colors">
                    <div className="space-y-1">
                      <div className="font-extrabold text-sm text-primary-blue">{grade.subject}</div>
                      <div className="text-xs text-gray-500 font-medium leading-relaxed">"{grade.description}"</div>
                    </div>
                    <Badge className="bg-primary-green text-white hover:bg-primary-green border-none font-bold text-xs rounded-xl px-3 py-1">
                      Nilai: {grade.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance logs Card */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                <CalendarDays className="text-primary-green" />
                Histori Presensi Anak (attendance_tk)
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 font-semibold">Daftar riwayat kehadiran siswa di kelas.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {attendanceLogs.map((log) => (
                  <div key={log.id} className="p-4 flex justify-between items-center px-8">
                    <div className="text-xs font-bold text-gray-600">
                      {new Date(log.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <Badge className={`border-none font-bold rounded-lg px-2.5 py-0.5 text-[10px] ${
                      log.status === 'Hadir' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : log.status === 'Sakit' 
                          ? 'bg-amber-100 text-amber-800' 
                          : log.status === 'Izin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Child Quick Profile */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Profil Calon Siswa</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama:</span>
                <span className="text-primary-blue font-extrabold">{studentData?.nama}</span>
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
                <span>Alamat:</span>
                <span className="text-primary-blue font-bold text-right max-w-[150px] truncate">{studentData?.alamat}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span>Rasio Kehadiran:</span>
                <span className="text-primary-green font-extrabold">{presenceRate}% ({presentCount}/{totalDays} Hari)</span>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Payments Panel */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-sm font-black text-primary-blue flex items-center gap-2">
                <CreditCard size={18} className="text-primary-green" />
                Administrasi & Uang SPP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-primary-blue">Tagihan SPP Juli 2026</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Uang SPP bulanan TK.</div>
                </div>
                <div className="font-black text-primary-green text-sm">LUNAS</div>
              </div>

              {/* Upload payment receipt form */}
              <form onSubmit={handleUploadPayment} className="space-y-3 pt-2">
                <Label className="text-[10px] font-extrabold text-primary-blue">Kirim Bukti Bayar Baru (Jika Ada)</Label>
                
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
                      className="bg-[#F8F6F2] border-transparent text-xs rounded-lg cursor-pointer" 
                    />
                    <Button 
                      type="submit" 
                      disabled={paymentPending}
                      className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl text-xs py-2 h-auto cursor-pointer"
                    >
                      {paymentPending ? 'Mengunggah...' : 'Unggah Bukti Bayar'}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Announcements Feed */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50">
              <CardTitle className="text-sm font-black text-primary-blue flex items-center gap-2">
                <Bell size={18} className="text-primary-green" />
                Pengumuman Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="space-y-1">
                  <div className="font-extrabold text-xs text-primary-blue leading-tight">{a.title}</div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{a.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
