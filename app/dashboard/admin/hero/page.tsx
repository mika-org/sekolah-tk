'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import {
  Camera,
  Trash2,
  Plus,
  Upload,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Layers,
  ExternalLink
} from 'lucide-react'
import { uploadHeroBanner, deleteHeroBanner } from '@/actions/admin'
import { compressImage } from '@/lib/utils'

export default function AdminHeroPage() {
  const [bannerList, setBannerList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Form states
  const [buttonText, setButtonText] = useState('')
  const [buttonLink, setButtonLink] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(4)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('galleries_tk')
      .select('*')
      .eq('category', 'Hero Banner')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBannerList(data)
    } else {
      setBannerList([])
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (bannerList.length > 0 && currentSlide >= bannerList.length) {
      setCurrentSlide(bannerList.length - 1)
    }
  }, [bannerList, currentSlide])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) { toast.error('Pilih file gambar banner terlebih dahulu.'); return }

    setUploading(true)
    try {
      const compressedFile = await compressImage(imageFile, 0.8, 1920)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('buttonText', buttonText)
      formData.append('buttonLink', buttonLink)

      const result = await uploadHeroBanner(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      setBannerList(prev => [result.data, ...prev])
      setCurrentSlide(0)
      setButtonText('')
      setButtonLink('')
      setImageFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Banner hero berhasil ditambahkan!')
    } catch (err: any) {
      toast.error('Gagal mengunggah: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (item: any) => {
    if (!confirm('Hapus banner hero ini?')) return

    try {
      const result = await deleteHeroBanner(item.id, item.image)
      if (result.error) {
        throw new Error(result.error)
      }
      setBannerList(prev => prev.filter(b => b.id !== item.id))
      toast.success('Banner hero berhasil dihapus!')
    } catch (err: any) {
      toast.error('Gagal menghapus: ' + err.message)
    }
  }

  const parseBtnConfig = (titleStr: string) => {
    try {
      const obj = JSON.parse(titleStr)
      return { text: obj.btnText || '', link: obj.btnLink || '' }
    } catch {
      return { text: titleStr || '', link: '' }
    }
  }

  const filteredBanners = useMemo(() => {
    return bannerList.filter((item) => {
      const cfg = parseBtnConfig(item.title)
      const matchSearch =
        !searchQuery ||
        cfg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cfg.link.toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })
  }, [bannerList, searchQuery])

  const totalPages = Math.ceil(filteredBanners.length / pageSize) || 1
  const paginatedBanners = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredBanners.slice(start, start + pageSize)
  }, [filteredBanners, currentPage, pageSize])

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-primary-blue">Kelola Banner Hero</h1>
        <p className="text-gray-500 font-semibold text-xs mt-1">
          Unggah dan atur gambar latar belakang carousel untuk halaman depan website sekolah.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Upload Form */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none sticky top-6">
            <CardHeader>
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <Plus size={18} className="text-primary-green" />
                Tambah Banner Baru
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">
                Upload foto banner slider ke bucket penyimpanan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4 text-sm">

                {/* Image Picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Gambar Banner</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative cursor-pointer border-2 border-dashed border-gray-200 hover:border-primary-green rounded-2xl transition-colors overflow-hidden aspect-video flex items-center justify-center bg-[#F8F6F2]"
                  >
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-center space-y-2 text-gray-400 pointer-events-none">
                        <ImagePlus size={28} className="mx-auto" />
                        <p className="text-xs font-semibold">Klik untuk pilih gambar</p>
                        <p className="text-[10px]">PNG, JPG, WEBP — maks 5 MB</p>
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
                  <Label htmlFor="buttonText" className="text-xs font-bold text-primary-blue">Teks Tombol (Opsional)</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={e => setButtonText(e.target.value)}
                    placeholder="Contoh: Daftar Sekarang"
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="buttonLink" className="text-xs font-bold text-primary-blue">Link/Tujuan Tombol (Opsional)</Label>
                  <Input
                    id="buttonLink"
                    value={buttonLink}
                    onChange={e => setButtonLink(e.target.value)}
                    placeholder="Contoh: /ppdb atau #kontak"
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                  />
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

        {/* Banner Catalog */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Katalog Banner Hero</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">
                  {filteredBanners.length} banner aktif.
                </CardDescription>
              </div>

              <TableSearchFilter
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val)
                  setCurrentPage(1)
                }}
                placeholder="Cari teks tombol/link..."
              />
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center p-16 text-gray-400 text-xs">Memuat katalog banner...</div>
              ) : filteredBanners.length === 0 ? (
                <div className="text-center p-16 text-gray-400 text-xs">Tidak ada banner hero yang sesuai.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedBanners.map((item) => {
                    const cfg = parseBtnConfig(item.title)
                    return (
                      <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-video border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt="Banner Hero"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        {cfg.text && (
                          <span className="absolute top-2.5 left-2.5 bg-primary-green text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                            Tombol: {cfg.text}
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(item)}
                          className="absolute top-2.5 right-2.5 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all cursor-pointer opacity-90 hover:opacity-100"
                          title="Hapus banner"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 text-white text-[11px]">
                          <p className="font-mono text-gray-300 truncate">{cfg.link || 'Link default: /'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBanners.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[4, 8, 16]}
            />
          </Card>
        </div>

      </div>

    </div>
  )
}
