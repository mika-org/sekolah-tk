'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { getMaterialsList } from '@/actions/materials'
import { parseMaterialContent } from '@/lib/materials'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { BookOpen, FileText, Download, Sparkles, Layers, CheckCircle2 } from 'lucide-react'

export default function OrangTuaMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
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
              student_name: payload.username === 'orangtua' ? 'Althaf Syahputra' : ''
            }
          }
        } catch (e) {
          console.error('Error decoding cookie token:', e)
        }
      }

      if (!user) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        user = authUser
      }

      let classId = ''

      if (user) {
        const { data: parent } = await supabase
          .from('parents_tk')
          .select('student_id')
          .eq('user_id', user.id)
          .maybeSingle()

        let studentId = parent?.student_id

        if (!studentId) {
          const studentName = user.user_metadata?.student_name || (user.user_metadata?.username === 'orangtua' ? 'Althaf Syahputra' : '')
          if (studentName) {
            const { data: stud } = await supabase
              .from('students_tk')
              .select('*, classes_tk(nama)')
              .eq('nama', studentName)
              .maybeSingle()
            if (stud) {
              setStudent(stud)
              classId = stud.kelas_id || ''
            }
          }
        } else {
          const { data: stud } = await supabase
            .from('students_tk')
            .select('*, classes_tk(nama)')
            .eq('id', studentId)
            .maybeSingle()
          if (stud) {
            setStudent(stud)
            classId = stud.kelas_id || ''
          }
        }
      }

      if (classId) {
        const result = await getMaterialsList(classId)
        if (result.success) {
          setMaterials(result.materials || [])
        }
      } else {
        // Fallback fetch all materials if child not assigned yet
        const result = await getMaterialsList()
        if (result.success) {
          setMaterials(result.materials || [])
        }
      }
    } catch (e: any) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const parsed = parseMaterialContent(m.description)
      const matchSearch =
        !searchQuery ||
        (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (parsed.topic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (parsed.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.teachers_tk?.nama || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })
  }, [materials, searchQuery])

  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMaterials.slice(start, start + pageSize)
  }, [filteredMaterials, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <BookOpen size={12} className="text-amber-400" />
            <span>Kurikulum PAUD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Materi Belajar &amp; Lembar Aktivitas</h1>
          <p className="text-gray-300 font-medium text-xs">
            Unduh modul tematik, topik pembelajaran, panduan aktivitas, dan materi ajar untuk mendampingi buah hati di rumah.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Materials List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <FileText className="text-primary-green" />
                  Materi Belajar Kelompok Ananda
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">
                  Tersedia ({filteredMaterials.length} berkas pembelajaran aktif).
                </CardDescription>
              </div>

              <TableSearchFilter
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val)
                  setCurrentPage(1)
                }}
                placeholder="Cari tema / topik..."
              />
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-xs font-bold">Memuat materi pembelajaran...</div>
              ) : filteredMaterials.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs font-semibold">Belum ada materi belajar yang cocok.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedMaterials.map((m) => {
                    const parsed = parseMaterialContent(m.description)
                    return (
                      <div key={m.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-11 h-11 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
                            <FileText size={22} />
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            {/* Badges: Kelompok & Topik */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-primary-blue text-white text-[10px] font-bold rounded-lg px-2.5 py-0.5">
                                Kelompok: {m.classes_tk?.nama || student?.classes_tk?.nama || 'Umum'}
                              </Badge>
                              {parsed.topic && (
                                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold rounded-lg px-2.5 py-0.5">
                                  Topik: {parsed.topic}
                                </Badge>
                              )}
                            </div>

                            {/* Tema */}
                            <h3 className="font-extrabold text-sm text-primary-blue leading-snug">
                              Tema: {m.title}
                            </h3>

                            {/* Deskripsi / Keterangan */}
                            <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">
                              {parsed.description || 'Tidak ada keterangan tambahan.'}
                            </p>

                            <p className="text-[10px] text-gray-400 font-semibold">
                              Guru Pengampu: {m.teachers_tk?.nama || 'Ustadzah Wali Kelas'} • {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {/* Download button */}
                        <a
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm inline-flex items-center gap-2 shrink-0 self-end sm:self-center cursor-pointer"
                        >
                          <Download size={14} />
                          <span>Unduh Berkas</span>
                        </a>
                      </div>
                    )
                  })}
                </div>
              )}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredMaterials.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[6, 12, 24]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Child Profile Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Info Kelompok Ananda</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3.5 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama Ananda:</span>
                <span className="text-primary-blue font-extrabold">{student?.nama || 'Althaf Syahputra'}</span>
              </div>
              <div className="flex justify-between">
                <span>Kelompok Belajar:</span>
                <span className="text-primary-green font-extrabold">{student?.classes_tk?.nama || 'Kelompok TK-A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Siswa:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold text-[10px]">Aktif Belajar</span>
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
              <span>Panduan Pendampingan</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              Ayah/Bunda dapat mencetak atau mengunduh lembar materi ajar di atas untuk melatih motorik halus, mewarnai, serta mengulang hafalan surat pendek dan doa harian ananda bersama keluarga.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
