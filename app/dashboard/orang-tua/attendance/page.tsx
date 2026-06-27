'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, ClipboardList, Sparkles } from 'lucide-react'

export default function AttendancePage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
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

    if (studentId) {
      const { data: att } = await supabase
        .from('attendance_tk')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
      if (att) setAttendanceLogs(att)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Memuat absensi anak...</div>
  }

  // Calculate attendance ratios
  const presentCount = attendanceLogs.filter(a => a.status === 'Hadir').length
  const totalDays = attendanceLogs.length
  const presenceRate = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <ClipboardList size={12} className="text-amber-400" />
            <span>Presensi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Absensi Kehadiran Anak</h1>
          <p className="text-gray-300 font-medium text-xs">Pantau riwayat kehadiran harian ananda di sekolah.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Attendance Logs Table */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                <CalendarDays className="text-primary-green" />
                Histori Presensi Anak
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 font-semibold">Daftar riwayat kehadiran siswa di kelas.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {attendanceLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-semibold text-xs">Belum ada riwayat kehadiran terdaftar.</div>
                ) : (
                  attendanceLogs.map((log) => (
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Profile & Summary */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Ringkasan Kehadiran</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama Siswa:</span>
                <span className="text-primary-blue font-extrabold">{studentData?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span>Rasio Kehadiran:</span>
                <span className="text-primary-green font-extrabold">{presenceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hari Masuk:</span>
                <span className="text-primary-blue font-bold">{presentCount} Hari</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hari Belajar:</span>
                <span className="text-primary-blue font-bold">{totalDays} Hari</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
