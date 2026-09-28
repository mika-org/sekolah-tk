'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import {
  Camera,
  Trash2,
  Upload,
  ImagePlus,
  Star,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  Globe,
  Filter
} from 'lucide-react'
import {
  uploadGalleryPhoto,
  deleteGalleryPhoto,
  toggleGalleryShowcase,
  toggleGalleryPublished
} from '@/actions/admin'
import { compressImage } from '@/lib/utils'

const PRESET_CATEGORIES = ['Kegiatan', 'Prestasi', 'Fasilitas', 'Program', 'Ekstrakurikuler']

export default function AdminGalleryPage() {
  const [galleryList, setGalleryList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Kegiatan')
  const [customCategory, setCustomCategory] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [isShowcase, setIsShowcase] = useState(false)
  const [isPublished, setIsPublished] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showcaseFilter, setShowcaseFilter] = useState<'ALL' | 'SHOWCASE' | 'REGULAR'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('galleries_tk')
      .select('*')
      .neq('category', 'Hero Banner')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setGalleryList(data)
    } else {
      setGalleryList([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveSelectedImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImageFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Judul foto wajib diisi.')
      return
    }
    if (!imageFile) {
      toast.error('Pilih file foto terlebih dahulu.')
      return
    }

    const finalCategory = isCustomCategory ? customCategory.trim() || 'Kegiatan' : category

    setUploading(true)
    try {
      const compressedFile = await compressImage(imageFile, 0.82, 1920)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('title', title.trim())
      formData.append('category', finalCategory)
      formData.append('is_showcase', String(isShowcase))
      formData.append('published', String(isPublished))

      const result = await uploadGalleryPhoto(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      setGalleryList((prev) => [result.data, ...prev])
      setTitle('')
      setCategory('Kegiatan')
      setCustomCategory('')
      setIsCustomCategory(false)
      setIsShowcase(false)
      setIsPublished(true)
      setImageFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      toast.success('Foto galeri berhasil diunggah ke server dan disimpan!')
    } catch (err: any) {
      toast.error('Gagal mengunggah foto: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleToggleShowcase = async (item: any) => {
    const nextState = !item.is_showcase
    // Optimistic update
    setGalleryList((prev) =>
      prev.map((g) => (g.id === item.id ? { ...g, is_showcase: nextState } : g))
    )

    const result = await toggleGalleryShowcase(item.id, nextState)
    if (result.error) {
      // Revert optimistic update
      setGalleryList((prev) =>
        prev.map((g) => (g.id === item.id ? { ...g, is_showcase: !nextState } : g))
      )
      toast.error('Gagal mengubah showcase: ' + result.error)
    } else {
      if (nextState) {
        toast.success(`Foto "${item.title}" sekarang ditampilkan di Showcase Beranda!`)
      } else {
        toast.info(`Foto "${item.title}" dihapus dari Showcase Beranda.`)
      }
    }
  }

  const handleTogglePublished = async (item: any) => {
    const nextState = !item.published
    // Optimistic update
    setGalleryList((prev) =>
      prev.map((g) => (g.id === item.id ? { ...g, published: nextState } : g))
    )

    const result = await toggleGalleryPublished(item.id, nextState)
    if (result.error) {
      // Revert optimistic update
      setGalleryList((prev) =>
        prev.map((g) => (g.id === item.id ? { ...g, published: !nextState } : g))
      )
      toast.error('Gagal mengubah status publikasi: ' + result.error)
    } else {
      if (nextState) {
        toast.success(`Foto "${item.title}" berhasil dipublikasikan ke website!`)
      } else {
        toast.info(`Foto "${item.title}" sekarang disembunyikan dari publik.`)
      }
    }
  }

  const handleDelete = async (item: any) => {
    if (!confirm(`Hapus foto "${item.title}" secara permanen dari server dan database?`)) return

    try {
      const result = await deleteGalleryPhoto(item.id, item.image)
      if (result.error) {
        throw new Error(result.error)
      }
      setGalleryList((prev) => prev.filter((img) => img.id !== item.id))
      toast.success('Foto berhasil dihapus dari server!')
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message)
    }
  }

  // Categories present in the gallery
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    galleryList.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set)
  }, [galleryList])

  // Filtered gallery items
  const filteredGallery = useMemo(() => {
    return galleryList.filter((item) => {
      const matchSearch =
        !searchQuery ||
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchCategory =
        categoryFilter === 'ALL' || item.category === categoryFilter

      const matchShowcase =
        showcaseFilter === 'ALL' ||
        (showcaseFilter === 'SHOWCASE' && item.is_showcase) ||
        (showcaseFilter === 'REGULAR' && !item.is_showcase)

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PUBLISHED' && item.published) ||
        (statusFilter === 'DRAFT' && !item.published)

      return matchSearch && matchCategory && matchShowcase && matchStatus
    })
  }, [galleryList, searchQuery, categoryFilter, showcaseFilter, statusFilter])

  const totalPages = Math.ceil(filteredGallery.length / pageSize) || 1
  const paginatedGallery = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredGallery.slice(start, start + pageSize)
  }, [filteredGallery, currentPage, pageSize])

  // Summary counts
  const totalCount = galleryList.length
  const showcaseCount = galleryList.filter((item) => item.is_showcase).length
  const publishedCount = galleryList.filter((item) => item.published).length
  const draftCount = totalCount - publishedCount

  return (
    <div className="space-y-8">
      {/* ─── PAGE HEADER & STATS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue tracking-tight">Kelola Galeri &amp; Showcase</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">
            Unggah dokumentasi foto ke server, kelola katalog foto, dan tentukan foto yang ditampilkan pada showcase beranda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs cursor-pointer bg-white"
          >
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary-blue flex items-center justify-center font-black">
            <Camera size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Galeri</p>
            <p className="text-xl font-black text-primary-blue">{totalCount} <span className="text-xs font-semibold text-gray-400">foto</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-black">
            <Star size={20} className="fill-amber-400 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Showcase Beranda</p>
            <p className="text-xl font-black text-amber-600">{showcaseCount} <span className="text-xs font-semibold text-gray-400">tampil</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Publikasi Aktif</p>
            <p className="text-xl font-black text-emerald-600">{publishedCount} <span className="text-xs font-semibold text-gray-400">aktif</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-black">
            <EyeOff size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Disembunyikan</p>
            <p className="text-xl font-black text-gray-600">{draftCount} <span className="text-xs font-semibold text-gray-400">draf</span></p>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT: FORM + CATALOG ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM UPLOAD (Left Col) */}
        <div className="lg:col-span-4 sticky top-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-primary-green/10 text-primary-green">
                  <Upload size={18} />
                </div>
                <div>
                  <CardTitle className="text-base font-black text-primary-blue">Unggah Foto Galeri</CardTitle>
                  <CardDescription className="text-xs font-semibold text-gray-400">
                    Simpan ke server &amp; atur status tampilan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <form onSubmit={handleAdd} className="space-y-4">
                {/* Upload Box */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue flex items-center justify-between">
                    <span>Berkas Foto</span>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveSelectedImage}
                        className="text-[11px] text-red-500 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <X size={12} /> Hapus pilihan
                      </button>
                    )}
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-40 border-2 border-dashed border-gray-200 hover:border-primary-green/70 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-[#F8F6F2] hover:bg-emerald-50/20"
                  >
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 space-y-1.5 p-4">
                        <div className="w-10 h-10 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center text-primary-green group-hover:scale-110 transition-transform">
                          <ImagePlus size={22} />
                        </div>
                        <p className="text-xs font-bold text-primary-blue">Klik untuk memilih foto</p>
                        <p className="text-[10px] text-gray-400">Format: JPG, PNG, WEBP (Maks 15MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Judul Foto */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-bold text-primary-blue">
                    Judul / Keterangan Foto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Pentas Seni Tari Anak Nusantara"
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-xs sm:text-sm font-medium h-10"
                    required
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-primary-blue">Kategori Foto</Label>
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(!isCustomCategory)}
                      className="text-[11px] text-primary-green font-bold hover:underline cursor-pointer"
                    >
                      {isCustomCategory ? 'Pilih Kategori Standar' : '+ Tulis Kategori Kustom'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <Input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Masukkan nama kategori baru..."
                      className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-xs sm:text-sm font-medium h-10"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            category === cat
                              ? 'bg-primary-green text-white border-primary-green shadow-xs'
                              : 'bg-[#F8F6F2] text-gray-600 border-transparent hover:border-gray-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggles Container */}
                <div className="p-3.5 bg-[#F8F6F2] rounded-2xl space-y-3 border border-gray-100">
                  {/* Showcase Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5 cursor-pointer">
                        <Star size={13} className={isShowcase ? 'text-amber-500 fill-amber-400' : 'text-gray-400'} />
                        <span>Tampilkan di Showcase Beranda</span>
                      </Label>
                      <p className="text-[10px] text-gray-500 leading-tight">
                        Prioritaskan foto ini di grid 7 foto beranda utama sekolah.
                      </p>
                    </div>
                    <Switch
                      checked={isShowcase}
                      onCheckedChange={setIsShowcase}
                      className="data-checked:bg-amber-500"
                    />
                  </div>

                  <hr className="border-gray-200/60" />

                  {/* Published Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5 cursor-pointer">
                        <Eye size={13} className={isPublished ? 'text-emerald-500' : 'text-gray-400'} />
                        <span>Publikasikan ke Website</span>
                      </Label>
                      <p className="text-[10px] text-gray-500 leading-tight">
                        Tampilkan langsung pada halaman Galeri publik.
                      </p>
                    </div>
                    <Switch
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                      className="data-checked:bg-emerald-600"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={uploading || !imageFile}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-3.5 text-xs uppercase cursor-pointer gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Upload size={14} />
                  {uploading ? 'Mengompresi & Mengunggah...' : 'Upload Foto ke Server'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* GALLERY CATALOG & LIST (Right Col) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            {/* Catalog Header & Filters */}
            <CardHeader className="p-6 pb-4 border-b border-gray-50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-black text-primary-blue">Katalog Foto Galeri</CardTitle>
                  <CardDescription className="text-xs font-semibold text-gray-400">
                    Menampilkan {filteredGallery.length} dari total {galleryList.length} foto di server.
                  </CardDescription>
                </div>

                {/* Search Bar */}
                <div className="w-full sm:w-64">
                  <TableSearchFilter
                    value={searchQuery}
                    onChange={(val) => {
                      setSearchQuery(val)
                      setCurrentPage(1)
                    }}
                    placeholder="Cari judul / kategori..."
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Filter size={12} /> Filter:
                </span>

                {/* Showcase Filter Tabs */}
                <div className="inline-flex rounded-xl bg-[#F8F6F2] p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowcaseFilter('ALL')
                      setCurrentPage(1)
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      showcaseFilter === 'ALL'
                        ? 'bg-white text-primary-blue shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowcaseFilter('SHOWCASE')
                      setCurrentPage(1)
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      showcaseFilter === 'SHOWCASE'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-gray-500 hover:text-amber-600'
                    }`}
                  >
                    <Star size={11} className={showcaseFilter === 'SHOWCASE' ? 'fill-white' : ''} />
                    Showcase ({showcaseCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowcaseFilter('REGULAR')
                      setCurrentPage(1)
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      showcaseFilter === 'REGULAR'
                        ? 'bg-white text-primary-blue shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Bukan Showcase
                  </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="inline-flex rounded-xl bg-[#F8F6F2] p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('ALL')
                      setCurrentPage(1)
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'ALL'
                        ? 'bg-white text-primary-blue shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Semua Status
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('PUBLISHED')
                      setCurrentPage(1)
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'PUBLISHED'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-emerald-700'
                    }`}
                  >
                    Aktif ({publishedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('DRAFT')
                      setCurrentPage(1)
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === 'DRAFT'
                        ? 'bg-gray-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Draf ({draftCount})
                  </button>
                </div>

                {/* Category Dropdown Filter if categories > 1 */}
                {availableCategories.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="bg-[#F8F6F2] text-primary-blue font-bold text-[11px] rounded-xl px-2.5 py-1.5 border border-transparent focus:border-primary-green outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Kategori ({availableCategories.length})</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </CardHeader>

            {/* Catalog Grid Cards */}
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-20 text-gray-400 space-y-2">
                  <div className="w-8 h-8 border-3 border-primary-green border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold">Memuat katalog galeri dari server...</p>
                </div>
              ) : filteredGallery.length === 0 ? (
                <div className="text-center py-20 text-gray-400 space-y-2">
                  <Camera size={36} className="mx-auto text-gray-300" />
                  <p className="text-sm font-bold text-gray-500">Tidak ada foto yang sesuai filter.</p>
                  <p className="text-xs text-gray-400">Coba atur ulang kata kunci pencarian atau filter Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedGallery.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
                          {item.category && (
                            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                          )}
                          {item.is_showcase && (
                            <span className="bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Star size={10} className="fill-white" /> Showcase
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(item)}
                          className="absolute top-2.5 right-2.5 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all cursor-pointer opacity-80 hover:opacity-100 shadow-xs"
                          title="Hapus foto dari server"
                        >
                          <Trash2 size={13} />
                        </button>

                        {/* Status Badge on bottom right */}
                        <div className="absolute bottom-2.5 right-2.5">
                          {item.published ? (
                            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200" /> Publik
                            </span>
                          ) : (
                            <span className="bg-gray-700/90 backdrop-blur-md text-gray-200 text-[9px] font-bold px-2 py-0.5 rounded-md">
                              Draf
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content & Inline Toggles */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-black text-xs sm:text-[13px] text-primary-blue line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-[10px] font-medium text-gray-400 mt-1">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'Baru ditambahkan'}
                          </p>
                        </div>

                        {/* Interactive Toggle Controls */}
                        <div className="pt-2.5 border-t border-gray-100 space-y-2">
                          {/* Showcase Toggle */}
                          <div className="flex items-center justify-between text-xs">
                            <label
                              htmlFor={`showcase-${item.id}`}
                              className="font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer text-[11px]"
                            >
                              <Star
                                size={12}
                                className={item.is_showcase ? 'text-amber-500 fill-amber-400' : 'text-gray-300'}
                              />
                              <span>Showcase Beranda</span>
                            </label>
                            <Switch
                              id={`showcase-${item.id}`}
                              checked={Boolean(item.is_showcase)}
                              onCheckedChange={() => handleToggleShowcase(item)}
                              className="data-checked:bg-amber-500"
                              size="sm"
                            />
                          </div>

                          {/* Publish Toggle */}
                          <div className="flex items-center justify-between text-xs">
                            <label
                              htmlFor={`pub-${item.id}`}
                              className="font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer text-[11px]"
                            >
                              <Eye
                                size={12}
                                className={item.published ? 'text-emerald-500' : 'text-gray-300'}
                              />
                              <span>Publikasi di Web</span>
                            </label>
                            <Switch
                              id={`pub-${item.id}`}
                              checked={Boolean(item.published)}
                              onCheckedChange={() => handleTogglePublished(item)}
                              className="data-checked:bg-emerald-600"
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-50">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredGallery.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[6, 12, 24, 36]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
