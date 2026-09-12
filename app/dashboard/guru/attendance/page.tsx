'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { getTeacherPlottedClassAndStudents } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { toast } from 'sonner'
import {
  ClipboardList,
  RefreshCw,
  Save,
  Info,
  Calendar,
  CalendarDays,
  CheckCircle2,
  User,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function GuruAttendancePage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])

  // Individual Summary Modal State
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryStudent, setSummaryStudent] = useState<any>(null)
  const [studentHistory, setStudentHistory] = useState<any[]>([])

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const supabase = createClient()

  const loadData = async (targetDate: string = selectedDate) => {
    setLoading(true)
    try {
      const plottedRes = await getTeacherPlottedClassAndStudents()
      const studentData = plottedRes.students || []
      setStudents(studentData)
      setClasses(plottedRes.classes || [])

      if (plottedRes.isTeacher && studentData.length === 0) {
        setAttendance({})
        setLoading(false)
        return
      }

      const studentIds = studentData.map((s: any) => s.id)
      let attQuery = supabase.from('attendance_tk').select('*').eq('date', targetDate)
      if (plottedRes.isTeacher && studentIds.length > 0) {
        attQuery = attQuery.in('student_id', studentIds)
      }

      const { data: attendanceData } = await attQuery

      // Map attendance status
      const attMap: Record<string, string> = {}
      studentData.forEach((s: any) => {
        attMap[s.id] = 'Hadir' // default
      })
      if (attendanceData) {
        attendanceData.forEach((a: any) => {
          attMap[a.student_id] = a.status
        })
      }
      setAttendance(attMap)
    } catch (e: any) {
      toast.error('Gagal memuat data: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(selectedDate)
  }, [selectedDate])

  const handleOpenSummary = async (student: any) => {
    setSummaryStudent(student)
    setSummaryOpen(true)
    setSummaryLoading(true)
    setStudentHistory([])
    try {
      const { data, error } = await supabase
        .from('attendance_tk')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false })

      if (error) throw error
      setStudentHistory(data || [])
    } catch (err: any) {
      toast.error('Gagal memuat riwayat kehadiran: ' + err.message)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleSaveAttendance = async () => {
    setSaving(true)
    try {
      for (const [studentId, status] of Object.entries(attendance)) {
        const { data: existing } = await supabase
          .from('attendance_tk')
          .select('id')
          .eq('student_id', studentId)
          .eq('date', selectedDate)
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
              date: selectedDate,
              status
            })
        }
      }
      toast.success(`Presensi tanggal ${selectedDate} berhasil disimpan!`)
    } catch (e: any) {
      toast.error('Gagal menyimpan absensi: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchQuery ||
        (s.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.id).toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })
  }, [students, searchQuery])

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-black text-primary-blue">Presensi Kelas</h1>
            {classes.length > 0 && (
              <Badge className="bg-[#0F7A4A] hover:bg-[#0F7A4A] text-white font-extrabold text-xs px-3 py-1 rounded-full">
                Wali Kelas: {classes.map((c) => c.nama).join(', ')}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 font-semibold text-xs mt-1">
            Mengelola kehadiran harian murid kelas berjalan.
            {students.length > 0 && ` • Menampilkan ${students.length} murid kelas binaan.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => loadData(selectedDate)} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-primary-green/10 gap-1.5"
          >
            <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Presensi'}
          </Button>
        </div>
      </div>

      {/* Attendance Form Card */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
              <ClipboardList className="text-primary-green" />
              Presensi Siswa ({new Date(`${selectedDate}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">
              Pilih tanggal atau klik nama murid untuk melihat rekapan absensi perorangan ({filteredStudents.length} murid).
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F8F6F2] px-3 py-1.5 rounded-xl border border-gray-100">
              <Calendar size={14} className="text-primary-green" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-primary-blue outline-none cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="text-[10px] font-bold text-primary-green hover:underline cursor-pointer ml-1"
              >
                Hari Ini
              </button>
            </div>

            <TableSearchFilter
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder="Cari nama murid..."
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data murid...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Info className="mx-auto text-amber-600" size={32} />
              <div className="font-bold text-gray-800 text-sm">Belum Ada Murid yang Di-Plotting</div>
              <div className="text-xs text-gray-500 max-w-sm mx-auto">
                {classes.length > 0
                  ? `Kelas ${classes.map((c) => c.nama).join(', ')} saat ini belum memiliki murid yang di-plotting.`
                  : 'Akun Anda belum terhubung sebagai wali kelas pada kelas manapun.'}
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada data murid yang sesuai pencarian.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedStudents.map((student) => (
                <div key={student.id} className="p-5 px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <button
                    type="button"
                    onClick={() => handleOpenSummary(student)}
                    className="text-left group cursor-pointer"
                    title="Klik untuk melihat rekap kehadiran murid"
                  >
                    <div className="font-bold text-primary-blue group-hover:text-primary-green transition-colors flex items-center gap-2">
                      <span>{student.nama}</span>
                      <span className="text-[10px] font-semibold text-primary-green/80 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        Lihat Rekap ↗
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">NISN: {student.nisn || student.id.substring(0, 8)}</div>
                  </button>
                  
                  {/* Attendance Options */}
                  <div className="flex gap-2">
                    {[
                      { id: 'Hadir', activeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20' },
                      { id: 'Sakit', activeClass: 'bg-purple-50 text-purple-800 border-purple-300 ring-2 ring-purple-500/20' },
                      { id: 'Izin', activeClass: 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20' },
                      { id: 'Alfa', activeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20' },
                    ].map(({ id: opt, activeClass }) => {
                      const active = attendance[student.id] === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAttendance(prev => ({ ...prev, [student.id]: opt }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border select-none ${
                            active
                              ? `${activeClass} font-black shadow-2xs scale-105`
                              : 'bg-[#F8F6F2] hover:bg-gray-100 text-gray-500 border-transparent font-medium'
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
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20]}
          />
        </CardContent>
      </Card>

      {/* INDIVIDUAL STUDENT RECAP DIALOG */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="rounded-[32px] max-w-lg bg-white p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-green/10 text-primary-green flex items-center justify-center font-bold text-base">
                <User size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-primary-blue">
                  {summaryStudent?.nama || 'Rekap Presensi Murid'}
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-400 mt-0.5">
                  NISN: {summaryStudent?.nisn || summaryStudent?.id?.substring(0, 8) || '—'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {summaryLoading ? (
            <div className="py-12 text-center text-xs text-gray-400 font-semibold">
              Memuat riwayat kehadiran...
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Stat Summary Cards */}
              {(() => {
                const total = studentHistory.length
                const hadir = studentHistory.filter(h => h.status === 'Hadir').length
                const sakit = studentHistory.filter(h => h.status === 'Sakit').length
                const izin = studentHistory.filter(h => h.status === 'Izin').length
                const alfa = studentHistory.filter(h => h.status === 'Alfa').length
                const percent = total > 0 ? Math.round((hadir / total) * 100) : 0

                return (
                  <div className="space-y-4">
                    {/* Percentage Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 to-[#EAF7ED] p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                          Tingkat Kehadiran
                        </div>
                        <div className="text-2xl font-black text-[#0F7A4A] mt-0.5">
                          {percent}% <span className="text-xs font-bold text-gray-500 font-sans">({hadir} dari {total} hari)</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-white/80 border border-emerald-200 flex items-center justify-center text-primary-green shadow-xs">
                        <CheckCircle2 size={24} />
                      </div>
                    </div>

                    {/* Breakdown 4 Pills */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-center">
                        <div className="text-[10px] font-extrabold text-emerald-800">Hadir</div>
                        <div className="text-lg font-black text-emerald-700">{hadir}</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 text-center">
                        <div className="text-[10px] font-extrabold text-purple-800">Sakit</div>
                        <div className="text-lg font-black text-purple-700">{sakit}</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-center">
                        <div className="text-[10px] font-extrabold text-blue-800">Izin</div>
                        <div className="text-lg font-black text-blue-700">{izin}</div>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 text-center">
                        <div className="text-[10px] font-extrabold text-rose-800">Alfa</div>
                        <div className="text-lg font-black text-rose-700">{alfa}</div>
                      </div>
                    </div>

                    {/* History Table */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-black text-primary-blue flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-primary-green" />
                        Riwayat Catatan Presensi ({total} catatan)
                      </h4>

                      {total === 0 ? (
                        <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 rounded-2xl">
                          Belum ada riwayat kehadiran tercatat untuk ananda ini.
                        </div>
                      ) : (
                        <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-gray-50 bg-[#F8F6F2]/50">
                          {studentHistory.map((item) => (
                            <div key={item.id} className="p-3 px-4 flex items-center justify-between text-xs hover:bg-white transition-colors">
                              <span className="font-semibold text-primary-blue">
                                {new Date(`${item.date}T00:00:00`).toLocaleDateString('id-ID', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                item.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                item.status === 'Sakit' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                item.status === 'Izin' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSummaryOpen(false)}
                  className="rounded-xl font-bold text-xs"
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
