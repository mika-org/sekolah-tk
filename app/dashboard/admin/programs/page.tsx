'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Upload,
  ImagePlus,
  ExternalLink,
  X,
  Save,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react'
import { ProgramItem } from '@/lib/programs'
import { getProgramsData, saveProgramsData, uploadContentImage } from '@/actions/content'
import { compressImage } from '@/lib/utils'

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dialog & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProgramItem | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [desc, setDesc] = useState('')
  const [longDesc, setLongDesc] = useState('')
  const [layout, setLayout] = useState<'text-top' | 'image-top'>('text-top')
  const [badgeText, setBadgeText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const loadData = async () => {
    setLoading(true)
    const res = await getProgramsData()
    if (res.success && res.data) {
      setPrograms(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setTitle('')
    setCategory('Program Unggulan')
    setDesc('')
    setLongDesc('')
    setLayout('text-top')
    setBadgeText('')
    setImageFile(null)
    setPreviewUrl(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: ProgramItem) => {
    setEditingItem(item)
    setTitle(item.title)
    setCategory(item.category || 'Program Unggulan')
    setDesc(item.desc)
    setLongDesc(item.longDesc || item.desc)
    setLayout(item.layout || 'text-top')
    setBadgeText(item.badge || '')
    setImageFile(null)
    setPreviewUrl(item.image)
    setIsModalOpen(true)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, WebP).')
      return
    }

    try {
      const compressed = await compressImage(file, 0.85, 1280)
      setImageFile(compressed)
      setPreviewUrl(URL.createObjectURL(compressed))
    } catch {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Judul program wajib diisi.')
      return
    }
    if (!previewUrl && !imageFile) {
      toast.error('Foto program wajib dipilih.')
      return
    }

    setSaving(true)
    try {
      let finalImageUrl = previewUrl || ''

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await uploadContentImage(formData, 'programs')
        if (!uploadRes.success || !uploadRes.url) {
          throw new Error(uploadRes.error || 'Gagal mengunggah foto.')
        }
        finalImageUrl = uploadRes.url
      }

      let updatedList: ProgramItem[] = []

      if (editingItem) {
        updatedList = programs.map((item) => {
          if (item.id === editingItem.id) {
            return {
              ...item,
              title: title.trim(),
              category: category.trim() || 'Program Unggulan',
              desc: desc.trim(),
              longDesc: longDesc.trim() || desc.trim(),
              layout,
              image: finalImageUrl,
              badge: badgeText.trim() || undefined,
            }
          }
          return item
        })
      } else {
        const newItem: ProgramItem = {
          id: `prog-${Date.now()}`,
          title: title.trim(),
          category: category.trim() || 'Program Unggulan',
          desc: desc.trim(),
          longDesc: longDesc.trim() || desc.trim(),
          layout,
          image: finalImageUrl,
          badge: badgeText.trim() || undefined,
          published: true,
        }
        updatedList = [newItem, ...programs]
      }

      const saveRes = await saveProgramsData(updatedList)
      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Gagal menyimpan program.')
      }

      setPrograms(updatedList)
      setIsModalOpen(false)
      toast.success(editingItem ? 'Program berhasil diperbarui!' : 'Program baru berhasil ditambahkan!')
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus program "${itemTitle}"?`)) {
      return
    }

    const updatedList = programs.filter((p) => p.id !== id)
    const saveRes = await saveProgramsData(updatedList)
    if (saveRes.success) {
      setPrograms(updatedList)
      toast.success(`Program "${itemTitle}" berhasil dihapus.`)
    } else {
      toast.error('Gagal menghapus program: ' + saveRes.error)
    }
  }

  const filteredList = useMemo(() => {
    return programs.filter((item) => {
      return (
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
  }, [programs, searchQuery])

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, currentPage, pageSize])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            <span>KONTEN &amp; MEDIA WEB</span>
          </div>
          <h1 className="text-2xl font-black text-primary-blue tracking-tight">Kelola Program Unggulan</h1>
          <p className="text-gray-500 text-xs mt-1">
            Atur dan perbarui kegiatan unggulan sekolah seperti Family Day, Tilawati, Outbound, dll yang tampil di beranda dan{' '}
            <Link href="/program" target="_blank" className="text-primary-green hover:underline font-bold inline-flex items-center gap-1">
              /program <ExternalLink size={11} />
            </Link>
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-primary-green hover:bg-emerald-600 text-white font-bold text-xs gap-2 rounded-xl h-10 px-4 shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Program</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <TableSearchFilter
            placeholder="Cari program unggulan..."
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
          />
        </div>
        <span className="text-xs font-bold text-gray-500">
          Total: <strong className="text-primary-blue">{programs.length}</strong> Program
        </span>
      </div>

      {/* Program Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-green mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-400">Memuat data program unggulan...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <Sparkles size={36} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">Tidak ada program ditemukan</p>
          <p className="text-xs text-gray-400 mt-1">Coba sesuaikan kata kunci atau tambah program baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300"
            >
              {/* Image Preview */}
              <div className="relative w-full aspect-[16/10] bg-gray-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  {item.category && (
                    <Badge className="bg-primary-blue/90 text-white backdrop-blur-xs text-[10px] font-bold">
                      {item.category}
                    </Badge>
                  )}
                  {item.badge && (
                    <Badge className="bg-[#F5B744] text-white text-[10px] font-black shadow-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm text-primary-blue leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-blue hover:text-primary-green transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit Program</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredList.length > pageSize && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredList.length / pageSize) || 1}
          totalItems={filteredList.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[6, 9, 12, 18]}
        />
      )}

      {/* Modal Dialog Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-primary-blue">
                    {editingItem ? 'Edit Program Unggulan' : 'Tambah Program Unggulan'}
                  </h3>
                  <p className="text-[11px] text-gray-400">Atur judul, deskripsi, dan foto program.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Judul Program */}
              <div>
                <Label className="text-xs font-bold text-gray-700">Nama Program *</Label>
                <Input
                  required
                  placeholder="Contoh: Family Day, Outbound Ceria, dll"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 text-xs h-9 rounded-xl"
                />
              </div>

              {/* Kategori & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-gray-700">Kategori / Tag</Label>
                  <Input
                    placeholder="Contoh: Sinergi Keluarga, Karakter"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 text-xs h-9 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-gray-700">Badge Khusus (Opsional)</Label>
                  <Input
                    placeholder="Contoh: Unggulan, Favorit, Baru"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="mt-1 text-xs h-9 rounded-xl"
                  />
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <div>
                <Label className="text-xs font-bold text-gray-700">Deskripsi Singkat *</Label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu program..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-input bg-background p-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Deskripsi Mendalam */}
              <div>
                <Label className="text-xs font-bold text-gray-700">Deskripsi Lengkap (Halaman Program)</Label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan lengkap mengenai agenda, tujuan, dan aktivitas program..."
                  value={longDesc}
                  onChange={(e) => setLongDesc(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-input bg-background p-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Layout di Beranda */}
              <div>
                <Label className="text-xs font-bold text-gray-700">Posisi Layout Kartu Beranda</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setLayout('text-top')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      layout === 'text-top'
                        ? 'border-primary-green bg-emerald-50 text-primary-green'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Teks di Atas, Foto di Bawah
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout('image-top')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      layout === 'image-top'
                        ? 'border-primary-green bg-emerald-50 text-primary-green'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Foto di Atas, Teks di Bawah
                  </button>
                </div>
              </div>

              {/* Foto Program */}
              <div>
                <Label className="text-xs font-bold text-gray-700">Foto Dokumentasi Program *</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="mt-1.5 relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-gray-200 group">
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="secondary"
                        size="sm"
                        className="text-xs font-bold h-8 cursor-pointer"
                      >
                        <Upload size={13} className="mr-1" /> Ganti Foto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1.5 w-full aspect-[16/10] border-2 border-dashed border-gray-200 hover:border-primary-green rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-primary-green transition-colors cursor-pointer bg-gray-50/50"
                  >
                    <ImagePlus size={28} className="mb-1" />
                    <span className="text-xs font-bold">Pilih Foto Program</span>
                    <span className="text-[10px] text-gray-400">Format JPG, PNG, atau WebP (Maks 8MB)</span>
                  </button>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-gray-500 cursor-pointer h-9"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-green hover:bg-emerald-600 text-white text-xs font-bold gap-1.5 h-9 px-4 rounded-xl shadow-xs cursor-pointer"
                >
                  <Save size={14} />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Program'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
