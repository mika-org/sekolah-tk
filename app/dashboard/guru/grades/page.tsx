'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BookOpen, RefreshCw, Plus } from 'lucide-react'

export default function GuruGradesPage() {
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Grade form state
  const [selectedStudent, setSelectedStudent] = useState('')
  const [subject, setSubject] = useState('Hafalan & Doa')
  const [score, setScore] = useState('')
  const [description, setDescription] = useState('')

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch active students
      const { data: studentData } = await supabase
        .from('students_tk')
        .select('*')
        .eq('status', 'active')
        .order('nama')

      // Fetch grades with student names
      const { data: gradeData } = await supabase
        .from('grades_tk')
        .select('*, students_tk(nama)')
        .order('id', { ascending: false })

      if (studentData) setStudents(studentData)
      if (gradeData) setGrades(gradeData)
    } catch (e: any) {
      toast.error('Gagal memuat data: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !score) {
      toast.error('Mohon pilih murid dan masukkan nilai.')
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

      if (error) throw error

      const studentName = students.find(s => s.id === selectedStudent)?.nama || ''
      
      // Update local list
      const newGrade = {
        id: data?.[0]?.id || crypto.randomUUID(),
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
      toast.success(`Nilai ${subject} untuk ${studentName} berhasil disimpan!`)
    } catch (err: any) {
      toast.error('Gagal menginput nilai: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Input Nilai Harian</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Kelola data penilaian akademik dan sikap murid.</p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Input */}
        <div className="lg:col-span-5">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <BookOpen size={20} className="text-primary-green" />
                Input Nilai Baru
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
        </div>

        {/* Recent Grades List */}
        <div className="lg:col-span-7">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Input Nilai Terbaru</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Riwayat penginputan nilai murid.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Memuat data nilai...</div>
              ) : grades.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Belum ada nilai yang diinput.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {grades.map((g) => (
                    <div key={g.id} className="p-6 flex justify-between items-start gap-4 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <div className="font-bold text-sm text-primary-blue">{g.students_tk?.nama}</div>
                        <div className="text-xs text-primary-green font-bold mt-0.5">{g.subject}</div>
                        <div className="text-xs text-gray-500 italic mt-1 font-medium">"{g.description}"</div>
                      </div>
                      <Badge className="bg-primary-green text-white hover:bg-primary-green border-none font-bold rounded-lg px-3 py-1 text-xs">
                        Nilai: {g.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
