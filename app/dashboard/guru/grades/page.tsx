'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { toast } from 'sonner'
import {
  BookOpen,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Award,
  CheckCircle2,
  Printer,
  Filter,
  User,
} from 'lucide-react'
import {
  saveWeeklyGrade,
  deleteGrade,
} from '@/actions/grades'
import {
  CRITERIA_MAP,
  PAUD_SUBJECTS,
  type TKGradeCriteria,
  parseGradeDescription,
} from '@/lib/grades'
import { cn } from '@/lib/utils'

export default function GuruGradesPage() {
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>(PAUD_SUBJECTS[0])
  const [criteria, setCriteria] = useState<TKGradeCriteria>('BSH')
  const [week, setWeek] = useState<number>(1)
  const [trimester, setTrimester] = useState<1 | 2>(1)
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil')
  const [academicYear, setAcademicYear] = useState('2026/2027')
  const [notes, setNotes] = useState('')

  // Filter state for history
  const [historySearch, setHistorySearch] = useState<string>('')
  const [filterStudent, setFilterStudent] = useState<string>('all')
  const [filterWeek, setFilterWeek] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [historyPage, setHistoryPage] = useState<number>(1)
  const [historyPageSize, setHistoryPageSize] = useState<number>(10)

  // Filter state for recap tab
  const [recapSearch, setRecapSearch] = useState<string>('')
  const [recapSemester, setRecapSemester] = useState<'Ganjil' | 'Genap'>('Ganjil')
  const [recapTrimester, setRecapTrimester] = useState<'all' | '1' | '2'>('all')
  const [recapPage, setRecapPage] = useState<number>(1)
  const [recapPageSize, setRecapPageSize] = useState<number>(10)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const [studentsRes, gradesRes, classesRes] = await Promise.all([
        supabase.from('students_tk').select('*, classes_tk(nama)').eq('status', 'active').order('nama'),
        supabase.from('grades_tk').select('*, students_tk(nama, kelas_id)').order('id', { ascending: false }),
        supabase.from('classes_tk').select('*').order('nama'),
      ])

      if (studentsRes.data) setStudents(studentsRes.data)
      if (gradesRes.data) setGrades(gradesRes.data)
      if (classesRes.data) setClasses(classesRes.data)
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
    if (!selectedStudent) {
      toast.error('Mohon pilih murid terlebih dahulu.')
      return
    }

    setSaving(true)
    try {
      const result = await saveWeeklyGrade({
        studentId: selectedStudent,
        subject: selectedSubject,
        criteria,
        week,
        trimester,
        semester,
        academicYear,
        notes,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        const studentName = students.find((s) => s.id === selectedStudent)?.nama || ''
        toast.success(`Nilai ${criteria} untuk ${studentName} berhasil disimpan!`)
        setNotes('')
        loadData()
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus penilaian ini?')) return
    const res = await deleteGrade(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Nilai berhasil dihapus.')
      setGrades((prev) => prev.filter((g) => g.id !== id))
    }
  }

  // Filtered grades list
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const parsed = parseGradeDescription(g.description)
      if (historySearch && !g.students_tk?.nama?.toLowerCase().includes(historySearch.toLowerCase()) && !g.subject.toLowerCase().includes(historySearch.toLowerCase())) {
        return false
      }
      if (filterStudent !== 'all' && g.student_id !== filterStudent) return false
      if (filterWeek !== 'all' && parsed.week !== parseInt(filterWeek, 10)) return false
      if (filterSubject !== 'all' && g.subject !== filterSubject) return false
      return true
    })
  }, [grades, historySearch, filterStudent, filterWeek, filterSubject])

  const totalHistoryPages = Math.ceil(filteredGrades.length / historyPageSize) || 1
  const paginatedGrades = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize
    return filteredGrades.slice(start, start + historyPageSize)
  }, [filteredGrades, historyPage, historyPageSize])

  // Aggregated recap per student and subject
  const recapData = useMemo(() => {
    const map = new Map<string, {
      student: any
      counts: Record<TKGradeCriteria, number>
      subjectGrades: Record<string, TKGradeCriteria[]>
      totalEntries: number
    }>()

    students.forEach((s) => {
      map.set(s.id, {
        student: s,
        counts: { BB: 0, MB: 0, BSH: 0, BSB: 0 },
        subjectGrades: {},
        totalEntries: 0,
      })
    })

    grades.forEach((g) => {
      const parsed = parseGradeDescription(g.description)
      if (parsed.semester !== recapSemester) return
      if (recapTrimester !== 'all' && parsed.trimester !== parseInt(recapTrimester, 10)) return

      const entry = map.get(g.student_id)
      if (entry) {
        entry.counts[parsed.criteria] = (entry.counts[parsed.criteria] || 0) + 1
        entry.totalEntries += 1
        if (!entry.subjectGrades[g.subject]) {
          entry.subjectGrades[g.subject] = []
        }
        entry.subjectGrades[g.subject].push(parsed.criteria)
      }
    })

    return Array.from(map.values()).map((item) => {
      // Calculate dominant rating
      let dominant: TKGradeCriteria = 'BSH'
      let maxCount = -1
      ;(Object.keys(item.counts) as TKGradeCriteria[]).forEach((c) => {
        if (item.counts[c] > maxCount) {
          maxCount = item.counts[c]
          dominant = c
        }
      })

      return {
        ...item,
        dominantCriteria: item.totalEntries > 0 ? dominant : null,
      }
    }).filter(item => {
      if (!recapSearch) return true
      return item.student.nama?.toLowerCase().includes(recapSearch.toLowerCase())
    })
  }, [students, grades, recapSemester, recapTrimester, recapSearch])

  const totalRecapPages = Math.ceil(recapData.length / recapPageSize) || 1
  const paginatedRecap = useMemo(() => {
    const start = (recapPage - 1) * recapPageSize
    return recapData.slice(start, start + recapPageSize)
  }, [recapData, recapPage, recapPageSize])

  const handlePrintRecap = () => {
    window.print()
  }

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-primary-blue flex items-center gap-2">
            <Award className="text-primary-green" /> Penilaian Perkembangan Anak
          </h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">
            Format penilaian PAUD/TK: 1. BB, 2. MB, 3. BSH, 4. BSB per minggu & rekapitulasi semester/triwulan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="input" className="w-full space-y-6">
        <TabsList className="bg-[#F8F6F2] p-1.5 rounded-2xl border border-gray-200/80 w-full sm:w-auto grid grid-cols-3 max-w-xl print:hidden">
          <TabsTrigger value="input" className="rounded-xl font-bold text-xs data-[state=active]:bg-primary-blue data-[state=active]:text-white">
            ✏️ Input Mingguan
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl font-bold text-xs data-[state=active]:bg-primary-blue data-[state=active]:text-white">
            📋 Riwayat Nilai
          </TabsTrigger>
          <TabsTrigger value="recap" className="rounded-xl font-bold text-xs data-[state=active]:bg-primary-blue data-[state=active]:text-white">
            📊 Rekap Semester & Triwulan
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INPUT NILAI MINGGUAN */}
        <TabsContent value="input" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Card */}
            <div className="lg:col-span-6">
              <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
                <CardHeader className="p-7 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-emerald-50/30">
                  <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                    <BookOpen size={18} className="text-primary-green" />
                    Formulir Penilaian Mingguan PAUD
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 font-semibold">
                    Catat capaian aspek perkembangan anak berdasarkan observasi mingguan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-7">
                  <form onSubmit={handleSaveGrade} className="space-y-5">
                    {/* Pilih Murid */}
                    <div className="space-y-2">
                      <Label htmlFor="student" className="text-xs font-bold text-primary-blue flex items-center justify-between">
                        <span>Pilih Murid *</span>
                        <span className="text-[10px] text-gray-400 font-medium">Hanya murid berstatus aktif</span>
                      </Label>
                      <Select value={selectedStudent} onValueChange={(val) => setSelectedStudent(val as string)}>
                        <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                          <SelectValue placeholder="-- Pilih Nama Murid --" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl max-h-60">
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.nama} {student.classes_tk?.nama ? `(${student.classes_tk.nama})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Periode Mingguan */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-primary-blue">Semester</Label>
                        <Select value={semester} onValueChange={(val: any) => setSemester(val)}>
                          <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Ganjil">Semester Ganjil</SelectItem>
                            <SelectItem value="Genap">Semester Genap</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-primary-blue">Triwulan</Label>
                        <Select value={String(trimester)} onValueChange={(val: any) => setTrimester(Number(val) as 1 | 2)}>
                          <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="1">Triwulan 1 (TW 1)</SelectItem>
                            <SelectItem value="2">Triwulan 2 (TW 2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-primary-blue">Minggu Ke-</Label>
                        <Select value={String(week)} onValueChange={(val: any) => setWeek(Number(val))}>
                          <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl max-h-48">
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((w) => (
                              <SelectItem key={w} value={String(w)}>
                                Minggu ke-{w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Aspek Perkembangan */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary-blue">Aspek Perkembangan *</Label>
                      <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val as string)}>
                        <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {PAUD_SUBJECTS.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pilihan 4 Kriteria Penilaian PAUD */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-primary-blue flex justify-between items-center">
                        <span>Kriteria Capaian Perkembangan *</span>
                        <span className="text-[10px] text-gray-400 font-semibold">Standar PAUD/TK Nasional</span>
                      </Label>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {(['BB', 'MB', 'BSH', 'BSB'] as TKGradeCriteria[]).map((c) => {
                          const item = CRITERIA_MAP[c]
                          const isSelected = criteria === c
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCriteria(c)}
                              className={cn(
                                'p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between gap-1 cursor-pointer',
                                isSelected ? 'scale-105 shadow-md font-black ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100 bg-[#F8F6F2] border-transparent',
                                c === 'BB' && isSelected && 'border-red-500 bg-red-50 text-red-900 ring-red-300',
                                c === 'MB' && isSelected && 'border-amber-500 bg-amber-50 text-amber-900 ring-amber-300',
                                c === 'BSH' && isSelected && 'border-blue-500 bg-blue-50 text-blue-900 ring-blue-300',
                                c === 'BSB' && isSelected && 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-emerald-300'
                              )}
                            >
                              <span className="text-xs font-black">{c}</span>
                              <span className="text-[10px] font-bold leading-tight line-clamp-1">{item.label.split(' ')[1]?.replace(/[()]/g, '') || c}</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Penjelasan Indikator Kriteria Terpilih */}
                      <div className={cn('p-3 rounded-xl text-xs font-medium border leading-relaxed mt-2', CRITERIA_MAP[criteria].badge)}>
                        <strong>{CRITERIA_MAP[criteria].label}:</strong> {CRITERIA_MAP[criteria].desc}
                      </div>
                    </div>

                    {/* Catatan Guru */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-xs font-bold text-primary-blue">Catatan Naratif / Observasi Guru</Label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Ananda mampu melafalkan Surah Pendek dan doa sebelum makan secara mandiri dengan tartil..."
                        className="w-full rounded-2xl border border-transparent bg-[#F8F6F2] p-3.5 text-xs font-medium leading-relaxed text-gray-800 focus:border-primary-blue focus:bg-white focus:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-extrabold rounded-xl text-xs py-3.5 h-auto cursor-pointer shadow-md shadow-primary-blue/15 gap-2"
                    >
                      <Plus size={16} />
                      {saving ? 'Menyimpan...' : 'Simpan Penilaian Mingguan'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Guide Card & Recent preview */}
            <div className="lg:col-span-6 space-y-6">
              <Card className="bg-white rounded-[32px] shadow-sm border-none p-7 space-y-4">
                <div className="flex items-center gap-2 text-primary-blue font-extrabold text-sm">
                  <Sparkles className="text-amber-500" size={18} />
                  <span>Panduan Kriteria Penilaian Perkembangan</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl">
                    <strong className="text-red-700">1. BB (Belum Berkembang):</strong> Anak melakukannya harus dengan bimbingan atau dicontohkan secara penuh oleh guru.
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                    <strong className="text-amber-700">2. MB (Mulai Berkembang):</strong> Anak melakukannya masih harus diingatkan atau dibantu secara berkala oleh guru.
                  </div>
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <strong className="text-blue-700">3. BSH (Berkembang Sesuai Harapan):</strong> Anak sudah dapat melakukannya secara mandiri dan konsisten tanpa diingatkan.
                  </div>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <strong className="text-emerald-700">4. BSB (Berkembang Sangat Baik):</strong> Anak sudah dapat melakukannya secara mandiri dan dapat membantu serta menjadi teladan bagi temannya.
                  </div>
                </div>
              </Card>

              {/* Recent Inputs */}
              <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
                <CardHeader className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black text-primary-blue">Entri Penilaian Terakhir</CardTitle>
                    <CardDescription className="text-[11px] text-gray-400 font-semibold">Riwayat input nilai yang baru disimpan.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 text-center text-xs text-gray-400">Memuat...</div>
                  ) : grades.slice(0, 5).length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">Belum ada penilaian yang dicatat.</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {grades.slice(0, 5).map((g) => {
                        const parsed = parseGradeDescription(g.description)
                        const item = CRITERIA_MAP[parsed.criteria]
                        return (
                          <div key={g.id} className="p-4 flex items-start justify-between gap-3 hover:bg-gray-50/50">
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-primary-blue">{g.students_tk?.nama}</div>
                              <div className="text-[11px] text-gray-500 font-medium">{g.subject}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                                M{parsed.week} • TW{parsed.trimester} • {parsed.semester}
                              </div>
                            </div>
                            <Badge className={cn('font-black text-[10px] rounded-lg px-2 py-0.5 border-none', item.badge)}>
                              {parsed.criteria}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: RIWAYAT PENILAIAN MINGGUAN */}
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black text-primary-blue">Riwayat Penilaian Mingguan</CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">Daftar lengkap observasi capaian anak.</CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <TableSearchFilter
                  value={historySearch}
                  onChange={(val) => {
                    setHistorySearch(val)
                    setHistoryPage(1)
                  }}
                  placeholder="Cari murid / aspek..."
                />

                <Select value={filterStudent} onValueChange={(val) => { setFilterStudent(val || 'all'); setHistoryPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-40">
                    <SelectValue placeholder="Semua Murid" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    <SelectItem value="all">Semua Murid</SelectItem>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterWeek} onValueChange={(val) => { setFilterWeek(val || 'all'); setHistoryPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-32">
                    <SelectValue placeholder="Semua Minggu" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    <SelectItem value="all">Semua Minggu</SelectItem>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((w) => (
                      <SelectItem key={w} value={String(w)}>Minggu {w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterSubject} onValueChange={(val) => { setFilterSubject(val || 'all'); setHistoryPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-40">
                    <SelectValue placeholder="Semua Aspek" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Aspek</SelectItem>
                    {PAUD_SUBJECTS.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400 font-bold">Memuat riwayat nilai...</div>
              ) : filteredGrades.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400 font-bold">Tidak ada data penilaian yang cocok dengan filter.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8F6F2] text-[11px] font-black text-primary-blue uppercase border-b border-gray-100">
                        <th className="p-4 pl-6">Murid</th>
                        <th className="p-4">Periode</th>
                        <th className="p-4">Aspek Perkembangan</th>
                        <th className="p-4">Capaian</th>
                        <th className="p-4">Catatan Guru</th>
                        <th className="p-4 pr-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {paginatedGrades.map((g) => {
                        const parsed = parseGradeDescription(g.description)
                        const item = CRITERIA_MAP[parsed.criteria]
                        return (
                          <tr key={g.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="font-bold text-primary-blue">{g.students_tk?.nama}</div>
                              <div className="text-[10px] text-gray-400">
                                {classes.find((c) => c.id === g.students_tk?.kelas_id)?.nama || 'Kelas KB/TK'}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md text-[10px]">
                                M{parsed.week} • TW{parsed.trimester}
                              </span>
                              <div className="text-[10px] text-gray-400 mt-0.5">{parsed.semester} {parsed.year}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-primary-blue">{g.subject}</div>
                            </td>
                            <td className="p-4">
                              <Badge className={cn('font-black text-[11px] rounded-lg px-2.5 py-1 border', item.badge)}>
                                {item.label}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-600 max-w-xs">
                              {parsed.notes ? `"${parsed.notes}"` : <span className="text-gray-300 italic">Tidak ada catatan naratif</span>}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <Button
                                onClick={() => handleDelete(g.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg h-8 w-8 p-0 cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <TablePagination
                currentPage={historyPage}
                totalPages={totalHistoryPages}
                totalItems={filteredGrades.length}
                pageSize={historyPageSize}
                onPageChange={setHistoryPage}
                onPageSizeChange={setHistoryPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: REKAP SEMESTER & TRIWULAN */}
        <TabsContent value="recap" className="space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden print:shadow-none print:rounded-none">
            <CardHeader className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                  <BarChart3 className="text-primary-green" /> Rekapitulasi Capaian Perkembangan Siswa
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">
                  Distribusi penilaian 1. BB, 2. MB, 3. BSH, 4. BSB per murid.
                </CardDescription>
              </div>

              {/* Filters & Print */}
              <div className="flex flex-wrap gap-2.5 items-center print:hidden">
                <TableSearchFilter
                  value={recapSearch}
                  onChange={(val) => {
                    setRecapSearch(val)
                    setRecapPage(1)
                  }}
                  placeholder="Cari nama siswa..."
                />

                <Select value={recapSemester} onValueChange={(val: any) => { setRecapSemester(val); setRecapPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Ganjil">Semester Ganjil</SelectItem>
                    <SelectItem value="Genap">Semester Genap</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={recapTrimester} onValueChange={(val: any) => { setRecapTrimester(val); setRecapPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Triwulan</SelectItem>
                    <SelectItem value="1">Triwulan 1 (TW1)</SelectItem>
                    <SelectItem value="2">Triwulan 2 (TW2)</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handlePrintRecap}
                  className="bg-primary-blue hover:bg-primary-blue/90 text-white font-bold rounded-xl text-xs h-9 gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> Cetak Rekap Rapor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F6F2] text-[11px] font-black text-primary-blue uppercase border-b border-gray-100">
                      <th className="p-4 pl-6">No.</th>
                      <th className="p-4">Nama Siswa</th>
                      <th className="p-4">Kelas</th>
                      <th className="p-4 text-center">BB (Belum)</th>
                      <th className="p-4 text-center">MB (Mulai)</th>
                      <th className="p-4 text-center">BSH (Harapan)</th>
                      <th className="p-4 text-center">BSB (Sangat Baik)</th>
                      <th className="p-4 text-center">Total Entri</th>
                      <th className="p-4 pr-6 text-center">Status Capaian Dominan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {paginatedRecap.map((item, idx) => {
                      const dominantObj = item.dominantCriteria ? CRITERIA_MAP[item.dominantCriteria] : null
                      return (
                        <tr key={item.student.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="p-4 pl-6 font-bold text-gray-400">{(recapPage - 1) * recapPageSize + idx + 1}</td>
                          <td className="p-4">
                            <div className="font-extrabold text-primary-blue text-sm">{item.student.nama}</div>
                            <div className="text-[10px] text-gray-400 font-mono">NIK: {item.student.nik || '-'}</div>
                          </td>
                          <td className="p-4 font-bold text-gray-600">
                            {item.student.classes_tk?.nama || classes.find((c) => c.id === item.student.kelas_id)?.nama || '-'}
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                              {item.counts.BB}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                              {item.counts.MB}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                              {item.counts.BSH}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              {item.counts.BSB}
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold text-gray-700">
                            {item.totalEntries}
                          </td>
                          <td className="p-4 pr-6 text-center">
                            {dominantObj ? (
                              <Badge className={cn('font-black text-[11px] rounded-lg px-3 py-1 border', dominantObj.badge)}>
                                {dominantObj.label}
                              </Badge>
                            ) : (
                              <span className="text-gray-300 italic text-[11px]">Belum Dinilai</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={recapPage}
                totalPages={totalRecapPages}
                totalItems={recapData.length}
                pageSize={recapPageSize}
                onPageChange={setRecapPage}
                onPageSizeChange={setRecapPageSize}
                className="print:hidden"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
