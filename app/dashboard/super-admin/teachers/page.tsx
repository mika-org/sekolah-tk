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
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  MapPin,
  UserCheck
} from 'lucide-react'
import { toast } from 'sonner'

export default function MasterGuruPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [guruUsers, setGuruUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)

  const [form, setForm] = useState({ nama: '', nip: '', hp: '', alamat: '', user_id: '' })

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    try {
      const [teachersRes, usersRes] = await Promise.all([
        fetch('/api/admin/data?table=teachers_tk_with_users'),
        fetch('/api/admin/data?table=users_tk')
      ])
      const [teachersResult, usersResult] = await Promise.all([teachersRes.json(), usersRes.json()])
      setTeachers(teachersResult.data || [])
      setGuruUsers((usersResult.data || []).filter((u: any) => u.role === 'guru'))
    } catch {
      setTeachers([]); setGuruUsers([])
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => setForm({ nama: '', nip: '', hp: '', alamat: '', user_id: '' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama) return
    setSaving(true)
    try {
      const payload: any = { nama: form.nama, nip: form.nip || null, hp: form.hp || null, alamat: form.alamat || null }
      if (form.user_id) payload.user_id = form.user_id
      const { error } = await supabase.from('teachers_tk').insert(payload)
      if (error) throw error
      setCreateOpen(false)
      resetForm()
      loadData()
    } catch (err: any) { toast.error('Error: ' + err.message) }
    setSaving(false)
  }

  const openEdit = (t: any) => {
    setSelectedTeacher(t)
    setForm({ nama: t.nama, nip: t.nip || '', hp: t.hp || '', alamat: t.alamat || '', user_id: t.user_id || '' })
    setEditOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeacher) return
    setSaving(true)
    try {
      const payload: any = { nama: form.nama, nip: form.nip || null, hp: form.hp || null, alamat: form.alamat || null, user_id: form.user_id || null }
      const { error } = await supabase.from('teachers_tk').update(payload).eq('id', selectedTeacher.id)
      if (error) throw error
      setEditOpen(false)
      loadData()
    } catch (err: any) { toast.error('Error: ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!selectedTeacher) return
    setSaving(true)
    const { error } = await supabase.from('teachers_tk').delete().eq('id', selectedTeacher.id)
    if (!error) { setDeleteOpen(false); loadData() }
    else toast.error('Gagal menghapus: ' + error.message)
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Master Guru</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Kelola data seluruh guru pengajar KB & TK Istiqamah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button onClick={() => { resetForm(); setCreateOpen(true) }}
            className="bg-primary-blue hover:bg-primary-blue/90 text-white font-bold rounded-xl text-xs cursor-pointer gap-2">
            <Plus size={14} /> Tambah Guru
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Guru</div>
              <div className="text-2xl font-black text-primary-blue">{teachers.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Terhubung Portal</div>
              <div className="text-2xl font-black text-primary-blue">{teachers.filter(t => t.user_id).length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Belum Terhubung</div>
              <div className="text-2xl font-black text-amber-600">{teachers.filter(t => !t.user_id).length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Daftar Guru Pengajar</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Seluruh guru yang terdaftar di sistem.</CardDescription>
          </div>
          <GraduationCap className="text-primary-green" />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data guru...</div>
          ) : teachers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada data guru. Klik "Tambah Guru" untuk mulai.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Nama Guru</th>
                    <th className="p-4">NIP</th>
                    <th className="p-4">No. HP</th>
                    <th className="p-4">Akun Portal</th>
                    <th className="p-4 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teachers.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-green/10 text-primary-green flex items-center justify-center font-black text-sm flex-shrink-0">
                            {t.nama?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-primary-blue">{t.nama}</div>
                            {t.alamat && <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-1"><MapPin size={10} />{t.alamat.substring(0, 35)}{t.alamat.length > 35 ? '...' : ''}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-600 font-bold">{t.nip || <span className="text-gray-300">—</span>}</td>
                      <td className="p-4">
                        {t.hp ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <Phone size={12} className="text-primary-green" />{t.hp}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="p-4">
                        {t.users_tk ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold rounded-full px-2 py-0.5 text-[10px]">
                            @{t.users_tk.username}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 border-none font-bold rounded-full px-2 py-0.5 text-[10px]">Belum terhubung</Badge>
                        )}
                      </td>
                      <td className="p-4 pr-8 text-right space-x-2">
                        <Button onClick={() => openEdit(t)} variant="outline"
                          className="border-gray-200 text-primary-blue hover:bg-primary-blue/5 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer gap-1.5">
                          <Edit size={12} /> Edit
                        </Button>
                        <Button onClick={() => { setSelectedTeacher(t); setDeleteOpen(true) }} variant="outline"
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
        <DialogContent className="rounded-[32px] max-w-md bg-white p-8">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center"><Plus size={20} /></div>
            <DialogTitle className="text-lg font-black text-primary-blue">Tambah Guru Baru</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">Isi data guru pengajar baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            {[
              { label: 'Nama Lengkap *', key: 'nama', placeholder: 'Contoh: Budi Santoso, S.Pd', required: true },
              { label: 'NIP', key: 'nip', placeholder: 'Nomor Induk Pegawai (opsional)' },
              { label: 'No. HP / WhatsApp', key: 'hp', placeholder: '08xxxxxxxxxx' },
              { label: 'Alamat', key: 'alamat', placeholder: 'Alamat lengkap guru' },
            ].map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">{field.label}</Label>
                <Input value={form[field.key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder} required={field.required}
                  className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Hubungkan ke Akun Portal <span className="text-gray-400 font-medium">(opsional)</span></Label>
              <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                <option value="">— Tidak dihubungkan —</option>
                {guruUsers.map(u => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
              </select>
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                {saving ? 'Menyimpan...' : 'Tambah Guru'}
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
            <DialogTitle className="text-lg font-black text-primary-blue">Edit: {selectedTeacher?.nama}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">Perbarui data guru ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            {[
              { label: 'Nama Lengkap *', key: 'nama', placeholder: 'Nama guru', required: true },
              { label: 'NIP', key: 'nip', placeholder: 'Nomor Induk Pegawai' },
              { label: 'No. HP / WhatsApp', key: 'hp', placeholder: '08xxxxxxxxxx' },
              { label: 'Alamat', key: 'alamat', placeholder: 'Alamat lengkap guru' },
            ].map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">{field.label}</Label>
                <Input value={form[field.key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder} required={field.required}
                  className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Akun Portal</Label>
              <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                <option value="">— Tidak dihubungkan —</option>
                {guruUsers.map(u => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
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
          <DialogTitle className="text-base font-black text-primary-blue">Hapus Guru?</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 font-semibold leading-relaxed">
            Data guru <span className="font-bold text-primary-blue">{selectedTeacher?.nama}</span> akan dihapus permanen dari sistem.
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
