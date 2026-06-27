'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
      toast.error('Gagal memperbarui status: ' + error.message)
    } else {
      setAnnouncementsList(prev => prev.map(item => 
        item.id === id 
          ? { ...item, published: !currentPublished }
          : item
      ))
    }
  }

  const getTargetBadge = (target: string) => {
    switch (target) {
      case 'Semua': return <Badge className="bg-blue-100 text-blue-800 border-none font-bold">Semua</Badge>
      case 'Guru': return <Badge className="bg-purple-100 text-purple-800 border-none font-bold">Guru</Badge>
      case 'Orang Tua': return <Badge className="bg-amber-100 text-amber-800 border-none font-bold">Orang Tua</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800 border-none font-bold">{target}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Kelola Pengumuman</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Buat, terbitkan, dan hapus pengumuman internal sekolah.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Form */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader>
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <Plus size={18} className="text-primary-green" />
                Buat Pengumuman Baru
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Siarkan informasi penting ke lingkup civitas sekolah.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4 text-sm">
                
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
                    className="rounded text-primary-green focus:ring-primary-green w-4 h-4"
                  />
                  <Label htmlFor="published" className="text-xs font-bold text-gray-600 select-none cursor-pointer">
                    Langsung terbitkan sekarang
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-extrabold rounded-xl py-3 text-xs uppercase cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Terbitkan'}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue">Pengumuman Terbit</CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Daftar semua siaran pengumuman aktif.</CardDescription>
              </div>
              <Megaphone className="text-primary-green" />
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center p-8 text-gray-400 text-xs">Memuat daftar pengumuman...</div>
              ) : announcementsList.length === 0 ? (
                <div className="text-center p-8 text-gray-400 text-xs">Belum ada pengumuman terbit.</div>
              ) : (
                <div className="space-y-4">
                  {announcementsList.map(item => (
                    <div key={item.id} className="p-5 bg-[#F8F6F2] rounded-2xl border border-gray-100 flex flex-col justify-between gap-3 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-primary-blue leading-snug">{item.title}</h4>
                            {getTargetBadge(item.target)}
                            <Badge className={item.published ? "bg-emerald-50 text-emerald-600 border-none font-bold" : "bg-gray-200 text-gray-600 border-none font-bold"}>
                              {item.published ? 'Published' : 'Draft'}
                            </Badge>
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
          </Card>
        </div>

      </div>

    </div>
  )
}
