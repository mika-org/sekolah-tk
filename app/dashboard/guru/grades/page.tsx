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
  HeartHandshake,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react'
import {
  saveMonthlyGrade,
  deleteGrade,
} from '@/actions/grades'
import {
  CRITERIA_MAP,
  MONTHS_SEMESTER_1,
  MONTHS_SEMESTER_2,
  ALL_MONTHS,
  PAUD_CP_GENERAL_10,
  PAUD_CP_JATI_DIRI_8,
  ALL_PAUD_TPS,
  type TKGradeCriteria,
  type PAUDMonth,
  type PAUDSemester,
  type LearningObjectiveTP,
  parseGradeDescription,
} from '@/lib/grades'
import { cn } from '@/lib/utils'

export default function GuruGradesPage() {
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingGradeKey, setSavingGradeKey] = useState<string | null>(null)

  // Form State
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [semester, setSemester] = useState<PAUDSemester>('Semester 1')
  const [selectedMonth, setSelectedMonth] = useState<PAUDMonth>('Juli')
  const [academicYear, setAcademicYear] = useState('2026/2027')
  const [activeElementTab, setActiveElementTab] = useState<'cp_umum' | 'jati_diri'>('cp_umum')
  const [tpNotes, setTpNotes] = useState<Record<string, string>>({})

  // History Filters
  const [historySearch, setHistorySearch] = useState<string>('')
  const [filterStudent, setFilterStudent] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [historyPage, setHistoryPage] = useState<number>(1)
  const [historyPageSize, setHistoryPageSize] = useState<number>(10)

  // Recap Filters
  const [recapSearch, setRecapSearch] = useState<string>('')
  const [recapSemester, setRecapSemester] = useState<PAUDSemester>('Semester 1')
  const [recapMonth, setRecapMonth] = useState<string>('all')
  const [recapPage, setRecapPage] = useState<number>(1)
  const [recapPageSize, setRecapPageSize] = useState<number>(10)

  const supabase = createClient()

  // Available months depending on selected semester
  const availableMonths = useMemo(() => {
    return semester === 'Semester 1' ? MONTHS_SEMESTER_1 : MONTHS_SEMESTER_2
  }, [semester])

  // Sync selectedMonth when semester changes
  useEffect(() => {
    if (semester === 'Semester 1' && !MONTHS_SEMESTER_1.includes(selectedMonth as any)) {
      setSelectedMonth(MONTHS_SEMESTER_1[0])
    } else if (semester === 'Semester 2' && !MONTHS_SEMESTER_2.includes(selectedMonth as any)) {
      setSelectedMonth(MONTHS_SEMESTER_2[0])
    }
  }, [semester, selectedMonth])

  const loadData = async () => {
    setLoading(true)
    try {
      const [studentsRes, gradesRes, classesRes] = await Promise.all([
        supabase.from('students_tk').select('*, classes_tk(nama)').eq('status', 'active').order('nama'),
        supabase.from('grades_tk').select('*, students_tk(nama, kelas_id)').order('id', { ascending: false }),
        supabase.from('classes_tk').select('*').order('nama'),
      ])

      if (studentsRes.data) {
        setStudents(studentsRes.data)
        if (studentsRes.data.length > 0 && !selectedStudent) {
          setSelectedStudent(studentsRes.data[0].id)
        }
      }
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

  // Map existing grades for the selected student and selected month
  // Key: tpId -> criteria
  const currentStudentMonthGrades = useMemo(() => {
    if (!selectedStudent) return new Map<string, { id: string; criteria: TKGradeCriteria; notes: string }>()

    const map = new Map<string, { id: string; criteria: TKGradeCriteria; notes: string }>()

    grades.forEach((g) => {
      if (g.student_id !== selectedStudent) return
      const parsed = parseGradeDescription(g.description)
      if (parsed.month === selectedMonth && parsed.tpId) {
        map.set(parsed.tpId, {
          id: g.id,
          criteria: parsed.criteria,
          notes: parsed.notes || '',
        })
      }
    })

    return map
  }, [grades, selectedStudent, selectedMonth])

  // Fast one-click grading handler (Point 15: alur klik TP -> klik nilai)
  const handleScoreTP = async (tp: LearningObjectiveTP, criteria: TKGradeCriteria) => {
    if (!selectedStudent) {
      toast.error('Mohon pilih nama murid terlebih dahulu.')
      return
    }

    const note = tpNotes[tp.id] || currentStudentMonthGrades.get(tp.id)?.notes || ''
    setSavingGradeKey(`${tp.id}-${criteria}`)

    try {
      const result = await saveMonthlyGrade({
        studentId: selectedStudent,
        tpId: tp.id,
        criteria,
        month: selectedMonth,
        semester,
        academicYear,
        notes: note,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        const studentName = students.find((s) => s.id === selectedStudent)?.nama || ''
        toast.success(`Nilai ${criteria} untuk ${tp.code} (${studentName} - ${selectedMonth}) berhasil disimpan!`)
        loadData()
      }
    } catch (err: any) {
      toast.error('Gagal menyimpan nilai: ' + err.message)
    } finally {
      setSavingGradeKey(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus entri penilaian ini?')) return
    const res = await deleteGrade(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Nilai berhasil dihapus.')
      setGrades((prev) => prev.filter((g) => g.id !== id))
    }
  }

  // Filtered grades list for History Tab
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const parsed = parseGradeDescription(g.description)
      if (
        historySearch &&
        !g.students_tk?.nama?.toLowerCase().includes(historySearch.toLowerCase()) &&
        !g.subject.toLowerCase().includes(historySearch.toLowerCase()) &&
        !(parsed.notes || '').toLowerCase().includes(historySearch.toLowerCase())
      ) {
        return false
      }
      if (filterStudent !== 'all' && g.student_id !== filterStudent) return false
      if (filterMonth !== 'all' && parsed.month !== filterMonth) return false
      return true
    })
  }, [grades, historySearch, filterStudent, filterMonth])

  const totalHistoryPages = Math.ceil(filteredGrades.length / historyPageSize) || 1
  const paginatedGrades = useMemo(() => {
    const start = (historyPage - 1) * historyPageSize
    return filteredGrades.slice(start, start + historyPageSize)
  }, [filteredGrades, historyPage, historyPageSize])

  // Aggregated Recap per student for Recap Tab
  const recapData = useMemo(() => {
    const map = new Map<string, {
      student: any
      counts: Record<TKGradeCriteria, number>
      totalEntries: number
    }>()

    students.forEach((s) => {
      map.set(s.id, {
        student: s,
        counts: { BB: 0, MB: 0, BSH: 0, BSB: 0 },
        totalEntries: 0,
      })
    })

    grades.forEach((g) => {
      const parsed = parseGradeDescription(g.description)
      if (parsed.semester !== recapSemester) return
      if (recapMonth !== 'all' && parsed.month !== recapMonth) return

      const entry = map.get(g.student_id)
      if (entry) {
        entry.counts[parsed.criteria] = (entry.counts[parsed.criteria] || 0) + 1
        entry.totalEntries += 1
      }
    })

    return Array.from(map.values()).map((item) => {
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
    }).filter((item) => {
      if (!recapSearch) return true
      return item.student.nama?.toLowerCase().includes(recapSearch.toLowerCase())
    })
  }, [students, grades, recapSemester, recapMonth, recapSearch])

  const totalRecapPages = Math.ceil(recapData.length / recapPageSize) || 1
  const paginatedRecap = useMemo(() => {
    const start = (recapPage - 1) * recapPageSize
    return recapData.slice(start, start + recapPageSize)
  }, [recapData, recapPage, recapPageSize])

  const handlePrintRecap = () => {
    window.print()
  }

  const activeTPs = activeElementTab === 'cp_umum' ? PAUD_CP_GENERAL_10 : PAUD_CP_JATI_DIRI_8

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-primary-blue flex items-center gap-2">
            <Award className="text-primary-green" /> Penilaian Capaian Pembelajaran PAUD
          </h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">
            Kurikulum Merdeka PAUD: 10 TP Capaian Pembelajaran &amp; 8 TP Jati Diri per bulan (BB, MB, BSH, BSB).
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
            ✏️ Input Bulanan
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl font-bold text-xs data-[state=active]:bg-primary-blue data-[state=active]:text-white">
            📋 Riwayat Nilai
          </TabsTrigger>
          <TabsTrigger value="recap" className="rounded-xl font-bold text-xs data-[state=active]:bg-primary-blue data-[state=active]:text-white">
            📊 Rekap Capaian
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: INPUT NILAI BULANAN BERBASIS TP ─── */}
        <TabsContent value="input" className="space-y-6">
          {/* Top Control Bar: Select Student, Semester, Month */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              {/* Select Student */}
              <div className="md:col-span-4 space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Nama Murid *</Label>
                <Select value={selectedStudent} onValueChange={(val) => setSelectedStudent(val as string)}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-bold">
                    <SelectValue placeholder="-- Pilih Murid --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-64">
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nama} {s.classes_tk?.nama ? `(${s.classes_tk.nama})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Semester */}
              <div className="md:col-span-3 space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Semester *</Label>
                <Select value={semester} onValueChange={(val: any) => setSemester(val)}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Semester 1">Semester 1 (Ganjil)</SelectItem>
                    <SelectItem value="Semester 2">Semester 2 (Genap)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Select Full Month (Point 14) */}
              <div className="md:col-span-3 space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Bulan Penilaian * (1x/bulan)</Label>
                <Select value={selectedMonth} onValueChange={(val: any) => setSelectedMonth(val)}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {availableMonths.map((m) => (
                      <SelectItem key={m} value={m}>
                        Bulan {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Academic Year */}
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Tahun Ajaran</Label>
                <div className="bg-[#F8F6F2] text-xs font-mono font-bold text-gray-700 px-3.5 py-2.5 rounded-xl text-center">
                  {academicYear}
                </div>
              </div>
            </div>
          </Card>

          {/* Element Selection Tabs: Capaian Umum (10 TP) vs Jati Diri (8 TP) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveElementTab('cp_umum')}
              className={cn(
                'px-6 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2',
                activeElementTab === 'cp_umum'
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              )}
            >
              <BookOpen size={16} />
              <span>Capaian Pembelajaran (10 TP)</span>
              <Badge className="ml-1 bg-emerald-500 text-white border-none text-[10px]">10</Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveElementTab('jati_diri')}
              className={cn(
                'px-6 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer flex items-center gap-2',
                activeElementTab === 'jati_diri'
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              )}
            >
              <HeartHandshake size={16} />
              <span>Capaian Jati Diri (8 TP)</span>
              <Badge className="ml-1 bg-purple-500 text-white border-none text-[10px]">8</Badge>
            </button>
          </div>

          {/* Quick Explanation Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs font-medium text-emerald-900 flex items-start gap-3">
            <Info size={18} className="text-primary-green shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Alur Pengisian Cepat: Klik salah satu kriteria nilai (BB, MB, BSH, BSB) pada TP yang dinilai.
              </p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Nilai untuk murid terpilih pada bulan <strong>{selectedMonth} ({semester})</strong> akan langsung tersimpan secara otomatis.
              </p>
            </div>
          </div>

          {/* List of TP Cards with 1-Click Scoring (Point 15 & 16) */}
          <div className="space-y-4">
            {activeTPs.map((tp, idx) => {
              const currentGrade = currentStudentMonthGrades.get(tp.id)
              const savedCriteria = currentGrade?.criteria
              return (
                <Card
                  key={tp.id}
                  className={cn(
                    'bg-white rounded-[28px] shadow-sm border transition-all p-6 space-y-4',
                    savedCriteria ? 'border-primary-green/40 bg-emerald-50/10' : 'border-gray-100'
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: TP Code, Category, Objectives, Indicators */}
                    <div className="space-y-2.5 max-w-3xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-primary-blue text-white text-xs font-black px-3 py-1 rounded-xl">
                          {tp.code}
                        </span>
                        <span className="bg-[#07A363]/10 text-[#07A363] text-xs font-extrabold px-3 py-1 rounded-xl">
                          Kategori: {tp.category}
                        </span>
                        {savedCriteria && (
                          <Badge className={cn('text-xs font-black px-3 py-1', CRITERIA_MAP[savedCriteria].badge)}>
                            Ternilai: {CRITERIA_MAP[savedCriteria].label}
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-primary-blue leading-snug">
                        {tp.tp}
                      </h3>

                      <div className="bg-[#F8F6F2] rounded-xl p-3 text-xs leading-relaxed text-gray-700">
                        <strong className="text-primary-blue">Indikator Ketercapaian:</strong> {tp.indicator}
                      </div>
                    </div>

                    {/* Right: Fast 4 Criteria Click Buttons (BB, MB, BSH, BSB) */}
                    <div className="shrink-0 space-y-2">
                      <Label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                        Pilih Capaian ({selectedMonth}):
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['BB', 'MB', 'BSH', 'BSB'] as TKGradeCriteria[]).map((c) => {
                          const isSelected = savedCriteria === c
                          const isSaving = savingGradeKey === `${tp.id}-${c}`
                          return (
                            <button
                              key={c}
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleScoreTP(tp, c)}
                              className={cn(
                                'px-3.5 py-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-w-[70px]',
                                isSelected
                                  ? 'scale-105 font-black ring-2 shadow-md'
                                  : 'opacity-70 hover:opacity-100 bg-[#F8F6F2] border-transparent hover:border-gray-300',
                                c === 'BB' && isSelected && 'border-red-500 bg-red-50 text-red-900 ring-red-300',
                                c === 'MB' && isSelected && 'border-amber-500 bg-amber-50 text-amber-900 ring-amber-300',
                                c === 'BSH' && isSelected && 'border-blue-500 bg-blue-50 text-blue-900 ring-blue-300',
                                c === 'BSB' && isSelected && 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-emerald-300'
                              )}
                            >
                              <span className="text-xs font-black flex items-center gap-1">
                                {isSelected && <Check size={12} />}
                                {c}
                              </span>
                              <span className="text-[9px] font-bold mt-0.5">
                                {c === 'BB' && 'Belum'}
                                {c === 'MB' && 'Mulai'}
                                {c === 'BSH' && 'Harapan'}
                                {c === 'BSB' && 'Sangat Baik'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Optional Narrative Observation Note for this TP */}
                  <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder={`Catatan narasi observasi untuk ${tp.code} (opsional)...`}
                      value={tpNotes[tp.id] !== undefined ? tpNotes[tp.id] : (currentGrade?.notes || '')}
                      onChange={(e) => setTpNotes(prev => ({ ...prev, [tp.id]: e.target.value }))}
                      onBlur={() => {
                        if (savedCriteria) {
                          handleScoreTP(tp, savedCriteria)
                        }
                      }}
                      className="w-full text-xs bg-[#F8F6F2] border border-transparent focus:border-primary-green focus:bg-white rounded-xl px-3.5 py-2 outline-none font-medium"
                    />
                    <span className="text-[10px] text-gray-400 shrink-0">Otomatis tersimpan</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ─── TAB 2: RIWAYAT PENILAIAN BULANAN ─── */}
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black text-primary-blue">Riwayat Penilaian Siswa</CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">
                  Daftar seluruh capaian pembelajaran yang telah diinput.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <TableSearchFilter
                  value={historySearch}
                  onChange={(val) => {
                    setHistorySearch(val)
                    setHistoryPage(1)
                  }}
                  placeholder="Cari murid / TP..."
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

                <Select value={filterMonth} onValueChange={(val) => { setFilterMonth(val || 'all'); setHistoryPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                    <SelectValue placeholder="Semua Bulan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    <SelectItem value="all">Semua Bulan</SelectItem>
                    {ALL_MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400 font-bold">Memuat riwayat nilai...</div>
              ) : filteredGrades.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400 font-bold">Tidak ada data nilai yang cocok.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8F6F2] text-[11px] font-black text-primary-blue uppercase border-b border-gray-100">
                        <th className="p-4 pl-6">Murid</th>
                        <th className="p-4">Bulan &amp; Semester</th>
                        <th className="p-4">Capaian Pembelajaran (TP)</th>
                        <th className="p-4">Kriteria</th>
                        <th className="p-4">Catatan Observasi</th>
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
                                {classes.find((c) => c.id === g.students_tk?.kelas_id)?.nama || 'KB / TK'}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-primary-blue bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md text-[10px]">
                                {parsed.month}
                              </span>
                              <div className="text-[10px] text-gray-400 mt-0.5">{parsed.semester} {parsed.year}</div>
                            </td>
                            <td className="p-4 max-w-sm">
                              <div className="font-extrabold text-primary-blue line-clamp-1">{g.subject}</div>
                              {parsed.tpObj && (
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  Kategori: {parsed.tpObj.category}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge className={cn('font-black text-[11px] rounded-lg px-2.5 py-1', item.badge)}>
                                {item.label}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-600 max-w-xs">
                              {parsed.notes ? `"${parsed.notes}"` : <span className="text-gray-300 italic">Tidak ada catatan</span>}
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

        {/* ─── TAB 3: REKAPITULASI SEMESTER & BULANAN ─── */}
        <TabsContent value="recap" className="space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden print:shadow-none print:rounded-none">
            <CardHeader className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                  <BarChart3 className="text-primary-green" /> Rekapitulasi Capaian Pembelajaran Siswa
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
                    <SelectItem value="Semester 1">Semester 1 (Ganjil)</SelectItem>
                    <SelectItem value="Semester 2">Semester 2 (Genap)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={recapMonth} onValueChange={(val: any) => { setRecapMonth(val); setRecapPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                    <SelectValue placeholder="Semua Bulan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Bulan</SelectItem>
                    {(recapSemester === 'Semester 1' ? MONTHS_SEMESTER_1 : MONTHS_SEMESTER_2).map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
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
                      <th className="p-4">Kelompok / Kelas</th>
                      <th className="p-4 text-center">BB (Belum)</th>
                      <th className="p-4 text-center">MB (Mulai)</th>
                      <th className="p-4 text-center">BSH (Harapan)</th>
                      <th className="p-4 text-center">BSB (Sangat Baik)</th>
                      <th className="p-4 text-center">Total TP Ternilai</th>
                      <th className="p-4 pr-6 text-center">Capaian Dominan</th>
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
                            {item.totalEntries} TP
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
