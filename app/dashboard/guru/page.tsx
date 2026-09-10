'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardList,
  BookOpen,
  MessageSquare,
  Sparkles,
  Users,
  CalendarDays,
  ArrowRight,
  Megaphone
} from 'lucide-react'

import { getTeacherPlottedClassAndStudents } from '@/actions/students'

export default function GuruDashboardLanding() {
  const [studentCount, setStudentCount] = useState(0)
  const [plottedStudents, setPlottedStudents] = useState<any[]>([])
  const [myClasses, setMyClasses] = useState<any[]>([])
  const [teacherProfile, setTeacherProfile] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [activeDay, setActiveDay] = useState('Senin')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Get plotted classes & students for this teacher
      const plottedRes = await getTeacherPlottedClassAndStudents()
      const studentsList = plottedRes.students || []
      const classesList = plottedRes.classes || []

      setPlottedStudents(studentsList)
      setMyClasses(classesList)
      setStudentCount(studentsList.length)
      if (plottedRes.teacher) setTeacherProfile(plottedRes.teacher)

      // 2. Get announcements for Guru
      const { data: ann } = await supabase
        .from('announcements_tk')
        .select('*')
        .eq('published', true)
        .in('target', ['Semua', 'Guru'])
        .order('id', { ascending: false })
        .limit(5)

      if (ann) setAnnouncements(ann)

      // 3. Get schedule for teacher's classes
      if (classesList.length > 0) {
        const classIds = classesList.map((c: any) => c.id)
        const { data: sched } = await supabase
          .from('schedules_tk')
          .select('*')
          .in('class_id', classIds)
          .order('start_time')
        if (sched && sched.length > 0) setSchedules(sched)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const DEFAULT_SCHEDULE: Record<string, Array<{ time: string; subject: string }>> = {
    'Senin': [
      { time: '08:00 - 09:30', subject: 'Hafalan & Doa Harian (TK-A)' },
      { time: '09:30 - 10:30', subject: 'Calistung Dasar (TK-A)' },
      { time: '10:30 - 11:00', subject: 'Istirahat / Pengawasan Bermain' }
    ],
    'Selasa': [
      { time: '08:00 - 09:30', subject: 'Karakter & Sikap Islami (TK-A)' },
      { time: '09:30 - 10:30', subject: 'Seni Mewarnai & Menggambar (TK-A)' },
      { time: '10:30 - 11:00', subject: 'Istirahat' }
    ],
    'Rabu': [
      { time: '08:00 - 09:30', subject: 'Metode Tilawati / Mengaji (TK-A)' },
      { time: '09:30 - 10:30', subject: 'Eksplorasi Alam & Sains (TK-A)' },
      { time: '10:30 - 11:00', subject: 'Istirahat' }
    ],
    'Kamis': [
      { time: '08:00 - 09:30', subject: 'Tahfidz Qur\'an Juz 30 (TK-A)' },
      { time: '09:30 - 10:30', subject: 'Motorik & Olahraga Ceria (TK-A)' },
      { time: '10:30 - 11:00', subject: 'Istirahat' }
    ],
    'Jumat': [
      { time: '08:00 - 09:30', subject: 'Kisah Nabi & Rasul (TK-A)' },
      { time: '09:30 - 10:30', subject: 'Kreativitas & Prakarya Tangan (TK-A)' },
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-amber-400" />
              <span>Portal Guru Pengajar</span>
            </div>
            {myClasses.length > 0 && (
              <Badge className="bg-primary-green text-white font-extrabold text-xs px-3 py-1 rounded-full border-none">
                Wali Kelas: {myClasses.map((c) => c.nama).join(', ')}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Selamat Datang, {teacherProfile?.nama || 'Ustadzah'}
          </h1>
          <p className="text-gray-300 font-medium text-xs">
            Hari ini adalah {today}. Anda mengampu {studentCount} murid aktif di kelas{' '}
            {myClasses.map((c) => c.nama).join(', ') || 'KB/TK'}.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Murid Kelas Binaan</div>
              <div className="text-2xl font-black text-primary-blue">{studentCount} Anak</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Tahun Ajaran</div>
              <div className="text-base font-black text-primary-blue mt-1">2026/2027</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
              <Megaphone size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Pengumuman Aktif</div>
              <div className="text-2xl font-black text-primary-blue">{announcements.length} Berita</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shortcuts & Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Menu Shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-black text-primary-blue">Shortcut Administrasi</CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Akses cepat menu pengelolaan kelas Anda.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-3">
              {[
                { title: 'Daftar Murid Kelas', desc: 'Lihat daftar anak yang di-plotting', href: '/dashboard/guru/students', icon: Users, color: 'bg-indigo-50 text-indigo-700' },
                { title: 'Absensi TK', desc: 'Isi kehadiran murid hari ini', href: '/dashboard/guru/attendance', icon: ClipboardList, color: 'bg-emerald-50 text-primary-green' },
                { title: 'Input Nilai PAUD', desc: 'Catat capaian TP bulanan', href: '/dashboard/guru/grades', icon: BookOpen, color: 'bg-blue-50 text-primary-blue' },
                { title: 'Chat Orang Tua', desc: 'Komunikasi langsung dengan wali murid', href: '/dashboard/guru/chat', icon: MessageSquare, color: 'bg-purple-50 text-purple-650' },
                { title: 'Materi Belajar', desc: 'Unggah modul & silabus mengajar', href: '/dashboard/guru/materials', icon: BookOpen, color: 'bg-amber-50 text-amber-700' },
              ].map((item, idx) => (
                <Link href={item.href} key={idx} className="block w-full group">
                  <div className="p-4 bg-[#F8F6F2] hover:bg-[#F8F6F2]/70 border border-transparent hover:border-gray-200/50 rounded-2xl flex items-center justify-between transition-all">
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 font-bold transition-all`}>
                        <item.icon size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black text-primary-blue">{item.title}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <Megaphone className="text-primary-green" size={20} />
                  Pengumuman Terkini
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Siaran informasi penting untuk para guru.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center p-6 text-gray-400 text-xs">Memuat pengumuman...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center p-6 text-gray-400 text-xs">Belum ada pengumuman untuk Anda saat ini.</div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((item) => (
                    <div key={item.id} className="p-5 bg-[#F8F6F2] rounded-2xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-extrabold text-sm text-primary-blue">{item.title}</h4>
                        <Badge className="bg-primary-blue/10 text-primary-blue border-none font-bold text-[9px]">
                          Target: {item.target}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Plotted Students Preview Card */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
              <Users className="text-primary-green" size={20} />
              Murid Kelas Binaan {myClasses.map((c) => c.nama).join(', ')} ({plottedStudents.length} Siswa)
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">
              Daftar murid aktif yang telah di-plotting ke kelas Anda.
            </CardDescription>
          </div>
          <Link
            href="/dashboard/guru/students"
            className="text-xs font-bold text-primary-green hover:underline flex items-center gap-1 shrink-0"
          >
            Lihat Detail Seluruh Murid <ArrowRight size={14} />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Memuat data murid...</div>
          ) : plottedStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Belum ada murid yang di-plotting ke kelas Anda. Hubungi Admin untuk plotting murid.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {plottedStudents.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="p-4 px-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-blue/10 text-primary-blue font-extrabold text-xs flex items-center justify-center">
                      {s.nama?.substring(0, 2).toUpperCase() || 'AN'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-primary-blue">{s.nama}</div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        NISN: {s.nisn || '-'} • Gender: {s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • Ortu: {s.parents_tk?.[0]?.nama_ayah || s.parents_tk?.[0]?.nama_ibu || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/guru/grades?student=${s.id}`}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary-blue text-xs font-bold transition-all inline-flex items-center gap-1"
                    >
                      <BookOpen size={13} />
                      Beri Nilai
                    </Link>
                    <Link
                      href="/dashboard/guru/attendance"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-primary-green text-xs font-bold transition-all inline-flex items-center gap-1"
                    >
                      <ClipboardList size={13} />
                      Presensi
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Schedule Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Schedule Selector */}
        <Card className="bg-white rounded-[32px] shadow-sm border-none lg:col-span-1 overflow-hidden">
          <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
            <CardTitle className="text-sm font-black text-primary-blue">Hari Mengajar</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => {
              const active = activeDay === day
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`w-full p-3.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    active ? 'bg-primary-blue text-white shadow-md' : 'bg-[#F8F6F2] hover:bg-gray-100 text-gray-650'
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
              Jadwal Mengajar Hari {activeDay}
            </CardTitle>
            <CardDescription className="text-xs text-gray-400 font-semibold">
              Rencana jadwal KBM kelas yang Anda ampu.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            {daySched.length === 0 ? (
              <div className="text-center py-6 text-gray-400 font-semibold text-xs">Tidak ada jadwal mengajar hari ini.</div>
            ) : (
              <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-6">
                {daySched.map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div className="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary-green ring-4 ring-emerald-50" />
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
