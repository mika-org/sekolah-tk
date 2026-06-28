'use client'

import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    if (!confirm('Apakah Anda yakin ingin menghapus foto galeri ini?')) return

    const result = await deleteGalleryPhoto(item.id, item.image)

    if (result.error) {
      toast.error('Gagal menghapus galeri: ' + result.error)
    } else {
      setGalleryList(prev => prev.filter(g => g.id !== item.id))
    }
  }

  const prevSlide = () => setCurrentSlide(i => (i - 1 + galleryList.length) % galleryList.length)
  const nextSlide = () => setCurrentSlide(i => (i + 1) % galleryList.length)

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Kelola Galeri</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Unggah foto kegiatan, sarana prasarana, dan prestasi sekolah ke portal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Upload Form */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader>
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <Plus size={18} className="text-primary-green" />
                Tambah Foto Baru
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">
                Upload langsung ke bucket penyimpanan sekolah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4 text-sm">

                {/* Image Picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">File Foto</Label>
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
                        <p className="text-xs font-semibold">Klik untuk pilih foto</p>
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
                  <Label htmlFor="title" className="text-xs font-bold text-primary-blue">Judul Foto</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Kunjungan Edukatif Damkar"
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
                    <option value="Kegiatan">Kegiatan Belajar / Acara</option>
                    <option value="Sarana">Sarana &amp; Prasarana</option>
                    <option value="Prestasi">Prestasi &amp; Penghargaan</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !imageFile}
                  className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer gap-2"
                >
                  <Upload size={14} />
                  {uploading ? 'Mengunggah...' : 'Upload & Simpan'}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Slider */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Katalog Foto</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">
                  {galleryList.length} foto tersimpan · gunakan panah untuk menelusuri
                </CardDescription>
              </div>
              <Camera className="text-primary-green" />
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {loading ? (
                <div className="text-center p-16 text-gray-400 text-xs">Memuat katalog galeri...</div>
              ) : galleryList.length === 0 ? (
                <div className="text-center p-16 text-gray-400 text-xs">Belum ada foto galeri. Tambahkan foto pertama!</div>
              ) : (
                <div className="space-y-4">
                  {/* Main Slider */}
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={galleryList[currentSlide]?.id}
                      src={galleryList[currentSlide]?.image}
                      alt={galleryList[currentSlide]?.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    {/* Category badge */}
                    <span className="absolute top-3 left-3 bg-primary-blue/90 text-white text-[9px] uppercase font-bold px-2.5 py-1 rounded-full">
                      {galleryList[currentSlide]?.category}
                    </span>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(galleryList[currentSlide])}
                      className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* Nav Arrows */}
                    {galleryList.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-blue p-2 rounded-xl shadow transition-all cursor-pointer"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary-blue p-2 rounded-xl shadow transition-all cursor-pointer"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                    {/* Counter */}
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {currentSlide + 1} / {galleryList.length}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex items-center justify-between px-1">
                    <h4 className="font-black text-sm text-primary-blue">{galleryList[currentSlide]?.title}</h4>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {galleryList.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentSlide(idx)}
                        className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          idx === currentSlide ? 'border-primary-green' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
