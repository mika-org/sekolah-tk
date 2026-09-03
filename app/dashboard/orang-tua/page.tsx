'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  CalendarDays,
  FileText,
  GraduationCap,
  Sparkles,
  CreditCard,
  Bell,
  ArrowRight
} from 'lucide-react'

export default function OrangTuaDashboard() {
  const [studentData, setStudentData] = useState<any>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [gradeLogs, setGradeLogs] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [ppdbData, setPpdbData] = useState<any>(null)
  const [schedules, setSchedules] = useState<any[]>([])
  const [activeDay, setActiveDay] = useState('Senin')
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

    // Fetch logs only if studentId is valid
    if (studentId) {
      const { data: att } = await supabase
        .from('attendance_tk')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
      if (att) setAttendanceLogs(att)

      const { data: grd } = await supabase
        .from('grades_tk')
        .select('*')
        .eq('student_id', studentId)
        .order('id', { ascending: false })
      if (grd) setGradeLogs(grd)

      // Fetch schedules if class_id is available
      const { data: stud } = await supabase
        .from('students_tk')
        .select('kelas_id')
        .eq('id', studentId)
        .maybeSingle()
      if (stud?.kelas_id) {
        const { data: sched } = await supabase
          .from('schedules_tk')
          .select('*')
          .eq('class_id', stud.kelas_id)
          .order('start_time')
        if (sched && sched.length > 0) setSchedules(sched)
      }
    }

    // Fetch announcements
    const { data: ann } = await supabase
      .from('announcements_tk')
      .select('*')
      .eq('published', true)
      .in('target', ['Semua', 'Orang Tua'])
      .order('id', { ascending: false })

    if (ann) setAnnouncements(ann)

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Memuat dashboard orang tua...</div>
  }

  // Calculate attendance ratios
  const presentCount = attendanceLogs.filter(a => a.status === 'Hadir').length
  const totalDays = attendanceLogs.length
  const presenceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100
  const latestGrade = gradeLogs[0]

  const DEFAULT_SCHEDULE: Record<string, Array<{ time: string; subject: string }>> = {
    'Senin': [
      { time: '08:00 - 09:30', subject: 'Hafalan & Doa Harian' },
      { time: '09:30 - 10:30', subject: 'Calistung Dasar' },
      { time: '10:30 - 11:00', subject: 'Istirahat / Bermain Bebas' }
    ],
    'Selasa': [
      { time: '08:00 - 09:30', subject: 'Karakter & Sikap Islami' },
      { time: '09:30 - 10:30', subject: 'Seni Mewarnai & Menggambar' },
      { time: '10:30 - 11:00', subject: 'Istirahat / Bermain' }
    ],
    'Rabu': [
      { time: '08:00 - 09:30', subject: 'Metode Tilawati / Mengaji' },
      { time: '09:30 - 10:30', subject: 'Eksplorasi Alam & Sains Sederhana' },
      { time: '10:30 - 11:00', subject: 'Istirahat' }
    ],
    'Kamis': [
      { time: '08:00 - 09:30', subject: 'Tahfidz Qur\'an Juz 30' },
      { time: '09:30 - 10:30', subject: 'Motorik & Olahraga Ceria' },
      { time: '10:30 - 11:00', subject: 'Istirahat' }
    ],
    'Jumat': [
      { time: '08:00 - 09:30', subject: 'Kisah Nabi & Rasul' },
      { time: '09:30 - 10:30', subject: 'Kreativitas & Prakarya Tangan' },
      { time: '10:30 - 11:00', subject: 'Istirahat' }
    ]
  }

  const getDaySchedule = () => {
    if (schedules && schedules.length > 0) {
      return schedules
        .filter(s => s.day === activeDay)
        .map(s => ({
          time: `${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}`,
          subject: s.subject
        }))
    }
    return DEFAULT_SCHEDULE[activeDay] || []
  }

  const daySched = getDaySchedule()

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-linear-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-400" />
            <span>Portal Orang Tua</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Ayah / Bunda dari {studentData?.nama || 'Calon Murid'}</h1>
          <p className="text-gray-300 font-medium text-xs">Selamat datang kembali! Berikut adalah ringkasan perkembangan belajar dan administrasi anak Anda.</p>
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: SPMB Status */}
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center mb-2">
              <FileText size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Status SPMB</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Pendaftaran & registrasi berkas.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-cream rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
              <span>Status:</span>
              <StatusBadge status={ppdbData?.status || 'Submitted'} size="sm" />
            </div>
            <Link href="/dashboard/orang-tua/ppdb-status" className="w-full">
              <Button variant="outline" className="w-full justify-between border-gray-100 hover:border-gray-200 text-primary-blue text-xs font-bold py-2 h-auto rounded-xl">
                <span>Lihat Detail SPMB</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Attendance */}
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-emerald-50 text-primary-green rounded-2xl flex items-center justify-center mb-2">
              <CalendarDays size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Absensi Anak</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Rasio kehadiran harian kelas.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-cream rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
              <span>Rasio Masuk:</span>
              <span className="text-primary-green font-extrabold">{presenceRate}%</span>
            </div>
            <Link href="/dashboard/orang-tua/attendance" className="w-full">
              <Button variant="outline" className="w-full justify-between border-gray-100 hover:border-gray-200 text-primary-blue text-xs font-bold py-2 h-auto rounded-xl">
                <span>Histori Kehadiran</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Grades */}
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <GraduationCap size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Nilai & Rapor</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Update hasil belajar teranyar.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-cream rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
              <span>Nilai Terakhir:</span>
              <span className="text-purple-600 font-extrabold">{latestGrade ? `${latestGrade.subject} (${latestGrade.score})` : '-'}</span>
            </div>
            <Link href="/dashboard/orang-tua/grades" className="w-full">
              <Button variant="outline" className="w-full justify-between border-gray-100 hover:border-gray-200 text-primary-blue text-xs font-bold py-2 h-auto rounded-xl">
                <span>Rapor Lengkap</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card 4: Billing */}
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-2">
              <CreditCard size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Tagihan & SPP</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Status keuangan & pembayaran.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-cream rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
              <span>SPP Juli:</span>
              <span className="text-primary-green font-extrabold">LUNAS</span>
            </div>
            <Link href="/dashboard/orang-tua/billing" className="w-full">
              <Button variant="outline" className="w-full justify-between border-gray-100 hover:border-gray-200 text-primary-blue text-xs font-bold py-2 h-auto rounded-xl">
                <span>Bayar & Upload</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Full-Width Card */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50">
          <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
            <Bell className="text-primary-green" />
            Pengumuman Sekolah
          </CardTitle>
          <CardDescription className="text-xs text-gray-400 font-semibold">Informasi dan agenda teranyar dari KB & TK Istiqamah.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {announcements.length === 0 ? (
            <div className="text-center py-6 text-gray-400 font-semibold text-xs">Belum ada pengumuman baru untuk orang tua.</div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="space-y-2 pb-4 border-b border-gray-50 last:border-none last:pb-0">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-primary-green border-none font-extrabold text-[9px] px-2.5 py-0.5 rounded-md">
                    Pengumuman
                  </Badge>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {new Date(a.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="font-extrabold text-sm text-primary-blue leading-tight">{a.title}</div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-4xl">{a.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Schedule Selector */}
        <Card className="bg-white rounded-[32px] shadow-sm border-none lg:col-span-1 overflow-hidden">
          <CardHeader className="p-6 bg-cream border-b border-gray-150">
            <CardTitle className="text-sm font-black text-primary-blue">Hari Belajar</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => {
              const active = activeDay === day
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`w-full p-3.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    active ? 'bg-primary-blue text-white shadow-md' : 'bg-cream hover:bg-gray-100 text-gray-650'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Right Schedule Details */}
        <Card className="bg-white rounded-[32px] shadow-sm border-none lg:col-span-2 overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50">
            <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
              <Sparkles className="text-primary-green" size={18} />
              Jadwal Pelajaran Hari {activeDay}
            </CardTitle>
            <CardDescription className="text-xs text-gray-400 font-semibold">
              Rincian agenda kegiatan belajar mengajar (KBM) kelas ananda.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            {daySched.length === 0 ? (
              <div className="text-center py-6 text-gray-400 font-semibold text-xs">Tidak ada KBM hari ini. Libur sekolah.</div>
            ) : (
              <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-6">
                {daySched.map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-5.25 top-1.5 w-3.5 h-3.5 rounded-full bg-primary-green ring-4 ring-emerald-50" />
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold font-mono">{item.time}</span>
                      <h4 className="font-extrabold text-sm text-primary-blue mt-0.5">{item.subject}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
