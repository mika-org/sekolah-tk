'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { toast } from 'sonner'
import { ClipboardList, RefreshCw, Save } from 'lucide-react'

export default function GuruAttendancePage() {
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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
    setSaving(true)
    try {
      for (const [studentId, status] of Object.entries(attendance)) {
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
          <h1 className="text-3xl font-black text-primary-blue">Presensi Kelas</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Mengelola kehadiran harian murid kelas berjalan.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-primary-green/10 gap-1.5"
          >
            <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Presensi'}
          </Button>
        </div>
      </div>

      {/* Attendance Form Card */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
              <ClipboardList className="text-primary-green" />
              Presensi Hari Ini ({today})
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Pilih status kehadiran anak ({filteredStudents.length} murid).</CardDescription>
          </div>

          <TableSearchFilter
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder="Cari nama murid..."
          />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data murid...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada data murid yang sesuai.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedStudents.map((student) => (
                <div key={student.id} className="p-5 px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="font-bold text-primary-blue">{student.nama}</div>
                    <div className="text-[10px] text-gray-400 font-semibold mt-0.5">NISN: {student.nisn || student.id.substring(0, 8)}</div>
                  </div>
                  
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
    </div>
  )
}
