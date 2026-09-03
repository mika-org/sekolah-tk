'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { uploadMaterial, deleteMaterial, getMaterialsList } from '@/actions/materials'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { toast } from 'sonner'
import { BookOpen, Upload, Trash2, RefreshCw, FileText, Layers, Tag, HelpCircle } from 'lucide-react'

export default function GuruMaterialsPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form states (Materi Belajar: Tema, Topik Pembelajaran, Kelompok, Keterangan/Deskripsi)
  const [theme, setTheme] = useState('') // Tema (replaces Judul)
  const [topic, setTopic] = useState('') // Topik Pembelajaran (new)
  const [description, setDescription] = useState('') // Keterangan / Deskripsi
  const [selectedGroup, setSelectedGroup] = useState('') // Kelompok (replaces Kelas)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch groups/classes
      const { data: classesData } = await supabase
        .from('classes_tk')
        .select('*')
        .order('nama')

      if (classesData) {
        setClasses(classesData)
        if (classesData.length > 0 && !selectedGroup) setSelectedGroup(classesData[0].id)
      }

      // 2. Fetch materials
      const result = await getMaterialsList()
      if (result.success) {
        setMaterials(result.materials || [])
      }
    } catch (e: any) {
      toast.error('Gagal memuat data: ' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theme.trim() || !selectedGroup || !file) {
      toast.error('Tema, Kelompok, dan Berkas materi wajib diisi.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', theme.trim()) // Stored as title in DB
      formData.append('topic', topic.trim())
      formData.append('description', description.trim())
      formData.append('classId', selectedGroup)
      formData.append('file', file)

      const result = await uploadMaterial(formData)
      if (result.success) {
        toast.success('Materi pembelajaran berhasil diunggah!')
        setTheme('')
        setTopic('')
        setDescription('')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        loadData()
      } else {
        toast.error(result.error || 'Gagal mengunggah materi.')
      }
    } catch (err: any) {
      toast.error('Gagal: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi pembelajaran ini?')) return
    setDeletingId(id)
    try {
      const result = await deleteMaterial(id, fileUrl)
      if (result.success) {
        toast.success('Materi berhasil dihapus.')
        loadData()
      } else {
        toast.error(result.error || 'Gagal menghapus materi.')
      }
    } catch (e: any) {
      toast.error('Gagal: ' + e.message)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.topic && m.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.cleanDescription && m.cleanDescription.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchGroup = groupFilter === 'all' || m.class_id === groupFilter

      return matchSearch && matchGroup
    })
  }, [materials, searchQuery, groupFilter])

  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMaterials.slice(start, start + pageSize)
  }, [filteredMaterials, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue flex items-center gap-2">
            <BookOpen className="text-primary-green" /> Materi &amp; Modul Belajar
          </h1>
          <p className="text-gray-400 font-semibold text-xs mt-1">
            Kelola modul tematik, lembar kerja siswa, dan bahan ajar per kelompok usia PAUD.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs gap-2 cursor-pointer w-fit">
          <RefreshCw size={14} /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form Card */}
        <div className="lg:col-span-5">
          <Card className="bg-white rounded-[32px] shadow-sm border-none p-6 sm:p-8 sticky top-24">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                <Upload size={18} className="text-primary-green" />
                Unggah Materi Belajar Baru
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 font-semibold">
                Isi rincian tema, topik, dan kelompok pembelajaran anak.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Tema (Point 1) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">
                  Tema Pembelajaran *
                </Label>
                <Input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Contoh: Diri Sendiri / Lingkunganku / Binatang"
                  className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-medium focus:bg-white"
                  required
                />
              </div>

              {/* Topik Pembelajaran (Point 2) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">
                  Topik Pembelajaran
                </Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Aku Sayang Binatang Ciptaan Allah / Panca Indera"
                  className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              {/* Kelompok (Point 3 - replaces Kelas) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">
                  Kelompok Belajar *
                </Label>
                <Select value={selectedGroup} onValueChange={(val) => setSelectedGroup(val || '')}>
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-bold">
                    <SelectValue placeholder="-- Pilih Kelompok Belajar --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.nama} {cls.tahun_ajaran ? `(${cls.tahun_ajaran})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Keterangan / Deskripsi (Point 4) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">
                  Keterangan / Deskripsi Pembelajaran
                </Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Rangkuman instruksi atau panduan aktivitas untuk orang tua dan siswa di rumah..."
                  className="w-full text-xs bg-[#F8F6F2] border border-transparent focus:border-primary-green focus:bg-white rounded-xl p-3 outline-none min-h-[90px] font-medium resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">
                  File Berkas Materi (PDF, Doc, Image) *
                </Label>
                <div className="border-2 border-dashed border-gray-200 hover:border-primary-green/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#F8F6F2]/50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="material-file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx"
                  />
                  <label htmlFor="material-file-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                    <FileText size={24} className="text-primary-green" />
                    <span className="text-xs font-bold text-primary-blue">
                      {file ? file.name : 'Pilih file materi pelajaran'}
                    </span>
                    <span className="text-[10px] text-gray-400">Maks. 20MB (.pdf, .docx, .png, .jpg)</span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-black rounded-xl text-xs py-3.5 h-auto transition-all shadow-md cursor-pointer mt-2"
              >
                {uploading ? 'Mengunggah Berkas...' : 'Simpan & Bagikan Materi'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Materials List Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                  <Layers size={18} className="text-primary-green" />
                  Daftar Materi Pembelajaran
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">
                  Materi yang dapat diakses oleh orang tua murid.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <TableSearchFilter
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val)
                    setCurrentPage(1)
                  }}
                  placeholder="Cari tema / topik..."
                />

                <Select
                  value={groupFilter}
                  onValueChange={(val) => {
                    setGroupFilter(val || 'all')
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold h-9 w-36">
                    <SelectValue placeholder="Semua Kelompok" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Kelompok</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-gray-400 font-bold text-xs">Memuat materi belajar...</div>
              ) : filteredMaterials.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-semibold text-xs">Belum ada materi belajar yang cocok.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedMaterials.map((m) => (
                    <div key={m.id} className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-gray-50/60 transition-colors">
                      <div className="space-y-2 flex-1">
                        {/* Badges: Kelompok & Topik */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-primary-blue text-white text-[10px] font-extrabold rounded-lg px-2.5 py-0.5">
                            Kelompok: {m.classes_tk?.nama || 'Umum'}
                          </Badge>
                          {m.topic && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold rounded-lg px-2.5 py-0.5">
                              Topik: {m.topic}
                            </Badge>
                          )}
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Tema */}
                        <h3 className="font-extrabold text-sm text-primary-blue leading-snug">
                          Tema: {m.title}
                        </h3>

                        {/* Deskripsi */}
                        {m.cleanDescription ? (
                          <p className="text-xs text-gray-600 font-medium leading-relaxed">
                            {m.cleanDescription}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Tidak ada keterangan tambahan.</p>
                        )}

                        {/* File Link */}
                        <div className="pt-1">
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#07A363] hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60"
                          >
                            <FileText size={13} /> Unduh Berkas Materi
                          </a>
                        </div>
                      </div>

                      {/* Delete Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === m.id}
                        onClick={() => handleDelete(m.id, m.file_url)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl h-8 w-8 p-0 shrink-0 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </Button>
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
      </div>
    </div>
  )
}
