'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  GraduationCap,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

export default function MasterKelasPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const [form, setForm] = useState({ nama: '', guru_id: '', tahun_ajaran: '2026/2027' })

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const [classesRes, teachersRes] = await Promise.all([
        fetch('/api/admin/data?table=classes_tk_with_teachers'),
        fetch('/api/admin/data?table=teachers_tk')
      ])
      const [classesResult, teachersResult] = await Promise.all([classesRes.json(), teachersRes.json()])
      setClasses(classesResult.data || [])
      setTeachers(teachersResult.data || [])
    } catch {
      setClasses([]); setTeachers([])
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => setForm({ nama: '', guru_id: '', tahun_ajaran: '2026/2027' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama || !form.tahun_ajaran) return
    setSaving(true)
    try {
      const payload: any = { nama: form.nama, tahun_ajaran: form.tahun_ajaran }
      if (form.guru_id) payload.guru_id = form.guru_id
      const { error } = await supabase.from('classes_tk').insert(payload)
      if (error) throw error
      setCreateOpen(false)
      resetForm()
      loadData()
    } catch (err: any) { toast.error('Error: ' + err.message) }
    setSaving(false)
  }

  const openEdit = (c: any) => {
    setSelected(c)
    setForm({ nama: c.nama, guru_id: c.guru_id || '', tahun_ajaran: c.tahun_ajaran })
    setEditOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    try {
      const payload: any = { nama: form.nama, tahun_ajaran: form.tahun_ajaran, guru_id: form.guru_id || null }
      const { error } = await supabase.from('classes_tk').update(payload).eq('id', selected.id)
      if (error) throw error
      setEditOpen(false)
      loadData()
    } catch (err: any) { toast.error('Error: ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase.from('classes_tk').delete().eq('id', selected.id)
    if (!error) { setDeleteOpen(false); loadData() }
    else toast.error('Gagal menghapus: ' + error.message)
    setSaving(false)
  }

  const TAHUN_OPTIONS = [
    '2024/2025',
    '2025/2026',
    '2026/2027',
    '2027/2028',
    '2028/2029',
    '2029/2030',
    '2030/2031'
  ]

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch =
        !searchQuery ||
        (c.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.teachers_tk?.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.tahun_ajaran || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })
  }, [classes, searchQuery])

  const totalPages = Math.ceil(filteredClasses.length / pageSize) || 1
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredClasses.slice(start, start + pageSize)
  }, [filteredClasses, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Master Kelas</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Kelola rombongan belajar dan wali kelas KB & TK Istiqamah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setCreateOpen(true) }}
            className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer gap-2 shadow-sm">
            <Plus size={14} /> Tambah Kelas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center"><Layers size={24} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Kelas</div>
              <div className="text-2xl font-black text-primary-blue">{classes.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center"><GraduationCap size={24} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Ada Wali Kelas</div>
              <div className="text-2xl font-black text-primary-blue">{classes.filter(c => c.guru_id).length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center"><Calendar size={24} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Tahun Ajaran Aktif</div>
              <div className="text-sm font-black text-primary-blue mt-1">2026/2027</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Daftar Kelas</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Seluruh rombel yang terdaftar di sistem ({filteredClasses.length} kelas).</CardDescription>
          </div>

          <TableSearchFilter
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder="Cari nama kelas, wali kelas..."
          />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data kelas...</div>
          ) : filteredClasses.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada data kelas yang sesuai.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Nama Kelas</th>
                    <th className="p-4">Wali Kelas</th>
                    <th className="p-4">Tahun Ajaran</th>
                    <th className="p-4 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedClasses.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-black text-sm flex-shrink-0">
                            <Layers size={16} />
                          </div>
                          <div className="font-bold text-primary-blue">{c.nama}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        {c.teachers_tk ? (
                          <StatusBadge status="guru" customLabel={c.teachers_tk.nama} size="sm" />
                        ) : (
                          <StatusBadge status="neutral" customLabel="Belum ada wali kelas" size="sm" />
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-gray-600">
                        {c.tahun_ajaran}
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => openEdit(c)}
                            variant="outline"
                            className="h-8 border-gray-200 text-primary-blue hover:bg-primary-blue/5 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit size={12} /> Edit
                          </Button>
                          <Button
                            onClick={() => { setSelected(c); setDeleteOpen(true) }}
                            variant="outline"
                            className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClasses.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[32px] max-w-md bg-white p-8">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center"><Plus size={20} /></div>
            <DialogTitle className="text-lg font-black text-primary-blue">Tambah Kelas Baru</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">Buat rombongan belajar baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Nama Kelas *</Label>
              <Input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                placeholder="Contoh: TK A, TK B, Kelompok Bermain" required
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Tahun Ajaran *</Label>
              <select value={form.tahun_ajaran} onChange={e => setForm(f => ({ ...f, tahun_ajaran: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Wali Kelas <span className="text-gray-400 font-medium">(opsional)</span></Label>
              <select value={form.guru_id} onChange={e => setForm(f => ({ ...f, guru_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                <option value="">— Pilih wali kelas —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                {saving ? 'Menyimpan...' : 'Buat Kelas'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[32px] max-w-md bg-white p-8">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center"><Edit size={20} /></div>
            <DialogTitle className="text-lg font-black text-primary-blue">Edit Kelas: {selected?.nama}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">Perbarui informasi kelas ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Nama Kelas *</Label>
              <Input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} required
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Tahun Ajaran</Label>
              <select value={form.tahun_ajaran} onChange={e => setForm(f => ({ ...f, tahun_ajaran: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Wali Kelas</Label>
              <select value={form.guru_id} onChange={e => setForm(f => ({ ...f, guru_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                <option value="">— Tidak ada wali kelas —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-[32px] max-w-sm bg-white p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto"><Trash2 size={22} /></div>
          <DialogTitle className="text-base font-black text-primary-blue">Hapus Kelas?</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 font-semibold leading-relaxed">
            Kelas <span className="font-bold text-primary-blue">{selected?.nama}</span> akan dihapus. Data murid yang terhubung akan kehilangan referensi kelas.
          </DialogDescription>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
            <Button onClick={handleDelete} disabled={saving} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer">
              {saving ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
