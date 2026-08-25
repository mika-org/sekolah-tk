'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import {
  Camera,
  Trash2,
  Plus,
  Upload,
  ImagePlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { uploadGalleryPhoto, deleteGalleryPhoto } from '@/actions/admin'
import { compressImage } from '@/lib/utils'

export default function AdminGalleryPage() {
  const [galleryList, setGalleryList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Kegiatan')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

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

  useEffect(() => { loadData() }, [])

  // Reset slide index if out of bounds after deletion
  useEffect(() => {
    if (galleryList.length > 0 && currentSlide >= galleryList.length) {
      setCurrentSlide(galleryList.length - 1)
    }
  }, [galleryList, currentSlide])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) { toast.error('Judul wajib diisi.'); return }
    if (!imageFile) { toast.error('Pilih file foto terlebih dahulu.'); return }

    setUploading(true)
    try {
      const compressedFile = await compressImage(imageFile, 0.8, 1920)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('title', title)
      formData.append('category', category)

      const result = await uploadGalleryPhoto(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      setGalleryList(prev => [result.data, ...prev])
      setCurrentSlide(0)
      setTitle('')
      setCategory('Kegiatan')
      setImageFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Foto galeri berhasil ditambahkan!')
    } catch (err: any) {
      toast.error('Gagal mengunggah: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!confirm(`Hapus foto "${item.title}" dari galeri?`)) return

    try {
      const result = await deleteGalleryPhoto(item.id, item.image)
      if (result.error) {
        throw new Error(result.error)
      }
      setGalleryList(prev => prev.filter(img => img.id !== item.id))
      toast.success('Foto berhasil dihapus dari galeri!')
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message)
    }
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? galleryList.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === galleryList.length - 1 ? 0 : prev + 1))
  }

  const filteredGallery = useMemo(() => {
    return galleryList.filter((item) => {
      const matchSearch =
        !searchQuery ||
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [galleryList, searchQuery, categoryFilter])

  const totalPages = Math.ceil(filteredGallery.length / pageSize) || 1
  const paginatedGallery = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredGallery.slice(start, start + pageSize)
  }, [filteredGallery, currentPage, pageSize])

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-primary-blue">Kelola Galeri</h1>
        <p className="text-gray-500 font-semibold text-xs mt-1">Unggah dokumentasi foto kegiatan, fasilitas, atau prestasi sekolah.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Upload */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none sticky top-6">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-black text-primary-blue">Unggah Foto Baru</CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Pilih foto terbaik untuk dipublikasikan.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <form onSubmit={handleAdd} className="space-y-4">
                
                {/* Upload Box */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Berkas Foto</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-36 border-2 border-dashed border-gray-200 hover:border-primary-green/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-[#F8F6F2]"
                  >
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 space-y-1">
                        <ImagePlus size={24} className="mx-auto" />
                        <p className="text-xs font-semibold">Klik untuk memilih foto</p>
                        <p className="text-[10px] text-gray-400">Format: JPG, PNG, WEBP</p>
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

                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-bold text-primary-blue">Judul / Keterangan Foto</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Kegiatan Belajar di Luar Kelas"
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs font-bold text-primary-blue">Kategori</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium outline-none"
                  >
                    <option value="Kegiatan">Kegiatan Siswa</option>
                    <option value="Fasilitas">Fasilitas Sekolah</option>
                    <option value="Prestasi">Prestasi & Penghargaan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !imageFile}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer gap-2 shadow-sm"
                >
                  <Upload size={14} />
                  {uploading ? 'Mengunggah...' : 'Upload & Simpan'}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Catalog & List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Katalog Foto Galeri</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">
                  {filteredGallery.length} foto galeri aktif.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <TableSearchFilter
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val)
                    setCurrentPage(1)
                  }}
                  placeholder="Cari foto..."
                />

                <Select
                  value={categoryFilter}
                  onValueChange={(val) => {
                    if (val) {
                      setCategoryFilter(val)
                      setCurrentPage(1)
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-36 bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="Kegiatan">Kegiatan Siswa</SelectItem>
                    <SelectItem value="Fasilitas">Fasilitas</SelectItem>
                    <SelectItem value="Prestasi">Prestasi</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center p-16 text-gray-400 text-xs">Memuat katalog galeri...</div>
              ) : filteredGallery.length === 0 ? (
                <div className="text-center p-16 text-gray-400 text-xs">Tidak ada foto yang sesuai.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedGallery.map((item) => (
                    <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-video border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-primary-blue/90 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleDelete(item)}
                        className="absolute top-2.5 right-2.5 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all cursor-pointer opacity-90 hover:opacity-100"
                        title="Hapus foto"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6">
                        <p className="text-white text-xs font-bold truncate">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredGallery.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[6, 12, 24]}
            />
          </Card>
        </div>

      </div>

    </div>
  )
}
