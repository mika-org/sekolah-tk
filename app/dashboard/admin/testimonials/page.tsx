'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  MessageSquare,
  Plus,
  Trash2,
  Upload,
  ImagePlus,
  Eye,
  EyeOff,
  RefreshCw,
  Quote,
  Pencil,
  FileText,
  Check,
} from 'lucide-react'
import {
  uploadTestimonialPhoto,
  saveTestimonial,
  updateTestimonial,
  toggleTestimonialPublished,
  deleteTestimonial,
} from '@/actions/admin'

export default function AdminTestimonialsPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Create Form states
  const [name, setName] = useState('')
  const [job, setJob] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Dialog states
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editJob, setEditJob] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editPublished, setEditPublished] = useState(true)
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('testimonials_tk')
      .select('*')
      .order('id', { ascending: false })

    if (!error && data) setList(data)
    else setList([])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
      toast.error('Format berkas harus PNG, PDF, JPG, atau JPEG.')
      return
    }
    setPhotoFile(file)
    if (ext === 'pdf') {
      setPreviewUrl('__pdf__')
    } else {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
      toast.error('Format berkas harus PNG, PDF, JPG, atau JPEG.')
      return
    }
    setEditPhotoFile(file)
    if (ext === 'pdf') {
      setEditPreviewUrl('__pdf__')
    } else {
      setEditPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !job || !content) {
      toast.error('Semua field wajib diisi.')
      return
    }

    setSaving(true)
    try {
      let photoUrl: string | null = null

      if (photoFile) {
        const fd = new FormData()
        fd.append('file', photoFile)
        const uploadResult = await uploadTestimonialPhoto(fd)
        if ('error' in uploadResult && uploadResult.error) throw new Error(uploadResult.error)
        photoUrl = uploadResult.photoUrl ?? null
      }

      const result = await saveTestimonial({ name, job, content, published, photo: photoUrl })
      if (result.error) throw new Error(result.error)

      setList((prev) => [result.data, ...prev])
      setName('')
      setJob('')
      setContent('')
      setPublished(true)
      setPhotoFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Testimoni berhasil ditambahkan!')
    } catch (err: any) {
      toast.error('Gagal: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (item: any) => {
    setEditItem(item)
    setEditName(item.name || '')
    setEditJob(item.job || '')
    setEditContent(item.content || '')
    setEditPublished(item.published ?? true)
    setEditPhotoFile(null)
    setEditPreviewUrl(item.photo || null)
    setEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    if (!editName.trim() || !editJob.trim() || !editContent.trim()) {
      toast.error('Nama, pekerjaan, dan isi testimoni wajib diisi.')
      return
    }

    setEditSaving(true)
    try {
      let finalPhotoUrl = editItem.photo

      if (editPhotoFile) {
        const fd = new FormData()
        fd.append('file', editPhotoFile)
        const uploadResult = await uploadTestimonialPhoto(fd)
        if ('error' in uploadResult && uploadResult.error) throw new Error(uploadResult.error)
        finalPhotoUrl = uploadResult.photoUrl ?? editItem.photo
      }

      const result = await updateTestimonial({
        id: editItem.id,
        name: editName.trim(),
        job: editJob.trim(),
        content: editContent.trim(),
        published: editPublished,
        photo: finalPhotoUrl,
      })

      if (result.error) throw new Error(result.error)

      setList((prev) =>
        prev.map((t) => (t.id === editItem.id ? { ...t, ...result.data } : t))
      )
      setEditOpen(false)
      toast.success('Testimoni berhasil diperbarui!')
    } catch (err: any) {
      toast.error('Gagal memperbarui testimoni: ' + err.message)
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    const result = await toggleTestimonialPublished(id, !current)
    if (result.error) {
      toast.error('Gagal: ' + result.error)
      return
    }
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, published: !current } : t)))
  }

  const handleDelete = async (item: any) => {
    if (!confirm(`Hapus testimoni dari "${item.name}"?`)) return
    const result = await deleteTestimonial(item.id, item.photo)
    if (result.error) {
      toast.error('Gagal: ' + result.error)
      return
    }
    setList((prev) => prev.filter((t) => t.id !== item.id))
    toast.success('Testimoni berhasil dihapus.')
  }

  const filteredList = useMemo(() => {
    if (!searchQuery) return list
    const q = searchQuery.toLowerCase()
    return list.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.job?.toLowerCase().includes(q) ||
        item.content?.toLowerCase().includes(q)
    )
  }, [list, searchQuery])

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Kelola Testimoni</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">
            Ulasan dan kata orang tua murid tentang KB &amp; TK Istiqamah.
          </p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Tambah Testimoni */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-black text-primary-blue">Tambah Testimoni</CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">
                Lengkapi form berikut untuk menambahkan ulasan baru.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Upload Foto */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold text-primary-blue">Foto Orang Tua / Profil</Label>
                    <span className="text-[10px] text-gray-400 font-medium">PNG, PDF, JPG, JPEG</span>
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-28 border-2 border-dashed border-gray-200 hover:border-primary-green/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-[#F8F6F2]"
                  >
                    {previewUrl === '__pdf__' ? (
                      <div className="flex flex-col items-center justify-center text-primary-green p-2 text-center">
                        <FileText size={32} />
                        <span className="text-[10px] font-bold mt-1 max-w-[180px] truncate">{photoFile?.name}</span>
                        <span className="text-[9px] text-gray-400">Dokumen PDF</span>
                      </div>
                    ) : previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 space-y-1">
                        <ImagePlus size={22} className="mx-auto" />
                        <p className="text-[10px] font-semibold">Klik untuk pilih berkas</p>
                        <p className="text-[9px] text-gray-400">PNG, PDF, JPG, JPEG (Maks. 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Nama Lengkap</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Budi Santoso"
                    required
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Pekerjaan / Keterangan</Label>
                  <Input
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="Orang Tua Murid Kelas Mina Arafah"
                    required
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Isi Testimoni</Label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Sekolah ini luar biasa, anak saya sangat senang belajar di sini..."
                    required
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 accent-primary-green cursor-pointer"
                  />
                  <Label htmlFor="published" className="text-xs font-bold text-primary-blue cursor-pointer">
                    Langsung Tampilkan di Web
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer gap-2 shadow-sm"
                >
                  <Upload size={14} />
                  {saving ? 'Menyimpan...' : 'Simpan Testimoni'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Daftar Testimoni */}
        <div className="lg:col-span-8">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Daftar Testimoni</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">
                  {filteredList.length} testimoni · {list.filter((t) => t.published).length} ditayangkan
                </CardDescription>
              </div>

              <TableSearchFilter
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val)
                  setCurrentPage(1)
                }}
                placeholder="Cari nama, pekerjaan..."
              />
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-gray-400 text-xs">Memuat testimoni...</div>
              ) : filteredList.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs">Tidak ada testimoni yang sesuai.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {paginatedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 flex gap-4 items-start hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {item.photo && item.photo.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary-green flex flex-col items-center justify-center border-2 border-emerald-100">
                            <FileText size={18} />
                            <span className="text-[8px] font-bold">PDF</span>
                          </div>
                        ) : item.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-primary-blue/10 text-primary-blue flex items-center justify-center font-black text-lg">
                            {item.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-black text-sm text-primary-blue">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-semibold">{item.job}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge
                              status={item.published ? 'published' : 'draft'}
                              customLabel={item.published ? 'Ditayangkan' : 'Tersembunyi'}
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="mt-2 flex items-start gap-1.5">
                          <Quote size={10} className="text-primary-green flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(item)}
                          title="Edit Testimoni"
                          className="p-2 rounded-lg bg-blue-50 text-primary-blue hover:bg-blue-100 transition-all cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleToggle(item.id, item.published)}
                          title={item.published ? 'Sembunyikan' : 'Tampilkan'}
                          className={`p-2 rounded-lg transition-all cursor-pointer ${
                            item.published
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {item.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Hapus Testimoni"
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredList.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[5, 10, 20]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── MODAL EDIT TESTIMONI ─── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-primary-blue flex items-center gap-2">
              <Pencil size={20} className="text-primary-green" /> Edit Testimoni
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium">
              Perbarui profil dan ulasan testimoni orang tua / wali murid.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            {/* Upload / Ganti Foto */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-primary-blue">Foto Profil</Label>
                <span className="text-[10px] text-gray-400 font-medium">PNG, PDF, JPG, JPEG</span>
              </div>
              <div
                onClick={() => editFileInputRef.current?.click()}
                className="h-28 border-2 border-dashed border-gray-200 hover:border-primary-green/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-[#F8F6F2]"
              >
                {editPreviewUrl === '__pdf__' ? (
                  <div className="flex flex-col items-center justify-center text-primary-green p-2 text-center">
                    <FileText size={32} />
                    <span className="text-[10px] font-bold mt-1 max-w-[200px] truncate">
                      {editPhotoFile?.name || 'Dokumen PDF'}
                    </span>
                    <span className="text-[9px] text-gray-400">Klik untuk ganti berkas</span>
                  </div>
                ) : editPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400 space-y-1">
                    <ImagePlus size={22} className="mx-auto" />
                    <p className="text-[10px] font-semibold">Klik untuk ganti foto</p>
                    <p className="text-[9px] text-gray-400">PNG, PDF, JPG, JPEG</p>
                  </div>
                )}
              </div>
              <input
                ref={editFileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={handleEditFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Nama Lengkap</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nama Lengkap"
                required
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Pekerjaan / Keterangan</Label>
              <Input
                value={editJob}
                onChange={(e) => setEditJob(e.target.value)}
                placeholder="Orang Tua Murid..."
                required
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Isi Testimoni</Label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required
                rows={4}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="edit_published"
                checked={editPublished}
                onChange={(e) => setEditPublished(e.target.checked)}
                className="w-4 h-4 accent-primary-green cursor-pointer"
              />
              <Label htmlFor="edit_published" className="text-xs font-bold text-primary-blue cursor-pointer">
                Tampilkan di Website
              </Label>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-xl font-bold text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={editSaving}
                className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs gap-1.5 shadow-sm"
              >
                {editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
