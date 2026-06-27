'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
          <h1 className="text-2xl sm:text-3xl font-black">Ayah / Bunda dari {studentData?.nama || 'Calon Murid'}</h1>
          <p className="text-gray-300 font-medium text-xs">Selamat datang kembali! Berikut adalah ringkasan perkembangan belajar dan administrasi anak Anda.</p>
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: PPDB Status */}
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center mb-2">
              <FileText size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Status PPDB</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Pendaftaran & registrasi berkas.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-[#F8F6F2] rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
              <span>Status:</span>
              <Badge className={ppdbData?.status === 'Diterima' ? 'bg-emerald-100 text-emerald-800 border-none' : 'bg-blue-100 text-blue-800 border-none'}>
                {ppdbData?.status || 'Submitted'}
              </Badge>
            </div>
            <Link href="/dashboard/orang-tua/ppdb-status" className="w-full">
              <Button variant="outline" className="w-full justify-between border-gray-100 hover:border-gray-200 text-primary-blue text-xs font-bold py-2 h-auto rounded-xl">
                <span>Lihat Detail PPDB</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card 2: Attendance */}
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-emerald-50 text-primary-green rounded-2xl flex items-center justify-center mb-2">
              <CalendarDays size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Absensi Anak</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Rasio kehadiran harian kelas.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-[#F8F6F2] rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
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
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-2">
              <GraduationCap size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Nilai & Rapor</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Update hasil belajar teranyar.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-[#F8F6F2] rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
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
        <Card className="bg-white rounded-3xl shadow-sm border-none flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-2">
              <CreditCard size={20} />
            </div>
            <CardTitle className="text-sm font-black text-primary-blue">Tagihan & SPP</CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">Status keuangan & pembayaran.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="py-2.5 px-3 bg-[#F8F6F2] rounded-xl flex justify-between items-center text-[11px] font-bold text-gray-600">
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
                  <Badge className="bg-emerald-50 text-[#07A363] border-none font-extrabold text-[9px] px-2.5 py-0.5 rounded-md">
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

    </div>
  )
}
