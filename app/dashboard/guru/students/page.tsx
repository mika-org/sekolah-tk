'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { getTeacherPlottedClassAndStudents } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { toast } from 'sonner'
import {
  Users,
  RefreshCw,
  BookOpen,
  ClipboardList,
  Phone,
  MapPin,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react'

export default function GuruStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState<'all' | 'L' | 'P'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getTeacherPlottedClassAndStudents()
      if (!res.success) {
        toast.error(res.error || 'Gagal memuat data murid.')
        return
      }
      setStudents(res.students || [])
      setClasses(res.classes || [])
      if (res.teacher) setTeacher(res.teacher)
    } catch (e: any) {
      toast.error('Gagal memuat data: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        (s.nama || '').toLowerCase().includes(q) ||
        (s.nisn || '').toLowerCase().includes(q) ||
        (s.nik || '').toLowerCase().includes(q) ||
        (s.alamat || '').toLowerCase().includes(q) ||
        s.parents_tk?.some(
          (p: any) =>
            (p.nama_ayah || '').toLowerCase().includes(q) ||
            (p.nama_ibu || '').toLowerCase().includes(q) ||
            (p.hp || '').toLowerCase().includes(q)
        )

      const matchGender = genderFilter === 'all' || s.jenis_kelamin === genderFilter

      return matchSearch && matchGender
    })
  }, [students, searchQuery, genderFilter])

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  const maleCount = students.filter((s) => s.jenis_kelamin === 'L').length
  const femaleCount = students.filter((s) => s.jenis_kelamin === 'P').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-black text-primary-blue flex items-center gap-2">
              <Users className="text-primary-green" /> Daftar Murid Kelas Binaan
            </h1>
            {classes.length > 0 && (
              <Badge className="bg-[#0F7A4A] hover:bg-[#0F7A4A] text-white font-extrabold text-xs px-3.5 py-1 rounded-full border-none">
                Wali Kelas: {classes.map((c) => c.nama).join(', ')}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 font-semibold text-xs mt-1">
            Daftar seluruh anak didik yang telah di-plotting secara resmi ke kelas Anda.
            {teacher?.nama && ` Pengajar: ${teacher.nama}.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2"
          >
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link href="/dashboard/guru/grades">
            <Button className="bg-primary-blue hover:bg-blue-900 text-white font-extrabold rounded-xl text-xs cursor-pointer gap-1.5 shadow-md">
              <BookOpen size={14} /> Penilaian Kelas
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center font-black">
              <Users size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Murid Kelas</div>
              <div className="text-2xl font-black text-primary-blue">{students.length} Siswa</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
              👦
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Laki-Laki</div>
              <div className="text-2xl font-black text-blue-600">{maleCount} Anak</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black">
              👧
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Perempuan</div>
              <div className="text-2xl font-black text-rose-600">{femaleCount} Anak</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">
              Data Murid ({filteredStudents.length} Siswa)
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">
              Kelas {classes.map((c) => c.nama).join(', ') || '-'} • TA 2026/2027
            </CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Filter */}
            <div className="flex bg-[#F8F6F2] p-1 rounded-xl">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'L', label: 'L' },
                  { id: 'P', label: 'P' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setGenderFilter(tab.id)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    genderFilter === tab.id
                      ? 'bg-white text-primary-blue shadow-xs font-extrabold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <TableSearchFilter
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder="Cari murid, NIK, orang tua..."
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-gray-400 text-xs font-semibold">
              Memuat daftar murid kelas binaan...
            </div>
          ) : students.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                <Info size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-base">Belum Ada Murid yang Di-Plotting</h3>
              <p className="text-gray-500 text-xs max-w-md mx-auto leading-relaxed">
                {classes.length > 0
                  ? `Kelas ${classes.map((c) => c.nama).join(', ')} saat ini belum memiliki murid yang di-plotting. Silakan hubungi Kepala Sekolah / Admin untuk menempatkan murid ke kelas Anda.`
                  : 'Akun Anda belum terhubung sebagai wali kelas pada kelas manapun. Silakan hubungi Admin untuk pengaturan kelas.'}
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center text-gray-400 text-xs font-semibold">
              Tidak ada data murid yang sesuai dengan filter pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8F6F2]/70 text-gray-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-gray-100">
                    <th className="py-4 px-6">No</th>
                    <th className="py-4 px-6">Nama Murid</th>
                    <th className="py-4 px-6">L/P</th>
                    <th className="py-4 px-6">NISN / NIK</th>
                    <th className="py-4 px-6">Orang Tua / Wali</th>
                    <th className="py-4 px-6">Kontak HP / WA</th>
                    <th className="py-4 px-6">Alamat</th>
                    <th className="py-4 px-6 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {paginatedStudents.map((s, idx) => {
                    const parent = s.parents_tk?.[0]
                    const phone = parent?.hp || ''
                    const cleanPhone = phone.replace(/[^0-9]/g, '')
                    const waLink = cleanPhone
                      ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`
                      : null

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-blue/10 text-primary-blue font-black text-xs flex items-center justify-center shrink-0">
                              {s.nama?.substring(0, 2).toUpperCase() || 'AN'}
                            </div>
                            <div>
                              <div className="font-extrabold text-primary-blue text-sm">{s.nama}</div>
                              {s.tempat_lahir && (
                                <div className="text-[10px] text-gray-400">
                                  {s.tempat_lahir}
                                  {s.tanggal_lahir
                                    ? `, ${new Date(s.tanggal_lahir).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}`
                                    : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {s.jenis_kelamin === 'L' ? (
                            <Badge className="bg-blue-50 text-blue-700 border-none font-bold text-[10px]">
                              Laki-laki
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-700 border-none font-bold text-[10px]">
                              Perempuan
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-gray-600">
                          <div>NISN: {s.nisn || '-'}</div>
                          <div className="text-[10px] text-gray-400">NIK: {s.nik || '-'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-700">
                            {parent?.nama_ayah || parent?.nama_ibu || '-'}
                          </div>
                          {parent?.nama_ayah && parent?.nama_ibu && (
                            <div className="text-[10px] text-gray-400">Ibu: {parent.nama_ibu}</div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {phone ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-gray-700">{phone}</span>
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                                  title="Chat WhatsApp Orang Tua"
                                >
                                  <Phone size={12} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 max-w-[200px] truncate text-gray-600" title={s.alamat || ''}>
                          {s.alamat || '-'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/dashboard/guru/grades?student=${s.id}`}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary-blue text-xs font-bold transition-all inline-flex items-center gap-1"
                              title="Beri Nilai CP PAUD"
                            >
                              <BookOpen size={13} />
                              Nilai
                            </Link>
                            <Link
                              href="/dashboard/guru/attendance"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-primary-green text-xs font-bold transition-all inline-flex items-center gap-1"
                              title="Presensi Kelas"
                            >
                              <ClipboardList size={13} />
                              Presensi
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredStudents.length > pageSize && (
            <div className="p-4 border-t border-gray-50">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredStudents.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
