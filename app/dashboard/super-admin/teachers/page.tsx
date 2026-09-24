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
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  MapPin,
  UserCheck,
  AlertTriangle,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

export default function MasterGuruPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [guruUsers, setGuruUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)

  const [form, setForm] = useState({ nama: '', nip: '', hp: '', alamat: '', user_id: '' })
  const [autoCreateAccount, setAutoCreateAccount] = useState(true)
  const [customUsername, setCustomUsername] = useState('')
  const [customPassword, setCustomPassword] = useState('Istiqamah2026!')

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [teachersRes, usersRes] = await Promise.all([
        fetch('/api/admin/data?table=teachers_tk_with_users'),
        fetch('/api/admin/data?table=users_tk')
      ])
      const [teachersResult, usersResult] = await Promise.all([teachersRes.json(), usersRes.json()])
      if (!teachersRes.ok || teachersResult.error) throw new Error(teachersResult.error || 'Gagal memuat data guru')
      if (!usersRes.ok || usersResult.error) throw new Error(usersResult.error || 'Gagal memuat data user')
      setTeachers(teachersResult.data || [])
      setGuruUsers((usersResult.data || []).filter((u: any) => u.role === 'guru'))
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data')
      setTeachers([]); setGuruUsers([])
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => {
    setForm({ nama: '', nip: '', hp: '', alamat: '', user_id: '' })
    setAutoCreateAccount(true)
    setCustomUsername('')
    setCustomPassword('Istiqamah2026!')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nama.trim()) {
      toast.error('Nama lengkap guru wajib diisi')
      return
    }
    setSaving(true)
    try {
      let createdUserId = form.user_id || null

      if (autoCreateAccount && !createdUserId) {
        // Generate clean username and email based on teacher's name
        const rawBase = (customUsername.trim() || form.nama)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 12) || 'guru'
        const randomSuffix = Math.floor(100 + Math.random() * 900)
        const finalUsername = customUsername.trim() || `guru_${rawBase}${randomSuffix}`
        const finalEmail = `${rawBase}${randomSuffix}@guru.istiqamah.sch.id`
        const passwordToUse = customPassword.trim() || 'Istiqamah2026!'

        const userRes = await fetch('/api/admin/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: finalUsername,
            email: finalEmail,
            password: passwordToUse,
            role: 'guru',
          }),
        })
        const userJson = await userRes.json()
        if (!userRes.ok || userJson.error) {
          throw new Error(userJson.error || 'Gagal membuat akun guru otomatis')
        }
        createdUserId = userJson.id
      }

      const payload: any = {
        nama: form.nama.trim(),
        nip: form.nip?.trim() || null,
        hp: form.hp?.trim() || null,
        alamat: form.alamat?.trim() || null,
      }
      if (createdUserId) payload.user_id = createdUserId

      const { error } = await supabase.from('teachers_tk').insert(payload)
      if (error) throw error

      toast.success(
        autoCreateAccount && !form.user_id
          ? 'Guru & akun portal berhasil dibuat! Password awal: Istiqamah2026!'
          : 'Data guru berhasil ditambahkan!'
      )
      setCreateOpen(false)
      resetForm()
      loadData()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
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

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        !searchQuery ||
        (t.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.nip || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.hp || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })
  }, [teachers, searchQuery])

  const totalPages = Math.ceil(filteredTeachers.length / pageSize) || 1
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTeachers.slice(start, start + pageSize)
  }, [filteredTeachers, currentPage, pageSize])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Master Guru</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Kelola data seluruh dewan guru dan tenaga pendidik KB & TK Istiqamah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button
            onClick={() => { resetForm(); setCreateOpen(true) }}
            className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer gap-2 shadow-sm"
          >
            <Plus size={14} /> Tambah Guru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Daftar Guru Pengajar</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Seluruh guru yang terdaftar di sistem ({filteredTeachers.length} guru).</CardDescription>
          </div>
          <TableSearchFilter
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder="Cari nama guru, NIP, no HP..."
          />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data guru...</div>
          ) : error ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="text-sm font-bold text-gray-800">Gagal Memuat Data Guru</div>
              <div className="text-xs text-rose-600 max-w-md mx-auto">{error}</div>
              <Button onClick={loadData} variant="outline" className="border-gray-200 text-xs font-bold rounded-xl mt-2 cursor-pointer gap-1.5">
                <RefreshCw size={14} /> Coba Lagi
              </Button>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada data guru yang sesuai.</div>
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
                  {paginatedTeachers.map(t => (
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
                          <div className="space-y-1.5">
                            <StatusBadge status="active" customLabel={`@${t.users_tk.username}`} size="sm" />
                            {t.users_tk.initial_password && (
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-600 bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded border border-gray-200/80 w-fit transition-colors">
                                <span className="text-gray-400 font-sans text-[10px]">Pass:</span>
                                <span className="font-bold text-primary-blue">{t.users_tk.initial_password}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(t.users_tk.initial_password)
                                    toast.success(`Password awal @${t.users_tk.username} disalin!`)
                                  }}
                                  className="text-gray-400 hover:text-primary-green transition-colors cursor-pointer ml-0.5"
                                  title="Salin password awal"
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <StatusBadge status="neutral" customLabel="Belum terhubung" size="sm" />
                        )}
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => openEdit(t)}
                            variant="outline"
                            className="h-8 border-gray-200 text-primary-blue hover:bg-primary-blue/5 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit size={12} /> Edit
                          </Button>
                          <Button
                            onClick={() => { setSelectedTeacher(t); setDeleteOpen(true) }}
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
            totalItems={filteredTeachers.length}
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
            {/* Auto Create Account Section */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoCreateAccount"
                  checked={autoCreateAccount}
                  onChange={(e) => setAutoCreateAccount(e.target.checked)}
                  className="w-4 h-4 accent-primary-green cursor-pointer"
                />
                <Label htmlFor="autoCreateAccount" className="text-xs font-bold text-primary-blue cursor-pointer">
                  Otomatis Buatkan Akun Portal Guru
                </Label>
              </div>

              {autoCreateAccount ? (
                <div className="text-[11px] text-emerald-800 space-y-1 pl-6 pt-0.5">
                  <p>• Password awal: <span className="font-mono font-bold text-primary-blue">Istiqamah2026!</span></p>
                  <p>• Role: <span className="font-bold">Guru Pengajar</span></p>
                  <p className="text-[10px] text-gray-500">
                    Akun akan otomatis terhubung ke guru ini dan password dapat langsung disalin di tabel.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 pl-6 pt-1">
                  <Label className="text-xs font-bold text-primary-blue">
                    Pilih Akun Guru yang Sudah Ada <span className="text-gray-400 font-medium">(opsional)</span>
                  </Label>
                  <select
                    value={form.user_id}
                    onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none"
                  >
                    <option value="">— Tidak dihubungkan —</option>
                    {guruUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
