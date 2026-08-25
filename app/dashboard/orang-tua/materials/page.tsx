'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { getMaterialsList } from '@/actions/materials'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { BookOpen, FileText, Download, Sparkles } from 'lucide-react'

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
              .select('*')
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
            .select('*')
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
      const matchSearch =
        !searchQuery ||
        (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <span>Akademik</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Materi Belajar & Silabus</h1>
          <p className="text-gray-300 font-medium text-xs">Unduh modul hafalan, tugas mewarnai, RPP, dan bahan belajar kelas anak Anda.</p>
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
                  Materi Belajar Kelas
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">Bahan ajar aktif ({filteredMaterials.length} berkas).</CardDescription>
              </div>

              <TableSearchFilter
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val)
                  setCurrentPage(1)
                }}
                placeholder="Cari modul / materi..."
              />
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Memuat materi...</div>
              ) : !student?.kelas_id ? (
                <div className="p-12 text-center text-gray-400 text-xs">Ananda belum ditempatkan di kelas manapun. Silakan hubungi admin sekolah.</div>
              ) : filteredMaterials.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs">Tidak ada materi belajar yang sesuai.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedMaterials.map((m) => (
                    <div key={m.id} className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 bg-primary-green/10 text-primary-green rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-primary-blue">{m.title}</span>
                          </div>
                          <p className="text-xs text-gray-450 truncate font-semibold mt-0.5">{m.description || 'Tidak ada keterangan tambahan.'}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">Dibagikan oleh: {m.teachers_tk?.nama || 'Wali Kelas'}</p>
                        </div>
                      </div>
                      <a
                        href={m.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#F8F6F2] hover:bg-primary-green/10 text-primary-blue hover:text-primary-green p-3 rounded-xl transition-all cursor-pointer flex-shrink-0"
                        title="Download Berkas"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  ))}
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
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Info Kelas Ananda</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama Anak:</span>
                <span className="text-primary-blue font-extrabold">{student?.nama || 'Calon Murid'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Kelas:</span>
                <span className="text-primary-blue font-bold">{student?.kelas_id ? 'Aktif Terdaftar' : 'Belum Ditentukan'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tahun Ajaran:</span>
                <span className="text-primary-blue font-bold">2026/2027</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
