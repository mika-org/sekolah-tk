'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  UserCog,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

const ROLES = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Administrator' },
  { value: 'guru', label: 'Guru Pengajar' },
  { value: 'orang_tua', label: 'Orang Tua' },
]

const STATUS_OPTIONS = ['active', 'inactive']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Create form
  const [createOpen, setCreateOpen] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('admin')

  // Edit form
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [editRole, setEditRole] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editPassword, setEditPassword] = useState('')

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users/list')
      const result = await res.json()
      if (res.ok) setUsers(result.users || [])
      else setUsers([])
    } catch {
      setUsers([])
    }
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  // ─── CREATE ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername || !newEmail || !newPassword) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, email: newEmail, password: newPassword, role: newRole })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal membuat user')

      setCreateOpen(false)
      setNewUsername(''); setNewEmail(''); setNewPassword(''); setNewRole('admin')
      loadUsers()
      toast.success(`User "${newUsername}" berhasil dibuat!`)
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ─── EDIT ──────────────────────────────────────────────────────────────────
  const openEdit = (user: any) => {
    setEditUser(user)
    setEditRole(user.role)
    setEditStatus(user.status)
    setEditPassword('')
    setEditOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setSaving(true)

    try {
      const res = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editUser.id,
          role: editRole,
          status: editStatus,
          password: editPassword || null
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal memperbarui user')

      setEditOpen(false)
      loadUsers()
      toast.success(`User "${editUser.username}" berhasil diperbarui!`)
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────
  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal menghapus user')

      setDeleteOpen(false)
      setDeleteId(null)
      loadUsers()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      guru: 'bg-amber-100 text-amber-800',
      orang_tua: 'bg-emerald-100 text-emerald-800',
    }
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Administrator',
      guru: 'Guru',
      orang_tua: 'Orang Tua',
    }
    return (
      <Badge className={`${map[role] || 'bg-gray-100 text-gray-700'} border-none font-bold rounded-full px-3 py-1`}>
        {labels[role] || role}
      </Badge>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Manajemen User</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Kelola akun pengguna portal KB & TK Istiqamah berdasarkan perannya.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadUsers} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-primary-blue hover:bg-primary-blue/90 text-white font-bold rounded-xl text-xs cursor-pointer gap-2"
          >
            <Plus size={14} /> Tambah User Baru
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Daftar Pengguna</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">
              {users.length} akun pengguna terdaftar di sistem.
            </CardDescription>
          </div>
          <UserCog className="text-primary-green" />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Memuat daftar user...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">Belum ada pengguna terdaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Username</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Dibuat</th>
                    <th className="p-4 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-primary-blue flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-black text-xs">
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                          {u.username}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-semibold text-xs">{u.email}</td>
                      <td className="p-4">{getRoleBadge(u.role)}</td>
                      <td className="p-4">
                        <Badge className={u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border-none font-bold rounded-full'
                          : 'bg-rose-100 text-rose-800 border-none font-bold rounded-full'
                        }>
                          {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs text-gray-400 font-semibold">
                        {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 pr-8 text-right space-x-2">
                        <Button
                          onClick={() => openEdit(u)}
                          variant="outline"
                          className="border-gray-200 text-primary-blue hover:bg-primary-blue/5 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer gap-1.5"
                        >
                          <Edit size={12} /> Edit
                        </Button>
                        {u.role !== 'super_admin' && (
                          <Button
                            onClick={() => confirmDelete(u.id)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer gap-1.5"
                          >
                            <Trash2 size={12} /> Hapus
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── CREATE DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[32px] max-w-md bg-white p-8">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center">
              <Plus size={20} />
            </div>
            <DialogTitle className="text-lg font-black text-primary-blue">Tambah User Baru</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">
              Buat akun portal baru dan tentukan perannya di sistem.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Username</Label>
              <Input value={newUsername} onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/\s/g,''))}
                placeholder="contoh: budi.santoso" required
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Email</Label>
              <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                placeholder="user@sekolah.id" required
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Password Awal</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 8 karakter" required minLength={8}
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Role / Peran</Label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}
                className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
              <Button type="submit" disabled={saving}
                className="flex-1 bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                {saving ? 'Menyimpan...' : 'Buat User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT DIALOG ───────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-[32px] max-w-md bg-white p-8">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
              <Edit size={20} />
            </div>
            <DialogTitle className="text-lg font-black text-primary-blue">Edit User: {editUser?.username}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">
              Ubah role, status aktif, atau reset password user ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Role / Peran</Label>
              <select value={editRole} onChange={e => setEditRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Status Akun</Label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'active' ? 'Aktif' : 'Nonaktif'}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Reset Password <span className="text-gray-400 font-medium">(kosongkan jika tidak diubah)</span></Label>
              <Input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)}
                placeholder="Password baru (min. 8 karakter)" minLength={editPassword ? 8 : 0}
                className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}
                className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
              <Button type="submit" disabled={saving}
                className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRM DIALOG ─────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-[32px] max-w-sm bg-white p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={22} />
          </div>
          <DialogTitle className="text-base font-black text-primary-blue">Hapus User?</DialogTitle>
          <DialogDescription className="text-xs text-gray-500 font-semibold leading-relaxed">
            Tindakan ini akan menghapus akun secara permanen dari sistem auth dan database. Data yang sudah ada tetap tersimpan.
          </DialogDescription>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}
              className="flex-1 rounded-xl font-bold text-xs border-gray-200 cursor-pointer">Batal</Button>
            <Button onClick={handleDelete} disabled={saving}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer">
              {saving ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
