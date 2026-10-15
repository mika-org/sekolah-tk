'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import {
  GraduationCap,
  Printer,
  FileDown,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  User,
  Users,
  MapPin,
  Phone,
  RefreshCw,
  Clock,
} from 'lucide-react'
import {
  CRITERIA_MAP,
  MONTHS_SEMESTER_1,
  MONTHS_SEMESTER_2,
  ALL_MONTHS,
  type TKGradeCriteria,
  parseGradeDescription,
} from '@/lib/grades'
import { cn } from '@/lib/utils'
import { getStudentReportCardData } from '@/actions/grades'
import { generateRaporDocxBlob, downloadBlobAsFile } from '@/lib/export-rapor-docx'
import { toast } from 'sonner'

export default function OrangTuaGradesPage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [gradeLogs, setGradeLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingDocx, setDownloadingDocx] = useState(false)

  // Filter & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSemester, setFilterSemester] = useState<'all' | 'Semester 1' | 'Semester 2'>('Semester 1')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getStudentReportCardData()
      if (res.success && res.student) {
        setStudentData(res.student)
        setGradeLogs(res.grades || [])
      } else {
        toast.error(res.error || 'Gagal memuat data rapor ananda.')
      }
    } catch (err: any) {
      console.error('loadData error:', err)
      toast.error('Gagal memuat capaian: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredLogs = useMemo(() => {
    return gradeLogs.filter((grade) => {
      const parsed = parseGradeDescription(grade.description)
      if (
        searchQuery &&
        !grade.subject?.toLowerCase().includes(searchQuery.toLowerCase()) &&
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
      if (counts[parsed.criteria] !== undefined) {
        counts[parsed.criteria]++
      }
    })
    return counts
  }, [filteredLogs])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadDocx = async () => {
    if (!studentData) {
      toast.error('Data murid belum siap untuk diunduh.')
      return
    }
    setDownloadingDocx(true)
    try {
      const activeSemester = filterSemester === 'all' ? 'Semester 1 (Ganjil)' : filterSemester
      const blob = await generateRaporDocxBlob(studentData, filteredLogs, {
        semester: activeSemester,
        academicYear: studentData.classes_tk?.tahun_ajaran || '2026/2027',
      })
      const filename = `Rapor_TK_Istiqamah_${studentData.nama?.replace(/\s+/g, '_') || 'Murid'}.docx`
      downloadBlobAsFile(blob, filename)
      toast.success('Rapor format Word (.docx) berhasil diunduh!')
    } catch (err: any) {
      console.error('Download docx error:', err)
      toast.error('Gagal mengunduh dokumen Word: ' + err.message)
    } finally {
      setDownloadingDocx(false)
    }
  }

  const parent = studentData?.parents_tk?.[0]
  const parentName = [parent?.nama_ayah ? `Bpk. ${parent.nama_ayah}` : '', parent?.nama_ibu ? `Ibu ${parent.nama_ibu}` : '']
    .filter(Boolean)
    .join(' / ') || 'Orang Tua Murid'

  const wali1 = studentData?.classes_tk?.teachers_tk?.nama || 'Ustadzah Khadijah'
  const wali2 = studentData?.classes_tk?.teachers2_tk?.nama

  const birthDateFormatted = studentData?.tanggal_lahir
    ? new Date(studentData.tanggal_lahir).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-'

  const calculateAge = (dateString?: string) => {
    if (!dateString) return ''
    const birth = new Date(dateString)
    const now = new Date()
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    if (months < 0) {
      years--
      months += 12
    }
    return `${years} Tahun ${months > 0 ? `${months} Bulan` : ''}`
  }

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-gray-400 font-bold text-xs">Memuat capaian pembelajaran &amp; rapor ananda...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 print:space-y-2">
      {/* ─── PRINT-SPECIFIC CSS ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, aside, header, button, .no-print, .toast-container, [role="navigation"] {
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
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
        @media screen {
          #print-rapor {
            display: none;
          }
        }
      `}} />

      {/* ─── SCREEN ONLY: TITLE & ACTION BUTTONS HEADER ─── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue via-[#0c377e] to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            <Award size={13} className="text-amber-400" />
            <span>Kurikulum Merdeka PAUD • Rapor Resmi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Laporan Capaian Belajar Ananda
          </h1>
          <p className="text-blue-100/80 font-medium text-xs sm:text-sm leading-relaxed">
            Perkembangan menyeluruh ananda dalam 3 Elemen Capaian Pembelajaran PAUD: Nilai Agama &amp; Budi Pekerti, Jati Diri, serta Dasar Literasi, Matematika &amp; STEAM.
          </p>

          {/* Quick Meta Student Pill */}
          {studentData && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="bg-white/15 px-3 py-1 rounded-lg">
                Murid: <strong>{studentData.nama}</strong>
              </span>
              <span className="bg-white/15 px-3 py-1 rounded-lg">
                Kelas: <strong>{studentData.classes_tk?.nama || 'TK A'}</strong>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-lg">
                Wali 1: <strong>{wali1}</strong>
                {wali2 && <span> &amp; Wali 2: <strong>{wali2}</strong></span>}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons: PDF & Word */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <Button
            onClick={handlePrint}
            className="bg-primary-green hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs py-3.5 px-5 h-auto cursor-pointer gap-2 shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Printer size={16} /> Cetak / Simpan PDF
          </Button>

          <Button
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            variant="outline"
            className="bg-white/10 hover:bg-white hover:text-primary-blue text-white border-white/30 font-extrabold rounded-2xl text-xs py-3.5 px-5 h-auto cursor-pointer gap-2 shadow-lg transition-all"
          >
            <FileDown size={16} />
            {downloadingDocx ? 'Membuat Word...' : 'Unduh Format Word (.docx)'}
          </Button>
        </div>
      </div>

      {/* ─── SCREEN ONLY: STUDENT PROFILE DETAIL CARD ─── */}
      <Card className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 sm:p-8 no-print">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#07265F] to-[#0F7A4A] text-white flex items-center justify-center font-black text-2xl shadow-md">
              {studentData?.nama ? studentData.nama.charAt(0) : 'A'}
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-primary-green">Profil Peserta Didik</div>
              <h2 className="text-xl sm:text-2xl font-black text-primary-blue">{studentData?.nama || 'Murid Istiqamah'}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                <span>NISN: <strong>{studentData?.nisn || '-'}</strong></span>
                <span>•</span>
                <span>NIK: <strong>{studentData?.nik || '-'}</strong></span>
                <span>•</span>
                <span>Rombel: <strong className="text-primary-blue">{studentData?.classes_tk?.nama || 'Kelompok A'}</strong></span>
              </div>
            </div>
          </div>

          <Button onClick={loadData} variant="outline" className="border-gray-200 text-xs font-bold rounded-xl gap-2 cursor-pointer">
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>

        {/* 2-Column Detail Meta Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs font-medium">
          <div className="bg-[#F8F6F2] p-4 rounded-2xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-400">Tempat, Tanggal Lahir</div>
            <div className="font-bold text-primary-blue">{studentData?.tempat_lahir || 'Bandung'}, {birthDateFormatted}</div>
            <div className="text-[11px] text-gray-500">{calculateAge(studentData?.tanggal_lahir)}</div>
          </div>

          <div className="bg-[#F8F6F2] p-4 rounded-2xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-400">Jenis Kelamin &amp; Agama</div>
            <div className="font-bold text-primary-blue">{studentData?.jenis_kelamin || 'Laki-laki'}</div>
            <div className="text-[11px] text-gray-500">{studentData?.agama || 'Islam'}</div>
          </div>

          <div className="bg-[#F8F6F2] p-4 rounded-2xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-400">Orang Tua / Wali</div>
            <div className="font-bold text-primary-blue">{parentName}</div>
            <div className="text-[11px] text-gray-500">HP: {parent?.hp || '-'}</div>
          </div>

          <div className="bg-[#F8F6F2] p-4 rounded-2xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-400">Dewan Wali Kelas</div>
            <div className="font-bold text-primary-blue">1. {wali1}</div>
            <div className="text-[11px] text-emerald-700 font-semibold">{wali2 ? `2. ${wali2}` : 'Guru Pendamping Terjadwal'}</div>
          </div>
        </div>
      </Card>

      {/* ─── SCREEN ONLY: CRITERIA SUMMARY CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <div
          onClick={() => {
            setSearchQuery('BB')
            document.getElementById('daftar-capaian-pembelajaran')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="cursor-pointer group"
          title="Klik untuk memfilter capaian Belum Berkembang (BB)"
        >
          <Card className="bg-red-50/60 border-red-100 rounded-2xl p-4 text-center hover:bg-red-100/60 hover:shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="text-[10px] font-bold text-red-600 uppercase group-hover:text-red-700">1. Belum Berkembang</div>
            <div className="text-2xl font-black text-red-700 mt-1">{summaryCounts.BB}</div>
            <div className="text-[10px] text-red-500 font-semibold mt-0.5">BB (Perlu Bimbingan Penuh)</div>
          </Card>
        </div>

        <div
          onClick={() => {
            setSearchQuery('MB')
            document.getElementById('daftar-capaian-pembelajaran')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="cursor-pointer group"
          title="Klik untuk memfilter capaian Mulai Berkembang (MB)"
        >
          <Card className="bg-amber-50/60 border-amber-100 rounded-2xl p-4 text-center hover:bg-amber-100/60 hover:shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="text-[10px] font-bold text-amber-600 uppercase group-hover:text-amber-700">2. Mulai Berkembang</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{summaryCounts.MB}</div>
            <div className="text-[10px] text-amber-500 font-semibold mt-0.5">MB (Perlu Diingatkan)</div>
          </Card>
        </div>

        <div
          onClick={() => {
            setSearchQuery('BSH')
            document.getElementById('daftar-capaian-pembelajaran')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="cursor-pointer group"
          title="Klik untuk memfilter capaian Berkembang Sesuai Harapan (BSH)"
        >
          <Card className="bg-blue-50/60 border-blue-100 rounded-2xl p-4 text-center hover:bg-blue-100/60 hover:shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="text-[10px] font-bold text-blue-600 uppercase group-hover:text-blue-700">3. Sesuai Harapan</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{summaryCounts.BSH}</div>
            <div className="text-[10px] text-blue-500 font-semibold mt-0.5">BSH (Mandiri &amp; Konsisten)</div>
          </Card>
        </div>

        <div
          onClick={() => {
            setSearchQuery('BSB')
            document.getElementById('daftar-capaian-pembelajaran')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="cursor-pointer group"
          title="Klik untuk memfilter capaian Berkembang Sangat Baik (BSB)"
        >
          <Card className="bg-emerald-50/60 border-emerald-100 rounded-2xl p-4 text-center hover:bg-emerald-100/60 hover:shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="text-[10px] font-bold text-emerald-600 uppercase group-hover:text-emerald-700">4. Sangat Baik</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{summaryCounts.BSB}</div>
            <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">BSB (Teladan bagi Kawan)</div>
          </Card>
        </div>
      </div>

      {/* ─── SCREEN ONLY: FILTER & TABLE LIST ─── */}
      <Card id="daftar-capaian-pembelajaran" className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden no-print">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">
              Rincian Capaian Pembelajaran
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400 mt-0.5">
              Menampilkan {filteredLogs.length} hasil evaluasi observasi ananda.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterSemester} onValueChange={(val: any) => { setFilterSemester(val); setCurrentPage(1) }}>
              <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Semester</SelectItem>
                <SelectItem value="Semester 1">Semester 1 (Ganjil)</SelectItem>
                <SelectItem value="Semester 2">Semester 2 (Genap)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={(val: any) => { setFilterMonth(val); setCurrentPage(1) }}>
              <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                <SelectValue placeholder="Semua Bulan" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Bulan</SelectItem>
                {ALL_MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TableSearchFilter
              value={searchQuery}
              onChange={(val) => { setSearchQuery(val); setCurrentPage(1) }}
              placeholder="Cari materi / catatan..."
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Award className="w-12 h-12 text-gray-300 mx-auto" />
              <div className="font-black text-gray-500 text-sm">Belum Ada Catatan Rapor</div>
              <div className="text-xs text-gray-400 max-w-sm mx-auto">
                Belum ada data evaluasi capaian pembelajaran yang cocok dengan filter yang dipilih.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-[11px] font-black text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-6 w-12">No.</th>
                    <th className="p-4 w-72">Tujuan Pembelajaran (TP) &amp; Elemen</th>
                    <th className="p-4 w-28 text-center">Bulan &amp; Smt</th>
                    <th className="p-4 w-36 text-center">Capaian</th>
                    <th className="p-4 pr-6">Deskripsi &amp; Narasi Evaluasi Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedLogs.map((grade, idx) => {
                    const parsed = parseGradeDescription(grade.description)
                    const criteriaInfo = CRITERIA_MAP[parsed.criteria] || { label: 'BSH', badge: 'bg-blue-50 text-blue-700' }
                    return (
                      <tr key={grade.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4 pl-6 font-bold text-gray-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-4">
                          <div className="font-extrabold text-primary-blue text-xs">{grade.subject}</div>
                          {parsed.tpObj?.category && (
                            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              Elemen: {parsed.tpObj.category}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="font-bold text-gray-700">{parsed.month || '-'}</div>
                          <div className="text-[10px] text-gray-400">{parsed.semester}</div>
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={cn('font-black text-[11px] rounded-lg px-2.5 py-0.5 border shadow-none', criteriaInfo.badge)}>
                            {parsed.criteria} • {criteriaInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4 pr-6 text-gray-600 leading-relaxed text-xs">
                          {parsed.notes || (
                            <span className="italic text-gray-400">Ananda telah menunjukkan perkembangan yang selaras dengan target pembelajaran PAUD.</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* ─── PRINT-ONLY RAPOR LAYOUT (A4 OPTIMIZED) ─── */}
      <div id="print-rapor" className="bg-white text-black font-sans text-xs leading-normal">
        {/* School Letterhead (Kop Surat Resmi) */}
        <div className="border-b-[3px] border-double border-black pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-16 h-16 relative shrink-0">
              {/* Logo Sekolah */}
              <img
                src="/images/hero_gsap/logo.png"
                alt="Logo KB &amp; TK Istiqamah"
                className="w-16 h-16 object-contain"
              />
            </div>
            <div className="text-center flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
                YAYASAN KARYA PEMBINA DAKWAH / PENDIDIKAN ISLAM ISTIQAMAH
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#07265F]">
                KB &amp; TK ISTIQAMAH BANDUNG
              </h2>
              <div className="text-[10px] font-bold text-emerald-800">
                NPSN: 20255241 • Terakreditasi &quot;A&quot; (BAN PDM) • Kurikulum Merdeka PAUD
              </div>
              <p className="text-[9.5px] text-gray-600 mt-0.5">
                Jl. Taman Citarum No. 1, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115
              </p>
              <p className="text-[9px] text-gray-500">
                Telp: (022) 4241799 / 0811 2198 853 • Email: info@tkistiqamah.sch.id • Website: https://tkistiqamah.com
              </p>
            </div>
            <div className="w-16 shrink-0" />
          </div>
        </div>

        {/* Report Document Title */}
        <div className="text-center my-4 space-y-0.5">
          <h3 className="text-sm font-black underline uppercase tracking-wide text-black">
            LAPORAN CAPAIAN PEMBELAJARAN PESERTA DIDIK (RAPOR PAUD)
          </h3>
          <p className="text-[10.5px] font-bold uppercase text-gray-700">
            KURIKULUM MERDEKA • TAHUN PELAJARAN {studentData?.classes_tk?.tahun_ajaran || '2026/2027'} • {filterSemester === 'all' ? 'SEMESTER 1' : filterSemester.toUpperCase()}
          </p>
        </div>

        {/* ─── DATA DIRI PESERTA DIDIK (LENGKAP) ─── */}
        <div className="mb-4 border border-black/80 rounded-lg p-3 bg-gray-50/40 text-[11px]">
          <div className="font-bold uppercase text-[10px] border-b border-gray-300 pb-1 mb-2 tracking-wider text-[#07265F]">
            Identitas Data Diri Murid
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <div className="flex">
              <span className="w-36 font-semibold">Nama Lengkap Murid</span>
              <span className="font-bold">: {studentData?.nama || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold">Kelompok / Rombel</span>
              <span className="font-bold">: {studentData?.classes_tk?.nama || 'TK A'}</span>
            </div>

            <div className="flex">
              <span className="w-36 font-semibold">NISN / NIK</span>
              <span>: {studentData?.nisn || '-'} / {studentData?.nik || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold">Tahun Pelajaran</span>
              <span>: {studentData?.classes_tk?.tahun_ajaran || '2026/2027'}</span>
            </div>

            <div className="flex">
              <span className="w-36 font-semibold">Tempat, Tanggal Lahir</span>
              <span>: {studentData?.tempat_lahir || 'Bandung'}, {birthDateFormatted}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold">Nama Orang Tua / Wali</span>
              <span>: {parentName}</span>
            </div>

            <div className="flex">
              <span className="w-36 font-semibold">Jenis Kelamin / Agama</span>
              <span>: {studentData?.jenis_kelamin || 'Laki-laki'} / {studentData?.agama || 'Islam'}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold">Kontak Orang Tua / HP</span>
              <span>: {parent?.hp || '-'}</span>
            </div>

            <div className="flex col-span-2">
              <span className="w-36 font-semibold">Alamat Tempat Tinggal</span>
              <span>: {studentData?.alamat || parent?.alamat || 'Kota Bandung, Jawa Barat'}</span>
            </div>

            <div className="flex col-span-2">
              <span className="w-36 font-semibold">Dewan Wali Kelas</span>
              <span className="font-bold text-[#07265F]">
                : Wali 1: {wali1} {wali2 ? `• Wali 2: ${wali2}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* ─── TABEL CAPAIAN PEMBELAJARAN ─── */}
        <div className="mb-4">
          <div className="font-bold uppercase text-[10px] mb-1 tracking-wider text-[#07265F]">
            Hasil Evaluasi Capaian Pembelajaran &amp; Observasi Perkembangan
          </div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="bg-gray-100 font-bold">
                <th className="border border-black p-1.5 text-center w-8">No</th>
                <th className="border border-black p-1.5 text-left w-64">Tujuan Pembelajaran (TP) &amp; Elemen</th>
                <th className="border border-black p-1.5 text-center w-16">Bulan</th>
                <th className="border border-black p-1.5 text-center w-24">Capaian</th>
                <th className="border border-black p-1.5 text-left">Deskripsi Perkembangan &amp; Narasi Catatan Guru</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-black p-4 text-center italic text-gray-500">
                    Belum ada data evaluasi capaian pembelajaran yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((grade, idx) => {
                  const parsed = parseGradeDescription(grade.description)
                  const item = CRITERIA_MAP[parsed.criteria] || { label: 'BSH' }
                  return (
                    <tr key={grade.id} className="align-top">
                      <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-1.5">
                        <div className="font-bold text-black">{grade.subject}</div>
                        {parsed.tpObj?.category && (
                          <div className="text-[9px] text-gray-600 italic">Elemen: {parsed.tpObj.category}</div>
                        )}
                      </td>
                      <td className="border border-black p-1.5 text-center font-semibold">
                        {parsed.month || '-'}
                      </td>
                      <td className="border border-black p-1.5 text-center font-bold">
                        {parsed.criteria} ({item.label})
                      </td>
                      <td className="border border-black p-1.5 leading-relaxed">
                        {parsed.notes || 'Ananda menunjukkan capaian perkembangan yang sesuai dengan tahapan usianya.'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── REKAPITULASI & PANDUAN PENILAIAN ─── */}
        <div className="border border-black p-2.5 rounded-lg mb-4 text-[9.5px] bg-gray-50/30">
          <div className="font-bold uppercase text-[9.5px] mb-1">
            Rekapitulasi Capaian Pembelajaran &amp; Panduan Kriteria Kurikulum Merdeka PAUD:
          </div>
          <div className="grid grid-cols-4 gap-2 mb-1.5 font-bold text-center">
            <div className="border border-red-300 bg-red-50 p-1 rounded">BB (Belum): {summaryCounts.BB} TP</div>
            <div className="border border-amber-300 bg-amber-50 p-1 rounded">MB (Mulai): {summaryCounts.MB} TP</div>
            <div className="border border-blue-300 bg-blue-50 p-1 rounded">BSH (Harapan): {summaryCounts.BSH} TP</div>
            <div className="border border-emerald-300 bg-emerald-50 p-1 rounded">BSB (Sangat Baik): {summaryCounts.BSB} TP</div>
          </div>
          <div className="text-[8.5px] text-gray-600 space-y-0.5 leading-tight">
            <div>• <strong>BB (Belum Berkembang):</strong> Anak melakukannya harus dengan bimbingan dan dorongan penuh dari guru.</div>
            <div>• <strong>MB (Mulai Berkembang):</strong> Anak sudah mulai mampu mencoba namun masih perlu diingatkan berkala oleh guru.</div>
            <div>• <strong>BSH (Berkembang Sesuai Harapan):</strong> Anak sudah mampu mandiri dan konsisten tanpa perlu diingatkan guru.</div>
            <div>• <strong>BSB (Berkembang Sangat Baik):</strong> Anak sudah mampu mandiri dan dapat menjadi contoh/teladan bagi teman sebaya.</div>
          </div>
        </div>

        {/* ─── SIGNATURE AREA (3 PIHAK RESMI) ─── */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-4">
          <div className="flex flex-col justify-between h-28">
            <div>
              <div>Orang Tua / Wali Murid,</div>
            </div>
            <div className="font-bold underline">
              ( {parentName !== 'Orang Tua Murid' ? parentName : '___________________________'} )
            </div>
          </div>

          <div className="flex flex-col justify-between h-28">
            <div>
              <div>Mengetahui,</div>
              <div className="font-bold">Kepala KB &amp; TK Istiqamah Bandung</div>
            </div>
            <div>
              <div className="font-bold underline">Ustadzah Hj. Nurul Hidayah, S.Pd.I</div>
              <div className="text-[9px] text-gray-600">NIP. 19780512 200501 2 003</div>
            </div>
          </div>

          <div className="flex flex-col justify-between h-28">
            <div>
              <div>Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="font-bold">{wali2 ? 'Dewan Wali Kelas,' : 'Guru / Wali Kelas,'}</div>
            </div>
            <div>
              <div className="font-bold underline">{wali1}</div>
              {wali2 && <div className="text-[9px] font-semibold text-gray-700">&amp; {wali2}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
