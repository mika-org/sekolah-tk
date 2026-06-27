'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import {
  ClipboardList,
  BookOpen,
  CalendarDays,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

export default function GuruDashboard() {
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Grade form state
  const [selectedStudent, setSelectedStudent] = useState('')
  const [subject, setSubject] = useState('Hafalan & Doa')
  const [score, setScore] = useState('')
  const [description, setDescription] = useState('')

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const loadData = async () => {
    setLoading(true)
    
    // Fetch students
    const { data: studentData } = await supabase
      .from('students_tk')
      .select('*')
      .eq('status', 'active')

    // Fetch today's attendance records from attendance_tk
    const { data: attendanceData } = await supabase
      .from('attendance_tk')
      .select('*')
      .eq('date', today)

    // Fetch recent grades
    const { data: gradeData } = await supabase
      .from('grades_tk')
      .select('*, students_tk(nama)')
      .order('id', { ascending: false })

    if (studentData && studentData.length > 0) {
      setStudents(studentData)
      
      // Load existing attendance states
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
    } else {
      // Mock data for sandbox
      const mockStudents = [
        { id: 'stud-1', nama: 'Althaf Syahputra', nik: '647101...', kelas_id: 'class-1', status: 'active' },
        { id: 'stud-2', nama: 'Kayla Ramadhani', nik: '647102...', kelas_id: 'class-1', status: 'active' },
        { id: 'stud-3', nama: 'Fariq Ramadhan', nik: '647103...', kelas_id: 'class-1', status: 'active' },
        { id: 'stud-4', nama: 'Rania Amira', nik: '647104...', kelas_id: 'class-2', status: 'active' }
      ]
      setStudents(mockStudents)
      
      const attMap: Record<string, string> = {}
      mockStudents.forEach(s => {
        attMap[s.id] = 'Hadir'
      })
      setAttendance(attMap)
    }

    if (gradeData) {
      setGrades(gradeData)
    } else {
      setGrades([
        { id: 'g-1', student_id: 'stud-1', subject: 'Hafalan & Doa', score: 90, description: 'Lancar melafalkan Surah Al-Humazah dan doa harian.', students_tk: { nama: 'Althaf Syahputra' } },
        { id: 'g-2', student_id: 'stud-2', subject: 'Calistung', score: 85, description: 'Sangat baik dalam mengeja kata beranggotakan 4 huruf.', students_tk: { nama: 'Kayla Ramadhani' } }
      ])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveAttendance = async () => {
    try {
      // Save all attendance states to public.attendance_tk
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
      alert('Absensi TK hari ini berhasil disimpan di database (table: attendance_tk)!')
    } catch (e: any) {
      toast.error('Gagal menyimpan absensi: ' + e.message)
    }
  }

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !score) {
      alert('Mohon pilih murid dan masukkan nilai.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('grades_tk')
        .insert({
          student_id: selectedStudent,
          subject,
          score: parseFloat(score),
          description
        })
        .select()

      const studentName = students.find(s => s.id === selectedStudent)?.nama || ''
      
      // Update local state
      const newGrade = {
        id: data?.[0]?.id || 'mock-id-' + Date.now(),
        student_id: selectedStudent,
        subject,
        score: parseFloat(score),
        description,
        students_tk: { nama: studentName }
      }
      setGrades(prev => [newGrade, ...prev])
      
      // Reset Form
      setScore('')
      setDescription('')
      alert(`Nilai ${subject} untuk ${studentName} berhasil disimpan!`)
    } catch (err: any) {
      alert('Gagal menginput nilai: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-primary-blue">Dashboard Guru</h1>
        <p className="text-gray-500 font-semibold text-xs mt-1">Mengelola absensi harian dan penilaian akademik ananda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Attendance (attendance_tk) section */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <ClipboardList className="text-primary-green" />
                  Presensi Kelas Hari Ini
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Pilih status kehadiran anak pada hari ini ({today}).</CardDescription>
              </div>
              <Button onClick={handleSaveAttendance} className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-primary-green/10">
                Simpan Presensi
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Memuat data murid...</div>
              ) : (
                <div className="divide-y divide-gray-150">
                  {students.map((student) => (
                    <div key={student.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/50 transition-colors">
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

        {/* Input Grades Section */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add Grade Form */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <BookOpen size={20} className="text-primary-green" />
                Input Nilai Harian
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 font-semibold">Berikan penilaian keterampilan atau sikap murid.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student" className="text-xs font-bold text-primary-blue">Nama Murid *</Label>
                  <Select onValueChange={(val) => setSelectedStudent(val as string)}>
                    <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                      <SelectValue placeholder="Pilih Murid" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>{student.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-bold text-primary-blue">Kategori Bidang *</Label>
                    <Select onValueChange={(val) => setSubject(val as string)} defaultValue={subject}>
                      <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                        <SelectValue placeholder="Pilih Bidang" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Hafalan & Doa">Hafalan & Doa</SelectItem>
                        <SelectItem value="Calistung">Calistung</SelectItem>
                        <SelectItem value="Seni & Mewarnai">Seni & Mewarnai</SelectItem>
                        <SelectItem value="Karakter & Sikap">Karakter & Sikap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="score" className="text-xs font-bold text-primary-blue">Nilai Angka (1-100) *</Label>
                    <Input
                      id="score"
                      type="number"
                      min={1}
                      max={100}
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="Contoh: 85"
                      className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-xs font-bold text-primary-blue">Catatan Guru (Kualitatif)</Label>
                  <Input
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Sangat baik dalam menghafal Surah Al-Humazah..."
                    className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-extrabold rounded-xl text-xs py-3 h-auto cursor-pointer shadow-md shadow-primary-blue/10">
                  <Plus size={16} className="mr-1" />
                  Simpan Nilai Anak
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Grades List */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50">
              <CardTitle className="text-sm font-black text-primary-blue">Input Nilai Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {grades.slice(0, 3).map((g) => (
                  <div key={g.id} className="p-4 flex justify-between items-start gap-4">
                    <div>
                      <div className="font-bold text-xs text-primary-blue">{g.students_tk?.nama}</div>
                      <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{g.subject}</div>
                      <div className="text-[11px] text-gray-500 italic mt-1 font-medium">"{g.description}"</div>
                    </div>
                    <Badge className="bg-primary-green/10 text-primary-green hover:bg-primary-green/10 border-none font-bold rounded-lg px-2 py-0.5">
                      {g.score}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
