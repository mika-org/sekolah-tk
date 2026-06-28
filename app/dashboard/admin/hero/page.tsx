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
    if (!confirm('Apakah Anda yakin ingin menghapus banner hero ini?')) return

    const result = await deleteHeroBanner(item.id, item.image)

    if (result.error) {
      toast.error('Gagal menghapus: ' + result.error)
    } else {
      setBannerList(prev => prev.filter(g => g.id !== item.id))
      toast.success('Banner hero berhasil dihapus!')
    }
  }

  const prevSlide = () => setCurrentSlide(i => (i - 1 + bannerList.length) % bannerList.length)
  const nextSlide = () => setCurrentSlide(i => (i + 1) % bannerList.length)

  // Parse button config safely from title
  const getButtonConfig = (title: string) => {
    try {
      const parsed = JSON.parse(title)
      return {
        text: parsed.buttonText || '',
        link: parsed.buttonLink || ''
      }
    } catch (e) {
      return {
        text: title || '',
        link: ''
      }
    }
  }

  const activeBanner = bannerList[currentSlide]
  const activeBtnConfig = activeBanner ? getButtonConfig(activeBanner.title) : { text: '', link: '' }

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Kelola Banner Hero</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Unggah dan kelola gambar banner slider untuk section beranda (hero) website.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Upload Form */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
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
                  className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer gap-2"
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
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Katalog Banner</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">
                  {bannerList.length} banner aktif · gunakan panah untuk menelusuri
                </CardDescription>
              </div>
              <Layers className="text-primary-green" />
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {loading ? (
                <div className="text-center p-16 text-gray-400 text-xs">Memuat katalog banner...</div>
              ) : bannerList.length === 0 ? (
                <div className="text-center p-16 text-gray-400 text-xs">Belum ada banner hero. Silakan unggah banner pertama!</div>
              ) : (
                <div className="space-y-4">
                  {/* Main Slider Preview */}
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={activeBanner?.id}
                      src={activeBanner?.image}
                      alt="Banner Hero Preview"
                      className="w-full h-full object-cover transition-all duration-300"
                    />

                    {/* Button overlay preview if configured */}
                    {activeBtnConfig.text && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
                        <span className="px-5 py-2 bg-primary-green text-white font-extrabold text-[10px] sm:text-xs uppercase rounded-full tracking-wider shadow-md">
                          {activeBtnConfig.text}
                        </span>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(activeBanner)}
                      className="absolute top-3 right-3 bg-red-500/90 hover:bg-red-600 text-white p-2 rounded-xl transition-all cursor-pointer z-10 shadow"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Nav Arrows */}
                    {bannerList.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-primary-blue p-2 rounded-xl shadow transition-all cursor-pointer z-10"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-primary-blue p-2 rounded-xl shadow transition-all cursor-pointer z-10"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                    {/* Counter */}
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {currentSlide + 1} / {bannerList.length}
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="bg-[#F8F6F2] rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-semibold">Teks Tombol:</span>
                      <span className="font-bold text-primary-blue">{activeBtnConfig.text || 'Tidak Ada Tombol'}</span>
                    </div>
                    {activeBtnConfig.text && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-semibold">Link Tombol:</span>
                        <span className="font-bold text-primary-green flex items-center gap-1 font-mono">
                          {activeBtnConfig.link || '/ (Default)'}
                          <ExternalLink size={10} />
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                      <span className="text-gray-400 font-semibold">Diunggah Pada:</span>
                      <span className="font-bold text-gray-500">
                        {new Date(activeBanner.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {bannerList.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentSlide(idx)}
                        className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          idx === currentSlide ? 'border-primary-green' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt="thumbnail" className="w-full h-full object-cover" />
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
