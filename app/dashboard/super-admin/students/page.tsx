'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { getStudentFullDetail } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import {
  CHILD_FORM_SECTIONS,
  FATHER_FORM_SECTIONS,
  MOTHER_FORM_SECTIONS,
  HEALTH_FORM_SECTIONS,
  type PPDBFieldDefinition,
  type PPDBFormSection,
} from '@/lib/ppdb/form-definition'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  UserCheck,
  AlertTriangle,
  Eye,
  MessageCircle,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'

const DOCUMENT_LABELS: Record<string, string> = {
  kk: 'Kartu Keluarga',
  akta: 'Akta Kelahiran',
  foto_anak: 'Foto Anak',
  ktp_ortu: 'KTP Orang Tua',
  ktp_ayah: 'KTP Ayah',
  ktp_ibu: 'KTP Ibu',
  surat_mutasi: 'Surat Mutasi',
  surat_lulus_kb: 'Surat Keterangan Lulus KB/Daycare',
  bukti_pembayaran: 'Bukti Pembayaran',
}

function documentLabel(type: string) {
  const normalized = type.toLocaleLowerCase('id-ID')
  return DOCUMENT_LABELS[normalized] || type
}

function displaySnapshotValue(value: unknown, field: PPDBFieldDefinition) {
  if (value === null || value === undefined || value === '') return 'Belum diisi'
  const text = String(value)
  if (field.type === 'date') {
    const date = new Date(`${text.slice(0, 10)}T00:00:00`)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  }
  return field.options?.find((option) => option.value === text)?.label || text
}

function SnapshotGroup({
  title,
  sections,
  data,
  defaultOpen = false,
}: {
  title: string
  sections: PPDBFormSection[]
  data: Record<string, unknown> | null | undefined
  defaultOpen?: boolean
}) {
  const snapshot = data && typeof data === 'object' ? data : {}
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-gray-100 bg-[#F8F6F2]">
      <summary className="cursor-pointer list-none px-5 py-4 text-xs font-extrabold uppercase tracking-wider text-primary-blue">
        <span className="flex items-center justify-between gap-3">
          {title}
          <span className="text-[10px] text-gray-400 group-open:hidden">Buka detail</span>
          <span className="hidden text-[10px] text-gray-400 group-open:inline">Tutup detail</span>
        </span>
      </summary>
      <div className="space-y-6 border-t border-gray-100 bg-white px-5 py-5">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-primary-green">{section.title}</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {section.fields.map((field) => {
                const value = snapshot[field.name]
                const empty = value === null || value === undefined || value === ''
                return (
                  <div key={field.name} className={cn('rounded-xl border border-gray-100 bg-gray-50 p-3', field.span === 2 && 'sm:col-span-2')}>
                    <div className="text-[9px] font-extrabold uppercase tracking-wide text-gray-400">{field.label}</div>
                    <div className={cn('mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-primary-blue', empty && 'italic text-gray-400')}>
                      {displaySnapshotValue(value, field)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </details>
  )
}

export default function MasterMuridPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  // Search, Filter & Pagination
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  // Detail Siswa Dialog State
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailData, setDetailData] = useState<any>(null)

  const initForm = { nama: '', nik: '', nisn: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'L', agama: 'Islam', alamat: '', kelas_id: '', status: 'active' }
  const [form, setForm] = useState(initForm)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch('/api/admin/data?table=students_tk_with_classes'),
        fetch('/api/admin/data?table=classes_tk')
      ])
      const [studentsResult, classesResult] = await Promise.all([studentsRes.json(), classesRes.json()])
      if (!studentsRes.ok || studentsResult.error) throw new Error(studentsResult.error || 'Gagal memuat data murid')
      if (!classesRes.ok || classesResult.error) throw new Error(classesResult.error || 'Gagal memuat data kelas')
      setStudents(studentsResult.data || [])
      setClasses(classesResult.data || [])
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data murid')
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

  const handleOpenDetail = async (s: any) => {
    setSelected(s)
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailData(null)
    try {
      const res = await getStudentFullDetail(s.id)
      if (res.success) {
        setDetailData(res)
      } else {
        setDetailData({
          student: s,
          parent: s.parents_tk?.[0] || null,
          ppdb: null,
          documents: [],
          payment: null,
        })
        if (res.error) toast.error(res.error)
      }
    } catch {
      setDetailData({
        student: s,
        parent: s.parents_tk?.[0] || null,
        ppdb: null,
        documents: [],
        payment: null,
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleWhatsApp = (phone?: string | null, studentName?: string, parentName?: string) => {
    if (!phone) {
      toast.error('Nomor WhatsApp orang tua belum terdaftar.')
      return
    }
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) clean = '62' + clean.slice(1)
    else if (!clean.startsWith('62')) clean = '62' + clean
    const greeting = parentName ? `Bapak/Ibu ${parentName}` : 'Bapak/Ibu'
    const text = `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. ${greeting} (Orang Tua/Wali dari ananda *${studentName || 'Murid'}*),\n\nKami dari KB & TK Istiqamah menginformasikan terkait perkembangan ananda di sekolah.\n\nTerima kasih.\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank')
  }

  const calculateAge = (dateStr?: string | null) => {
    if (!dateStr) return ''
    const birth = new Date(dateStr)
    if (Number.isNaN(birth.getTime())) return ''
    const now = new Date()
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    if (months < 0) {
      years--
      months += 12
    }
    return `${years} thn ${months > 0 ? `${months} bln` : ''}`
  }

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

  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        !search ||
        (s.nama || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.nisn || '').includes(search) ||
        (s.nik || '').includes(search)
      const matchClass = classFilter === 'all' || s.kelas_id === classFilter
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchSearch && matchClass && matchStatus
    })
  }, [students, search, classFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

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
            className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer gap-2 shadow-sm">
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
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Daftar Murid</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Seluruh murid yang terdaftar di sistem ({filtered.length} murid).</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <TableSearchFilter
              value={search}
              onChange={(val) => {
                setSearch(val)
                setCurrentPage(1)
              }}
              placeholder="Cari nama, NISN, NIK..."
            />

            <Select
              value={classFilter}
              onValueChange={(val) => {
                if (val) {
                  setClassFilter(val)
                  setCurrentPage(1)
                }
              }}
            >
              <SelectTrigger className="h-9 w-36 bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) {
                  setStatusFilter(val)
                  setCurrentPage(1)
                }
              }}
            >
              <SelectTrigger className="h-9 w-32 bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data murid...</div>
          ) : error ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="text-sm font-bold text-gray-800">Gagal Memuat Data Murid</div>
              <div className="text-xs text-rose-600 max-w-md mx-auto">{error}</div>
              <Button onClick={loadData} variant="outline" className="border-gray-200 text-xs font-bold rounded-xl mt-2 cursor-pointer gap-1.5">
                <RefreshCw size={14} /> Coba Lagi
              </Button>
            </div>
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
                  {paginatedStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(s)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${s.jenis_kelamin === 'P' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}
                          >
                            {s.nama?.charAt(0).toUpperCase()}
                          </button>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(s)}
                              className="font-bold text-primary-blue text-left hover:underline cursor-pointer"
                            >
                              {s.nama}
                            </button>
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
                        <StatusBadge status={s.status === 'active' ? 'active' : 'inactive'} customLabel={s.status === 'active' ? 'Aktif' : 'Nonaktif'} />
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleOpenDetail(s)}
                            variant="outline"
                            className="h-8 border-primary-blue/20 text-primary-blue hover:bg-primary-blue/5 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye size={12} /> Detail
                          </Button>
                          <Button
                            onClick={() => openEdit(s)}
                            variant="outline"
                            className="h-8 border-gray-200 text-primary-blue hover:bg-primary-blue/5 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit size={12} /> Edit
                          </Button>
                          <Button
                            onClick={() => { setSelected(s); setDeleteOpen(true) }}
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
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
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

      {/* DETAIL SISWA DIALOG (DENGAN RINGKASAN DI PALING ATAS SEPERTI FORM PPDB) */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-4xl bg-white p-6 sm:p-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0",
                (detailData?.student?.jenis_kelamin || selected?.jenis_kelamin) === 'P' ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"
              )}>
                {(detailData?.student?.nama || selected?.nama)?.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-primary-blue">
                  {detailData?.student?.nama || selected?.nama}
                </DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-400 mt-0.5">
                  Profil lengkap murid, informasi orang tua, dan dokumen pendaftaran.
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {detailData?.student?.classes_tk ? (
                <Badge className="bg-primary-blue/10 text-primary-blue border-none font-bold rounded-full px-3 py-1 text-xs">
                  Kelas {detailData.student.classes_tk.nama} ({detailData.student.classes_tk.tahun_ajaran})
                </Badge>
              ) : selected?.classes_tk ? (
                <Badge className="bg-primary-blue/10 text-primary-blue border-none font-bold rounded-full px-3 py-1 text-xs">
                  Kelas {selected.classes_tk.nama}
                </Badge>
              ) : null}
              <StatusBadge
                status={(detailData?.student?.status || selected?.status) === 'active' ? 'active' : 'inactive'}
                customLabel={(detailData?.student?.status || selected?.status) === 'active' ? 'Siswa Aktif' : 'Nonaktif'}
              />
            </div>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-20 text-center text-gray-400 font-bold text-sm">
              Memuat data lengkap murid dan orang tua...
            </div>
          ) : !detailData ? (
            <div className="py-20 text-center text-rose-500 font-bold text-sm">
              Gagal memuat data murid.
            </div>
          ) : (
            <div className="space-y-8 pt-4">
              {/* DIPALING ATAS: RINGKASAN PERSIS SEPERTI FORM/MODAL PPDB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. DATA CALON/MURID AKTIF */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green flex items-center gap-1.5">
                    <UserCheck size={14} /> 1. Data Calon / Murid Aktif
                  </h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3 border border-gray-100 text-xs">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Nama Lengkap:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{detailData.student?.nama}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Tempat/Tgl Lahir:</span>
                      <span className="col-span-2 font-bold text-primary-blue">
                        {detailData.student?.tempat_lahir || '-'}, {detailData.student?.tanggal_lahir ? new Date(detailData.student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        {detailData.student?.tanggal_lahir && (
                          <span className="ml-2 text-[10px] text-gray-400 font-medium">
                            ({calculateAge(detailData.student.tanggal_lahir)})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Jenis Kelamin:</span>
                      <span className="col-span-2 font-bold text-primary-blue">
                        {detailData.student?.jenis_kelamin === 'P' ? '👧 Perempuan' : '👦 Laki-laki'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Agama:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{detailData.student?.agama || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">NIK Siswa:</span>
                      <span className="col-span-2 font-bold text-primary-blue font-mono">{detailData.student?.nik || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">NISN Siswa:</span>
                      <span className="col-span-2 font-bold text-primary-blue font-mono">{detailData.student?.nisn || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Rombel / Kelas:</span>
                      <span className="col-span-2 font-bold text-primary-green">
                        {detailData.student?.classes_tk ? `${detailData.student.classes_tk.nama} (${detailData.student.classes_tk.tahun_ajaran})` : 'Belum ditentukan'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Keluarga:</span>
                      <span className="col-span-2 font-bold text-primary-blue">
                        {detailData.ppdb?.child_details?.anak_ke
                          ? `Anak Ke-${detailData.ppdb.child_details.anak_ke} dari ${detailData.ppdb.child_details.jml_saudara || '0'} bersaudara`
                          : '-'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 font-semibold">Alamat:</span>
                      <span className="col-span-2 font-semibold text-primary-blue leading-relaxed">
                        {detailData.student?.alamat || detailData.parent?.alamat || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. DATA ORANG TUA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green flex items-center gap-1.5">
                    <Users size={14} /> 2. Data Orang Tua
                  </h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-4 border border-gray-100 text-xs">
                    {/* AYAH */}
                    <div className="space-y-2 pb-3 border-b border-gray-200/60">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">👨 Identitas Ayah Kandung</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Nama Ayah:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{detailData.parent?.nama_ayah || detailData.ppdb?.father_details?.nama_ayah || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Pekerjaan:</span>
                        <span className="col-span-2 font-bold text-primary-blue">
                          {detailData.parent?.pekerjaan?.split('/')?.[0]?.trim() || detailData.ppdb?.father_details?.pekerjaan_ayah || '-'}
                        </span>
                      </div>
                    </div>

                    {/* IBU */}
                    <div className="space-y-2">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">👩 Identitas Ibu Kandung</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Nama Ibu:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{detailData.parent?.nama_ibu || detailData.ppdb?.mother_details?.nama_ibu || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Pekerjaan:</span>
                        <span className="col-span-2 font-bold text-primary-blue">
                          {detailData.parent?.pekerjaan?.split('/')?.[1]?.trim() || detailData.ppdb?.mother_details?.pekerjaan_ibu || '-'}
                        </span>
                      </div>
                    </div>

                    {/* KONTAK & ALAMAT */}
                    <div className="space-y-2 pt-3 border-t border-gray-200/60">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">📞 Kontak & Alamat</div>
                      <div className="grid grid-cols-3 gap-1 items-center">
                        <span className="text-gray-400 font-semibold">No. HP / WA:</span>
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="font-bold text-primary-blue font-mono">
                            {detailData.parent?.hp || detailData.ppdb?.father_details?.hp_ayah || '-'}
                          </span>
                          {(detailData.parent?.hp || detailData.ppdb?.father_details?.hp_ayah) && (
                            <button
                              type="button"
                              onClick={() => handleWhatsApp(
                                detailData.parent?.hp || detailData.ppdb?.father_details?.hp_ayah,
                                detailData.student?.nama,
                                detailData.parent?.nama_ayah || detailData.parent?.nama_ibu
                              )}
                              className="px-2 py-0.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] rounded-md font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <MessageCircle size={10} /> Chat WA
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Email:</span>
                        <span className="col-span-2 font-bold text-primary-blue">
                          {detailData.parent?.email || detailData.ppdb?.father_details?.email_ayah || '-'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Alamat Ortu:</span>
                        <span className="col-span-2 font-semibold text-primary-blue leading-relaxed">
                          {detailData.parent?.alamat || detailData.ppdb?.father_details?.alamat_ayah || '-'}
                        </span>
                      </div>

                      {/* AKUN PORTAL ORANG TUA */}
                      {detailData.user && (
                        <div className="pt-3 mt-1 border-t border-gray-200/80 space-y-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                          <div className="font-extrabold text-primary-green flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5"><KeyRound size={13} /> Akun Portal Orang Tua</span>
                            <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-bold">Aktif</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 items-center">
                            <span className="text-gray-500 font-semibold">Username:</span>
                            <div className="col-span-2 flex items-center gap-1.5 font-mono font-bold text-primary-blue">
                              <span>@{detailData.user.username}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(detailData.user.username)
                                  toast.success(`Username @${detailData.user.username} disalin!`)
                                }}
                                className="text-gray-400 hover:text-primary-green p-0.5 cursor-pointer transition-colors"
                                title="Salin username"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 items-center">
                            <span className="text-gray-500 font-semibold">Password Awal:</span>
                            <div className="col-span-2 flex items-center gap-1.5 font-mono font-bold text-primary-green">
                              <span>{detailData.user.initial_password || '—'}</span>
                              {detailData.user.initial_password && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(detailData.user.initial_password)
                                    toast.success('Password awal disalin!')
                                  }}
                                  className="text-gray-400 hover:text-primary-green p-0.5 cursor-pointer transition-colors"
                                  title="Salin password awal"
                                >
                                  <Copy size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. DOKUMEN LAMPIRAN (JIKA ADA DARI PPDB) */}
                {detailData.documents && detailData.documents.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green flex items-center gap-1.5">
                      <FileText size={14} /> 3. Dokumen Lampiran PPDB
                    </h3>
                    <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-2.5 border border-gray-100 text-xs">
                      {detailData.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#07A363]/30 transition-all">
                          <div>
                            <div className="font-bold text-primary-blue">{documentLabel(doc.type)}</div>
                            <div className="text-[10px] text-gray-400 font-medium">Dokumen PPDB</div>
                          </div>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-[#07265F]/5 hover:bg-[#07265F]/10 text-primary-blue font-extrabold rounded-lg text-[10px] transition-colors"
                          >
                            Lihat Berkas
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. INFORMASI PEMBAYARAN PPDB (JIKA ADA) */}
                {detailData.payment && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> 4. Riwayat Pembayaran PPDB
                    </h3>
                    <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3 border border-gray-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-semibold">Metode Pembayaran:</span>
                        <Badge className="bg-blue-50 text-blue-700 border-none font-bold rounded-full">{detailData.payment.method}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-semibold">Jumlah Biaya:</span>
                        <span className="font-bold text-primary-blue">Rp {parseFloat(String(detailData.payment.amount)).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-semibold">Status Pembayaran:</span>
                        <Badge className={cn(
                          "border-none font-bold rounded-full",
                          detailData.payment.status === 'Verified' ? "bg-emerald-100 text-emerald-800" :
                          detailData.payment.status === 'Rejected' ? "bg-rose-100 text-rose-800" :
                          "bg-amber-100 text-amber-800"
                        )}>
                          {detailData.payment.status === 'Verified' ? 'Diverifikasi' : 
                           detailData.payment.status === 'Rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                        </Badge>
                      </div>
                      {detailData.payment.proof && (
                        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                          <span className="text-gray-400 font-semibold">Bukti Transfer:</span>
                          <a
                            href={detailData.payment.proof}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-[#07A363]/10 hover:bg-[#07A363]/25 text-[#07A363] font-extrabold rounded-lg text-[10px] transition-all"
                          >
                            Lihat Bukti Transfer
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FORMULIR PENDAFTARAN LENGKAP (SNAPSHOT ACCORDION JIKA TERHUBUNG PPDB) */}
              {detailData.ppdb && (
                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div>
                    <h3 className="text-sm font-black text-primary-blue flex items-center gap-2">
                      <Sparkles size={16} className="text-primary-green" />
                      Formulir Pendaftaran Lengkap (SPMB)
                    </h3>
                    <p className="mt-1 text-[11px] font-medium text-gray-400">
                      Snapshot jawaban lengkap dan data kesehatan yang dikirim orang tua/wali saat pendaftaran.
                    </p>
                  </div>
                  <SnapshotGroup title="A. Keterangan Anak" sections={CHILD_FORM_SECTIONS} data={detailData.ppdb.child_details} defaultOpen />
                  <SnapshotGroup title="B. Identitas Ayah" sections={FATHER_FORM_SECTIONS} data={detailData.ppdb.father_details} />
                  <SnapshotGroup title="B. Identitas Ibu" sections={MOTHER_FORM_SECTIONS} data={detailData.ppdb.mother_details} />
                  <SnapshotGroup title="C. Perkembangan dan Kesehatan Anak" sections={HEALTH_FORM_SECTIONS} data={detailData.ppdb.development_health} />
                </div>
              )}
            </div>
          )}

          {/* DIALOG FOOTER */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end items-center">
            {(detailData?.parent?.hp || detailData?.ppdb?.father_details?.hp_ayah) && (
              <Button
                onClick={() => handleWhatsApp(
                  detailData?.parent?.hp || detailData?.ppdb?.father_details?.hp_ayah,
                  detailData?.student?.nama,
                  detailData?.parent?.nama_ayah || detailData?.parent?.nama_ibu
                )}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer gap-1.5"
              >
                <MessageCircle size={15} /> Kirim WhatsApp
              </Button>
            )}
            <Button
              onClick={() => {
                const stud = detailData?.student || selected
                setDetailOpen(false)
                if (stud) openEdit(stud)
              }}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer gap-1.5"
            >
              <Edit size={14} /> Edit Data Murid
            </Button>
            <Button
              onClick={() => setDetailOpen(false)}
              variant="outline"
              className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs py-2.5 px-5 cursor-pointer"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
