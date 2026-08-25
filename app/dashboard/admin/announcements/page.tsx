'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react'

export default function AdminAnnouncementsPage() {
  const [announcementsList, setAnnouncementsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [target, setTarget] = useState('Semua')
  const [published, setPublished] = useState(true)

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [targetFilter, setTargetFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('announcements_tk')
      .select('*')
      .order('id', { ascending: false })

    if (!error && data) {
      setAnnouncementsList(data)
    } else {
      setAnnouncementsList([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) { toast.error('Judul dan Konten wajib diisi.'); return }
    
    setSaving(true)
    const { data, error } = await supabase
      .from('announcements_tk')
      .insert({
        title,
        content,
        target,
        published
      })
      .select()
      .single()

    if (error) {
      toast.error('Gagal menambah pengumuman: ' + error.message)
    } else {
      setAnnouncementsList(prev => [data || { id: Date.now().toString(), title, content, target, published }, ...prev])
      setTitle('')
      setContent('')
      toast.success('Pengumuman berhasil diterbitkan!')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) return

    const { error } = await supabase
      .from('announcements_tk')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Gagal menghapus pengumuman: ' + error.message)
    } else {
      setAnnouncementsList(prev => prev.filter(item => item.id !== id))
    }
  }

  const togglePublished = async (id: string, currentPublished: boolean) => {
    const { error } = await supabase
      .from('announcements_tk')
      .update({ published: !currentPublished })
      .eq('id', id)

    if (error) {
      toast.error('Gagal mengubah status pengumuman: ' + error.message)
    } else {
      setAnnouncementsList(prev => prev.map(item => 
        item.id === id 
          ? { ...item, published: !currentPublished }
          : item
      ))
    }
  }

  const getTargetBadge = (targetRole: string) => {
    return <StatusBadge status={targetRole} size="sm" />
  }

  const filteredAnnouncements = useMemo(() => {
    return announcementsList.filter((item) => {
      const matchSearch =
        !searchQuery ||
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchTarget = targetFilter === 'all' || item.target === targetFilter
      return matchSearch && matchTarget
    })
  }, [announcementsList, searchQuery, targetFilter])

  const totalPages = Math.ceil(filteredAnnouncements.length / pageSize) || 1
  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAnnouncements.slice(start, start + pageSize)
  }, [filteredAnnouncements, currentPage, pageSize])

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-primary-blue">Kelola Pengumuman</h1>
        <p className="text-gray-500 font-semibold text-xs mt-1">Publikasikan informasi penting, surat edaran, atau agenda sekolah kepada guru dan orang tua.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Create */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-black text-primary-blue">Buat Pengumuman</CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Tulis informasi resmi baru.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-bold text-primary-blue">Judul Pengumuman</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Edaran Hari Libur"
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="target" className="text-xs font-bold text-primary-blue">Target Penerima</Label>
                  <select
                    id="target"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium outline-none"
                  >
                    <option value="Semua">Semua (Umum)</option>
                    <option value="Guru">Guru Pengajar</option>
                    <option value="Orang Tua">Orang Tua Murid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-xs font-bold text-primary-blue">Konten Pengumuman</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Tulis pesan pengumuman di sini..."
                    rows={4}
                    className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium resize-none"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={e => setPublished(e.target.checked)}
                    className="rounded text-primary-green focus:ring-primary-green w-4 h-4 cursor-pointer"
                  />
                  <Label htmlFor="published" className="text-xs font-bold text-gray-600 select-none cursor-pointer">
                    Langsung terbitkan sekarang
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer shadow-sm"
                >
                  {saving ? 'Menyimpan...' : 'Terbitkan'}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Pengumuman Terbit</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Daftar semua siaran pengumuman aktif ({filteredAnnouncements.length} siaran).</CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <TableSearchFilter
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val)
                    setCurrentPage(1)
                  }}
                  placeholder="Cari pengumuman..."
                />

                <Select
                  value={targetFilter}
                  onValueChange={(val) => {
                    if (val) {
                      setTargetFilter(val)
                      setCurrentPage(1)
                    }
                  }}
                >
                  <SelectTrigger className="h-9 w-32 bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                    <SelectValue placeholder="Semua Target" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Target</SelectItem>
                    <SelectItem value="Semua">Semua (Umum)</SelectItem>
                    <SelectItem value="Guru">Guru</SelectItem>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center p-8 text-gray-400 text-xs">Memuat daftar pengumuman...</div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="text-center p-8 text-gray-400 text-xs">Tidak ada pengumuman yang sesuai.</div>
              ) : (
                <div className="space-y-4">
                  {paginatedAnnouncements.map(item => (
                    <div key={item.id} className="p-5 bg-[#F8F6F2] rounded-2xl border border-gray-100 flex flex-col justify-between gap-3 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-primary-blue leading-snug">{item.title}</h4>
                            {getTargetBadge(item.target)}
                            <StatusBadge status={item.published ? 'published' : 'draft'} customLabel={item.published ? 'Published' : 'Draft'} size="sm" />
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => togglePublished(item.id, item.published)}
                            title={item.published ? "Ubah ke Draft" : "Terbitkan"}
                            className="text-gray-500 hover:text-primary-green p-1.5 rounded-lg hover:bg-white transition-all cursor-pointer"
                          >
                            {item.published ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Hapus"
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-55/10 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAnnouncements.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20]}
            />
          </Card>
        </div>

      </div>

    </div>
  )
}
