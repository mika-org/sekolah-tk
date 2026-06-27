'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  UserCheck
} from 'lucide-react'
import { toast } from 'sonner'

export default function MasterMuridPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  const initForm = { nama: '', nik: '', nisn: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'L', agama: 'Islam', alamat: '', kelas_id: '', status: 'active' }
  const [form, setForm] = useState(initForm)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch('/api/admin/data?table=students_tk_with_classes'),
        fetch('/api/admin/data?table=classes_tk')
      ])
      const [studentsResult, classesResult] = await Promise.all([studentsRes.json(), classesRes.json()])
      setStudents(studentsResult.data || [])
      setClasses(classesResult.data || [])
    } catch {
      setStudents([]); setClasses([])
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama) return
    setSaving(true)
    try {
      const payload: any = {
        nama: form.nama,
        nik: form.nik || null,
        nisn: form.nisn || null,
        tempat_lahir: form.tempat_lahir || null,
        tanggal_lahir: form.tanggal_lahir || null,
        jenis_kelamin: form.jenis_kelamin,
        agama: form.agama || null,
        alamat: form.alamat || null,
        kelas_id: form.kelas_id || null,
        status: form.status
      }
      const { error } = await supabase.from('students_tk').insert(payload)
      if (error) throw error
      setCreateOpen(false)
      setForm(initForm)
      loadData()
    } catch (err: any) { toast.error('Error: ' + err.message) }
    setSaving(false)
  }

  const openEdit = (s: any) => {
    setSelected(s)
    setForm({
      nama: s.nama, nik: s.nik || '', nisn: s.nisn || '', tempat_lahir: s.tempat_lahir || '',
      tanggal_lahir: s.tanggal_lahir || '', jenis_kelamin: s.jenis_kelamin || 'L',
      agama: s.agama || 'Islam', alamat: s.alamat || '', kelas_id: s.kelas_id || '', status: s.status || 'active'
    })
    setEditOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    try {
      const payload: any = {
        nama: form.nama, nik: form.nik || null, nisn: form.nisn || null, tempat_lahir: form.tempat_lahir || null,
        tanggal_lahir: form.tanggal_lahir || null, jenis_kelamin: form.jenis_kelamin, agama: form.agama || null,
        alamat: form.alamat || null, kelas_id: form.kelas_id || null, status: form.status
      }
      const { error } = await supabase.from('students_tk').update(payload).eq('id', selected.id)
      if (error) throw error
      setEditOpen(false)
      loadData()
    } catch (err: any) { toast.error('Error: ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase.from('students_tk').delete().eq('id', selected.id)
    if (!error) { setDeleteOpen(false); loadData() }
    else toast.error('Gagal menghapus: ' + error.message)
    setSaving(false)
  }

  const filtered = students.filter(s => s.nama?.toLowerCase().includes(search.toLowerCase()) || s.nisn?.includes(search) || s.nik?.includes(search))

  const FormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">Nama Lengkap *</Label>
          <Input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama murid" required className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">NISN</Label>
          <Input value={form.nisn} onChange={e => setForm(f => ({ ...f, nisn: e.target.value }))} placeholder="10 digit NISN" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">NIK</Label>
          <Input value={form.nik} onChange={e => setForm(f => ({ ...f, nik: e.target.value }))} placeholder="16 digit NIK" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">Tempat Lahir</Label>
          <Input value={form.tempat_lahir} onChange={e => setForm(f => ({ ...f, tempat_lahir: e.target.value }))} placeholder="Kota lahir" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">Tanggal Lahir</Label>
          <Input type="date" value={form.tanggal_lahir} onChange={e => setForm(f => ({ ...f, tanggal_lahir: e.target.value }))} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">Jenis Kelamin</Label>
          <select value={form.jenis_kelamin} onChange={e => setForm(f => ({ ...f, jenis_kelamin: e.target.value }))} className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none h-10">
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">Agama</Label>
          <select value={form.agama} onChange={e => setForm(f => ({ ...f, agama: e.target.value }))} className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none h-10">
            {['Islam', 'Kristen', 'Katholik', 'Hindu', 'Buddha', 'Konghucu'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">Kelas</Label>
          <select value={form.kelas_id} onChange={e => setForm(f => ({ ...f, kelas_id: e.target.value }))} className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
            <option value="">— Pilih Kelas —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nama} ({c.tahun_ajaran})</option>)}
          </select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-bold text-primary-blue">Alamat</Label>
          <Input value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Alamat lengkap" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
        </div>
        {isEdit && (
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-bold text-primary-blue">Status</Label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif / Alumni</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Master Murid</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Kelola data seluruh siswa KB & TK Istiqamah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button onClick={() => { setForm(initForm); setCreateOpen(true) }}
            className="bg-primary-blue hover:bg-primary-blue/90 text-white font-bold rounded-xl text-xs cursor-pointer gap-2">
            <Plus size={14} /> Tambah Murid
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center"><Users size={24} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Murid</div>
              <div className="text-2xl font-black text-primary-blue">{students.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center"><UserCheck size={24} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Murid Aktif</div>
              <div className="text-2xl font-black text-primary-blue">{students.filter(s => s.status === 'active').length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Laki-laki / Perempuan</div>
              <div className="text-xl font-black text-primary-blue">
                {students.filter(s => s.jenis_kelamin === 'L').length} / {students.filter(s => s.jenis_kelamin === 'P').length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-black text-primary-blue">Daftar Murid</CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Seluruh murid yang terdaftar di sistem. ({filtered.length} ditampilkan)</CardDescription>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, NISN, NIK..."
                className="pl-8 bg-[#F8F6F2] border-transparent focus:border-primary-green rounded-xl text-xs font-medium h-9 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data murid...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">{search ? 'Murid tidak ditemukan.' : 'Belum ada murid terdaftar.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Nama Murid</th>
                    <th className="p-4">NISN</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">L/P</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${s.jenis_kelamin === 'P' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                            {s.nama?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-primary-blue">{s.nama}</div>
                            {s.tempat_lahir && <div className="text-[10px] text-gray-400 font-semibold">{s.tempat_lahir}{s.tanggal_lahir ? `, ${new Date(s.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-600 font-bold">{s.nisn || <span className="text-gray-300">—</span>}</td>
                      <td className="p-4">
                        {s.classes_tk ? (
                          <Badge className="bg-primary-blue/10 text-primary-blue border-none font-bold rounded-full px-2 py-0.5 text-[10px]">
                            {s.classes_tk.nama}
                          </Badge>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="p-4">
                        <Badge className={`border-none font-bold rounded-full px-2 py-0.5 text-[10px] ${s.jenis_kelamin === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {s.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={`border-none font-bold rounded-full px-2 py-0.5 text-[10px] ${s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                          {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="p-4 pr-8 text-right space-x-2">
                        <Button onClick={() => openEdit(s)} variant="outline"
                          className="border-gray-200 text-primary-blue hover:bg-primary-blue/5 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer gap-1.5">
                          <Edit size={12} /> Edit
                        </Button>
                        <Button onClick={() => { setSelected(s); setDeleteOpen(true) }} variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer gap-1.5">
                          <Trash2 size={12} /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[32px] max-w-lg bg-white p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 mb-2">
            <div className="w-10 h-10 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center"><Plus size={20} /></div>
            <DialogTitle className="text-lg font-black text-primary-blue">Tambah Murid Baru</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">Isi data lengkap calon siswa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormFields />
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                {saving ? 'Menyimpan...' : 'Tambah Murid'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[32px] max-w-lg bg-white p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 mb-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center"><Edit size={20} /></div>
            <DialogTitle className="text-lg font-black text-primary-blue">Edit: {selected?.nama}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">Perbarui data murid ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <FormFields isEdit />
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
          <DialogTitle className="text-base font-black text-primary-blue">Hapus Murid?</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 font-semibold leading-relaxed">
            Data murid <span className="font-bold text-primary-blue">{selected?.nama}</span> akan dihapus permanen. Data absensi dan nilai yang terhubung juga akan ikut terhapus.
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
