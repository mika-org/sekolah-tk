'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ClipboardList, RefreshCw } from 'lucide-react'

export default function GuruAttendancePage() {
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch active students
      const { data: studentData } = await supabase
        .from('students_tk')
        .select('*')
        .eq('status', 'active')
        .order('nama')

      // Fetch today's attendance
      const { data: attendanceData } = await supabase
        .from('attendance_tk')
        .select('*')
        .eq('date', today)

      if (studentData) {
        setStudents(studentData)
        
        // Map attendance status
        const attMap: Record<string, string> = {}
        studentData.forEach(s => {
          attMap[s.id] = 'Hadir' // default
        })
        if (attendanceData) {
          attendanceData.forEach(a => {
            attMap[a.student_id] = a.status
          })
        }
        setAttendance(attMap)
      }
    } catch (e: any) {
      toast.error('Gagal memuat data: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveAttendance = async () => {
    try {
      for (const [studentId, status] of Object.entries(attendance)) {
        // Upsert based on date and student_id
        const { data: existing } = await supabase
          .from('attendance_tk')
          .select('id')
          .eq('student_id', studentId)
          .eq('date', today)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('attendance_tk')
            .update({ status })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('attendance_tk')
            .insert({
              student_id: studentId,
              date: today,
              status
            })
        }
      }
      toast.success('Absensi hari ini berhasil disimpan!')
    } catch (e: any) {
      toast.error('Gagal menyimpan absensi: ' + e.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Presensi Kelas</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Mengelola kehadiran harian murid kelas berjalan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button onClick={handleSaveAttendance} className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-primary-green/10">
            Simpan Presensi
          </Button>
        </div>
      </div>

      {/* Attendance Form Card */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50">
          <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
            <ClipboardList className="text-primary-green" />
            Presensi Hari Ini ({today})
          </CardTitle>
          <CardDescription className="text-xs font-semibold text-gray-400">Pilih status kehadiran anak pada hari ini.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data murid...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada data murid aktif.</div>
          ) : (
            <div className="divide-y divide-gray-150">
              {students.map((student) => (
                <div key={student.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-55/10 transition-colors">
                  <div>
                    <div className="font-bold text-primary-blue">{student.nama}</div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">NIS: {student.id.substring(0, 8)}</div>
                  </div>
                  
                  {/* Attendance Options */}
                  <div className="flex gap-2">
                    {['Hadir', 'Sakit', 'Izin', 'Alfa'].map((opt) => {
                      const active = attendance[student.id] === opt
                      return (
                        <button
                          key={opt}
                          onClick={() => setAttendance(prev => ({ ...prev, [student.id]: opt }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? opt === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500/20'
                                : opt === 'Sakit'
                                  ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500/20'
                                    : opt === 'Izin'
                                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500/20'
                                    : 'bg-rose-100 text-rose-800 ring-2 ring-rose-500/20'
                              : 'bg-[#F8F6F2] hover:bg-gray-100 text-gray-500'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
