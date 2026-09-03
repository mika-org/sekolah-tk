'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { GraduationCap, Printer, Sparkles, Award, BookOpen, Calendar, CheckCircle2, HeartHandshake } from 'lucide-react'
import {
  CRITERIA_MAP,
  MONTHS_SEMESTER_1,
  MONTHS_SEMESTER_2,
  ALL_MONTHS,
  type TKGradeCriteria,
  parseGradeDescription,
} from '@/lib/grades'
import { cn } from '@/lib/utils'

export default function OrangTuaGradesPage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [gradeLogs, setGradeLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSemester, setFilterSemester] = useState<'all' | 'Semester 1' | 'Semester 2'>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)

    // 1. Try to read from cookie first
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
            student_name: payload.username === 'orangtua' ? 'Althaf Syahputra' : '',
          },
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
      const { data: parent } = await supabase
        .from('parents_tk')
        .select('student_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (parent && parent.student_id) {
        studentId = parent.student_id
        const { data: stud } = await supabase
          .from('students_tk')
          .select('*, classes_tk(nama)')
          .eq('id', studentId)
          .maybeSingle()
        if (stud) setStudentData(stud)
      } else {
        const studentName = user.user_metadata?.student_name || (user.user_metadata?.username === 'orangtua' ? 'Althaf Syahputra' : '')
        if (studentName) {
          const { data: stud } = await supabase
            .from('students_tk')
            .select('*, classes_tk(nama)')
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
      const { data: grd } = await supabase
        .from('grades_tk')
        .select('*')
        .eq('student_id', studentId)
        .order('id', { ascending: false })
      if (grd) setGradeLogs(grd)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredLogs = useMemo(() => {
    return gradeLogs.filter((grade) => {
      const parsed = parseGradeDescription(grade.description)
      if (
        searchQuery &&
        !grade.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(parsed.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      if (filterSemester !== 'all' && parsed.semester !== filterSemester) return false
      if (filterMonth !== 'all' && parsed.month !== filterMonth) return false
      return true
    })
  }, [gradeLogs, searchQuery, filterSemester, filterMonth])

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  // Count summary
  const summaryCounts = useMemo(() => {
    const counts: Record<TKGradeCriteria, number> = { BB: 0, MB: 0, BSH: 0, BSB: 0 }
    filteredLogs.forEach((g) => {
      const parsed = parseGradeDescription(g.description)
      counts[parsed.criteria] = (counts[parsed.criteria] || 0) + 1
    })
    return counts
  }, [filteredLogs])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400 font-bold text-xs">Memuat capaian pembelajaran &amp; rapor ananda...</div>
  }

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, aside, header, button, .no-print, .toast-container {
            display: none !important;
          }
          main, .main-content, #dashboard-layout-main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          #print-rapor {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
        @media screen {
          #print-rapor {
            display: none;
          }
        }
      `}} />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Award size={12} className="text-amber-400" />
            <span>Kurikulum Merdeka PAUD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Capaian Pembelajaran Ananda</h1>
          <p className="text-gray-300 font-medium text-xs">
            Laporan observasi bulanan kompetensi anak: Capaian Pembelajaran &amp; Jati Diri berbasis standar PAUD/TK Nasional.
          </p>
        </div>
        {filteredLogs.length > 0 && (
          <Button onClick={handlePrint} className="relative z-10 bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs py-3 px-5 h-auto cursor-pointer gap-2 shadow-lg">
            <Printer size={15} /> Cetak Rapor Ananda
          </Button>
        )}
      </div>

      {/* Criteria Summary Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <Card className="bg-red-50/60 border-red-100 rounded-2xl p-4 text-center">
          <div className="text-[10px] font-bold text-red-600 uppercase">1. Belum Berkembang</div>
          <div className="text-2xl font-black text-red-700 mt-1">{summaryCounts.BB}</div>
          <div className="text-[10px] text-red-500 font-semibold mt-0.5">BB (Perlu Bimbingan)</div>
        </Card>
        <Card className="bg-amber-50/60 border-amber-100 rounded-2xl p-4 text-center">
          <div className="text-[10px] font-bold text-amber-600 uppercase">2. Mulai Berkembang</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{summaryCounts.MB}</div>
          <div className="text-[10px] text-amber-500 font-semibold mt-0.5">MB (Perlu Diingatkan)</div>
        </Card>
        <Card className="bg-blue-50/60 border-blue-100 rounded-2xl p-4 text-center">
          <div className="text-[10px] font-bold text-blue-600 uppercase">3. Sesuai Harapan</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{summaryCounts.BSH}</div>
          <div className="text-[10px] text-blue-500 font-semibold mt-0.5">BSH (Mandiri)</div>
        </Card>
        <Card className="bg-emerald-50/60 border-emerald-100 rounded-2xl p-4 text-center">
          <div className="text-[10px] font-bold text-emerald-600 uppercase">4. Sangat Baik</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{summaryCounts.BSB}</div>
          <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">BSB (Mandiri &amp; Teladan)</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        {/* Grades List Card */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <BookOpen className="text-primary-green" />
                  Capaian Pembelajaran Terdaftar
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">
                  Observasi capaian ananda {studentData?.nama || ''} per bulan.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <TableSearchFilter
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val)
                    setCurrentPage(1)
                  }}
                  placeholder="Cari TP / catatan..."
                />

                <Select value={filterSemester} onValueChange={(val: any) => { setFilterSemester(val); setCurrentPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Semester</SelectItem>
                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterMonth} onValueChange={(val: any) => { setFilterMonth(val); setCurrentPage(1) }}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-32">
                    <SelectValue placeholder="Bulan" />
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
              <div className="divide-y divide-gray-100">
                {filteredLogs.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 font-semibold text-xs">Belum ada data nilai atau observasi capaian terdaftar.</div>
                ) : (
                  paginatedLogs.map((grade) => {
                    const parsed = parseGradeDescription(grade.description)
                    const item = CRITERIA_MAP[parsed.criteria]
                    return (
                      <div key={grade.id} className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-primary-blue">{grade.subject}</span>
                            <span className="font-mono text-[10px] text-primary-blue bg-blue-50 px-2.5 py-0.5 rounded-md font-bold">
                              Bulan {parsed.month} • {parsed.semester}
                            </span>
                            {parsed.tpObj && (
                              <Badge className="bg-gray-100 text-gray-600 border-none text-[9px] font-semibold">
                                {parsed.tpObj.category}
                              </Badge>
                            )}
                          </div>
                          {parsed.tpObj && (
                            <p className="text-[11px] text-gray-500 font-medium">
                              Indikator: {parsed.tpObj.indicator}
                            </p>
                          )}
                          <div className="text-xs text-gray-700 font-medium leading-relaxed pt-1">
                            {parsed.notes ? `"${parsed.notes}"` : <span className="italic text-gray-400">Observasi capaian ananda tercatat mandiri.</span>}
                          </div>
                        </div>
                        <Badge className={cn('font-black text-xs rounded-xl px-3.5 py-1.5 border shrink-0', item.badge)}>
                          {item.label}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredLogs.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[8, 16, 32]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Info & Guide */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Biodata Siswa</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3.5 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama Siswa:</span>
                <span className="text-primary-blue font-extrabold">{studentData?.nama || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Kelompok / Kelas:</span>
                <span className="text-primary-green font-extrabold">{studentData?.classes_tk?.nama || 'Kelompok A'}</span>
              </div>
              <div className="flex justify-between">
                <span>NIK / NISN:</span>
                <span className="text-primary-blue font-mono font-bold">{studentData?.nik || studentData?.nisn || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tahun Ajaran:</span>
                <span className="text-primary-blue font-bold">2026/2027</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[32px] shadow-sm border-none p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary-blue font-black text-xs">
              <Sparkles size={16} className="text-amber-500" />
              <span>Keterangan Kriteria Penilaian</span>
            </div>
            <div className="space-y-2 text-[11px] text-gray-600 leading-relaxed font-medium">
              <div><strong className="text-red-600">BB (Belum Berkembang):</strong> Anak melakukannya harus dengan bimbingan penuh guru.</div>
              <div><strong className="text-amber-600">MB (Mulai Berkembang):</strong> Sudah mulai bisa namun masih perlu diingatkan berkala.</div>
              <div><strong className="text-blue-600">BSH (Berkembang Sesuai Harapan):</strong> Sudah mampu secara mandiri dan konsisten.</div>
              <div><strong className="text-emerald-600">BSB (Berkembang Sangat Baik):</strong> Sudah mandiri dan menjadi teladan bagi kawan.</div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── PRINT-ONLY RAPOR LAYOUT ─── */}
      <div id="print-rapor" className="bg-white text-black font-serif text-sm">
        {/* School Letterhead */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase tracking-tight">KB &amp; TK ISTIQAMAH BANDUNG</h2>
          <p className="text-xs font-semibold italic mt-1">Alamat: Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung, Jawa Barat</p>
          <p className="text-[10px] font-medium text-gray-600">Telp: (022) 4241799 / 0811 2198 853 | Email: info@tkistiqamah.sch.id</p>
        </div>

        {/* Report Card Title */}
        <div className="text-center my-6">
          <h3 className="text-lg font-bold underline uppercase">LAPORAN CAPAIAN PEMBELAJARAN SISWA PAUD</h3>
          <p className="text-xs font-bold mt-1">KURIKULUM MERDEKA • TAHUN AJARAN 2026/2027</p>
        </div>

        {/* Student Meta Details */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs font-medium border border-black p-4 rounded-lg">
          <div className="space-y-1">
            <div className="flex"><span className="w-28">Nama Murid</span><span>: {studentData?.nama}</span></div>
            <div className="flex"><span className="w-28">NISN / NIK</span><span>: {studentData?.nisn || studentData?.nik || '-'}</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex"><span className="w-28">Kelompok</span><span>: {studentData?.classes_tk?.nama || 'Kelompok A'}</span></div>
            <div className="flex"><span className="w-28">Total Penilaian</span><span>: {filteredLogs.length} TP Tercatat</span></div>
          </div>
        </div>

        {/* Grades Table */}
        <table className="w-full border-collapse border border-black mb-8 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2.5 text-center w-10">No</th>
              <th className="border border-black p-2.5 text-left w-64">Tujuan Pembelajaran (TP) &amp; Kategori</th>
              <th className="border border-black p-2.5 text-center w-24">Bulan</th>
              <th className="border border-black p-2.5 text-center w-28">Capaian</th>
              <th className="border border-black p-2.5 text-left">Deskripsi &amp; Catatan Guru</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-black p-4 text-center italic text-gray-500">Belum ada data nilai.</td>
              </tr>
            ) : (
              filteredLogs.map((grade, idx) => {
                const parsed = parseGradeDescription(grade.description)
                const item = CRITERIA_MAP[parsed.criteria]
                return (
                  <tr key={grade.id}>
                    <td className="border border-black p-2.5 text-center">{idx + 1}</td>
                    <td className="border border-black p-2.5">
                      <div className="font-bold">{grade.subject}</div>
                      {parsed.tpObj && (
                        <div className="text-[10px] text-gray-600 italic">Kategori: {parsed.tpObj.category}</div>
                      )}
                    </td>
                    <td className="border border-black p-2.5 text-center font-bold">
                      {parsed.month}
                    </td>
                    <td className="border border-black p-2.5 text-center font-bold">{item.label}</td>
                    <td className="border border-black p-2.5 leading-relaxed">
                      {parsed.notes || 'Ananda berkembang sesuai harapan dalam aspek ini.'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Signature Area */}
        <div className="grid grid-cols-3 gap-4 text-center mt-10 text-xs">
          <div className="space-y-16">
            <div>Orang Tua / Wali Siswa,</div>
            <div className="font-bold underline">( ____________________ )</div>
          </div>
          <div className="space-y-16">
            <div>Mengetahui,<br />Kepala Sekolah</div>
            <div className="font-bold underline">Ustadzah Hj. Nurul Hidayah, S.Pd.I</div>
          </div>
          <div className="space-y-16">
            <div>Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />Guru Kelas,</div>
            <div className="font-bold underline">Ustadzah Khadijah</div>
          </div>
        </div>
      </div>
    </div>
  )
}
