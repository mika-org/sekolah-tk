'use client'

import React, { useState, useEffect, useRef } from 'react'
import { uploadMaterial, deleteMaterial, getMaterialsList } from '@/actions/materials'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BookOpen, Upload, Trash2, RefreshCw, FileText } from 'lucide-react'

export default function GuruMaterialsPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Fetch classes
      const { data: classesData } = await supabase
        .from('classes_tk')
        .select('*')
        .order('nama')

      if (classesData) {
        setClasses(classesData)
        if (classesData.length > 0) setSelectedClass(classesData[0].id)
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
    if (!title || !selectedClass || !file) {
      toast.error('Judul, Kelas, dan File wajib diisi.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('classId', selectedClass)
      formData.append('file', file)

      const result = await uploadMaterial(formData)
      if (result.success) {
        toast.success('Materi berhasil diunggah!')
        setTitle('')
        setDescription('')
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        
        // Reload list
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

  const handleDelete = async (item: any) => {
    if (!confirm(`Hapus materi "${item.title}"?`)) return
    setDeletingId(item.id)
    const result = await deleteMaterial(item.id, item.file_url)
    if (result.success) {
      toast.success('Materi berhasil dihapus.')
      setMaterials(prev => prev.filter(m => m.id !== item.id))
    } else {
      toast.error(result.error || 'Gagal menghapus materi.')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Materi Belajar</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Unggah bahan ajar, rencana pembelajaran (RPP), dan tugas untuk wali murid.</p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-5">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <Upload size={20} className="text-primary-green" />
                Unggah Berkas Baru
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 font-semibold">Dokumen materi ajar format PDF, DOCX, atau Gambar.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-bold text-primary-blue">Judul Materi *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Modul Doa Harian & Pendek"
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="class" className="text-xs font-bold text-primary-blue">Untuk Kelas *</Label>
                  <select
                    id="class"
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none"
                    required
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nama} ({c.tahun_ajaran})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="desc" className="text-xs font-bold text-primary-blue">Keterangan / Deskripsi</Label>
                  <Input
                    id="desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Contoh: Rencana hafalan untuk semester ganjil."
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Pilih File Dokumen *</Label>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="bg-[#F8F6F2] border-transparent text-xs rounded-xl cursor-pointer py-3 h-auto"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer"
                >
                  {uploading ? 'Mengunggah...' : 'Unggah & Bagikan'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Uploaded Materials List */}
        <div className="lg:col-span-7">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Katalog Materi Ajar</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Berkas silabus dan materi ajar yang telah dibagikan.</CardDescription>
              </div>
              <BookOpen className="text-primary-green" />
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Memuat katalog...</div>
              ) : materials.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Belum ada materi belajar yang dibagikan.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {materials.map((m) => (
                    <div key={m.id} className="p-6 flex items-start justify-between gap-4 hover:bg-gray-55/10 transition-all">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 bg-primary-blue/10 text-primary-blue rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-primary-blue">{m.title}</span>
                            <Badge className="bg-primary-blue/10 text-primary-blue border-none font-bold text-[9px] rounded-full">
                              Kelas: {m.classes_tk?.nama || 'N/A'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-450 truncate font-semibold mt-0.5">{m.description || 'Tidak ada keterangan.'}</p>
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs text-primary-green hover:underline font-extrabold"
                          >
                            Download Berkas
                          </a>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDelete(m)}
                        disabled={deletingId === m.id}
                        variant="ghost"
                        className="text-red-500 hover:text-red-650 hover:bg-red-50 p-2 h-auto rounded-xl"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
