'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Quote
} from 'lucide-react'
import { uploadTestimonialPhoto, saveTestimonial, toggleTestimonialPublished, deleteTestimonial } from '@/actions/admin'

export default function AdminTestimonialsPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [job, setJob] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => { loadData() }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !job || !content) { toast.error('Semua field wajib diisi.'); return }

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

      setList(prev => [result.data, ...prev])
      setName(''); setJob(''); setContent(''); setPublished(true)
      setPhotoFile(null); setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Testimoni berhasil ditambahkan!')
    } catch (err: any) {
      toast.error('Gagal: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    const result = await toggleTestimonialPublished(id, !current)
    if (result.error) { toast.error('Gagal: ' + result.error); return }
    setList(prev => prev.map(t => t.id === id ? { ...t, published: !current } : t))
  }

  const handleDelete = async (item: any) => {
    if (!confirm('Hapus testimoni ini?')) return
    const result = await deleteTestimonial(item.id, item.photo)
    if (result.error) { toast.error('Gagal: ' + result.error); return }
    setList(prev => prev.filter(t => t.id !== item.id))
    toast.success('Testimoni dihapus')
  }

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchSearch =
        !searchQuery ||
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.job || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })
  }, [list, searchQuery])

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-primary-blue">Kelola Testimoni</h1>
        <p className="text-gray-500 font-semibold text-xs mt-1">
          Kelola ulasan dan pengalaman dari orang tua murid untuk ditampilkan di halaman depan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Tambah Testimoni */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none sticky top-6">
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
                  <Label className="text-xs font-bold text-primary-blue">Foto Orang Tua / Profil</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-28 border-2 border-dashed border-gray-200 hover:border-primary-green/60 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-[#F8F6F2]"
                  >
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 space-y-1">
                        <ImagePlus size={22} className="mx-auto" />
                        <p className="text-[10px] font-semibold">Klik untuk pilih foto</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Nama Lengkap</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Budi Santoso" required
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Pekerjaan / Keterangan</Label>
                  <Input value={job} onChange={e => setJob(e.target.value)} placeholder="Orang Tua Murid Kelas A" required
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Isi Testimoni</Label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Sekolah ini luar biasa, anak saya sangat senang..."
                    required
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="published" checked={published} onChange={e => setPublished(e.target.checked)}
                    className="w-4 h-4 accent-primary-green cursor-pointer" />
                  <Label htmlFor="published" className="text-xs font-bold text-primary-blue cursor-pointer">Langsung Tampilkan</Label>
                </div>

                <Button type="submit" disabled={saving}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer gap-2 shadow-sm">
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
                  {filteredList.length} testimoni · {list.filter(t => t.published).length} ditayangkan
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
                  {paginatedList.map(item => (
                    <div key={item.id} className="p-5 flex gap-4 items-start hover:bg-gray-50/50 transition-colors">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {item.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.photo} alt={item.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-100" />
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
                            <StatusBadge status={item.published ? 'published' : 'draft'} customLabel={item.published ? 'Ditayangkan' : 'Tersembunyi'} size="sm" />
                          </div>
                        </div>
                        <div className="mt-2 flex items-start gap-1.5">
                          <Quote size={10} className="text-primary-green flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">{item.content}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex flex-col gap-1.5">
                        <button
                          onClick={() => handleToggle(item.id, item.published)}
                          title={item.published ? 'Sembunyikan' : 'Tampilkan'}
                          className={`p-2 rounded-lg transition-all cursor-pointer ${item.published
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          {item.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
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
    </div>
  )
}
