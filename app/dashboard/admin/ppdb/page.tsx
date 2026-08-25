'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/client'
import { approvePPDB, resendCredentialsEmail, updatePPDB, type UpdatePPDBPayload } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { StatusBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import {
  CHILD_FORM_SECTIONS,
  FATHER_FORM_SECTIONS,
  HEALTH_FORM_SECTIONS,
  MOTHER_FORM_SECTIONS,
  type PPDBFieldDefinition,
  type PPDBFormSection,
} from '@/lib/ppdb/form-definition'
import {
  TrendingUp,
  KeyRound,
  Mail,
  AlertCircle,
  MessageCircle,
  Send,
  Phone,
  UserCheck,
  RefreshCw,
  Sparkles,
  Edit3,
  Save,
  Pencil,
  User,
  HeartHandshake,
  CreditCard,
  School,
} from 'lucide-react'

type SnapshotRecord = Record<string, unknown>

interface PPDBApplication {
  id: string
  student_name: string
  birth_date: string
  status: string
  payment_status: string
  created_at: string
  child_details?: SnapshotRecord | null
  father_details?: SnapshotRecord | null
  mother_details?: SnapshotRecord | null
  development_health?: SnapshotRecord | null
}

interface GeneratedCredentials {
  studentName?: string
  username?: string
  password?: string
}

interface RegistrationDocument {
  id: string
  type: string
  file_url: string
}

interface RegistrationPayment {
  method: string
  amount: string | number
  status: string
  proof?: string | null
}

interface StudentDetails {
  id: string
  nama?: string | null
  tempat_lahir?: string | null
  tanggal_lahir?: string | null
  jenis_kelamin?: string | null
  agama?: string | null
  nik?: string | null
  nisn?: string | null
  alamat?: string | null
  anak_ke?: string | number | null
  jml_saudara?: string | number | null
}

interface ParentDetails {
  nama_ayah?: string | null
  nama_ibu?: string | null
  hp?: string | null
  email?: string | null
  alamat?: string | null
  pekerjaan?: string | null
}

interface SelectedRegistrationDetails {
  docs: RegistrationDocument[]
  payment: RegistrationPayment | null
  student: StudentDetails | null
  parent: ParentDetails | null
}

export type WaTemplateType = 'observasi' | 'ukur_seragam' | 'ambil_seragam' | 'custom'

export function getWaTemplateText(
  type: WaTemplateType,
  app: PPDBApplication | null,
  recipientType: 'ayah' | 'ibu'
): string {
  if (!app) return ''
  const father = (app.father_details as Record<string, any>) || {}
  const mother = (app.mother_details as Record<string, any>) || {}
  const parentName = recipientType === 'ayah' ? (father.nama_ayah || 'Bapak') : (mother.nama_ibu || 'Ibu')
  const studentName = app.student_name

  if (type === 'observasi') {
    return `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. ${recipientType === 'ayah' ? 'Bapak' : 'Ibu'} ${parentName} (Orang Tua/Wali dari ananda *${studentName}*),\n\nKami dari Panitia PPDB KB & TK Istiqamah Bandung menginformasikan bahwa ananda dijadwalkan untuk mengikuti kegiatan *Observasi Anak & Wawancara Orang Tua* pada:\n\n📅 *Hari/Tanggal* : [Tentukan Tanggal]\n⏰ *Waktu*        : 08.30 - 10.30 WIB\n📍 *Tempat*       : Kampus TK Istiqamah Bandung (Jl. Taman Citarum, Bandung Wetan)\n\nMohon hadir tepat waktu dan membawa kelengkapan berkas fisik yang diperlukan.\n\nTerima kasih.\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\n_Panitia PPDB TK Istiqamah Bandung_`
  }

  if (type === 'ukur_seragam') {
    return `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. ${recipientType === 'ayah' ? 'Bapak' : 'Ibu'} ${parentName} (Orang Tua/Wali dari ananda *${studentName}*),\n\nSehubungan dengan kelulusan pendaftaran PPDB ananda di KB & TK Istiqamah Bandung, kami mengundang Bapak/Ibu untuk hadir dalam sesi *Pengukuran Seragam Sekolah* ananda pada:\n\n📅 *Hari/Tanggal* : [Tentukan Tanggal]\n⏰ *Waktu*        : 08.00 - 14.00 WIB\n📍 *Tempat*       : Ruang Koperasi / TU TK Istiqamah Bandung\n\nMohon membawa ananda agar ukuran seragam sesuai dan nyaman saat dikenakan.\n\nTerima kasih.\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\n_Panitia PPDB TK Istiqamah Bandung_`
  }

  if (type === 'ambil_seragam') {
    return `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. ${recipientType === 'ayah' ? 'Bapak' : 'Ibu'} ${parentName} (Orang Tua/Wali dari ananda *${studentName}*),\n\nKami menginformasikan bahwa paket seragam sekolah dan atribut ananda *${studentName}* telah siap untuk diambil pada:\n\n📅 *Hari/Tanggal* : [Tentukan Tanggal / Setiap Hari Kerja]\n⏰ *Waktu*        : Senin - Jumat, 08.00 - 14.00 WIB\n📍 *Tempat*       : Kantor Tata Usaha TK Istiqamah Bandung\n\nMohon menunjukkan bukti pendaftaran / konfirmasi registrasi saat pengambilan seragam.\n\nTerima kasih.\nWassalamu'alaikum Warahmatullahi Wabarakatuh.\n_Tata Usaha TK Istiqamah Bandung_`
  }

  return `Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nYth. ${recipientType === 'ayah' ? 'Bapak' : 'Ibu'} ${parentName} (Orang Tua/Wali dari ananda *${studentName}*),\n\n`
}

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

const supabase = createClient()

export default function AdminPPDBPage() {
  const [ppdbList, setPpdbList] = useState<PPDBApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<PPDBApplication | null>(null)
  
  // Credentials modal state
  const [credsModalOpen, setCredsModalOpen] = useState(false)
  const [generatedCreds, setGeneratedCreds] = useState<GeneratedCredentials | null>(null)
  const [actionPendingId, setActionPendingId] = useState<string | null>(null)

  // Edit PPDB Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<PPDBApplication | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    student_name: '',
    birth_date: '',
    nik: '',
    nisn: '',
    tempat_lahir: '',
    jenis_kelamin: 'L',
    agama: 'Islam',
    alamat: '',
    anak_ke: '1',
    jml_saudara: '0',
    // Ayah
    nama_ayah: '',
    nik_ayah: '',
    pekerjaan_ayah: '',
    pendidikan_ayah: '',
    penghasilan_ayah: '',
    hp_ayah: '',
    email_ayah: '',
    alamat_ayah: '',
    // Ibu
    nama_ibu: '',
    nik_ibu: '',
    pekerjaan_ibu: '',
    pendidikan_ibu: '',
    penghasilan_ibu: '',
    hp_ibu: '',
    email_ibu: '',
    alamat_ibu: '',
    // Status
    status: 'Submitted',
    payment_status: 'Pending',
  })

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Details modal state
  const [selectedDetails, setSelectedDetails] = useState<SelectedRegistrationDetails | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // WhatsApp modal state
  const [waModalOpen, setWaModalOpen] = useState(false)
  const [waApp, setWaApp] = useState<PPDBApplication | null>(null)
  const [waRecipientType, setWaRecipientType] = useState<'ayah' | 'ibu'>('ayah')
  const [waTemplateType, setWaTemplateType] = useState<WaTemplateType>('observasi')
  const [waMessageText, setWaMessageText] = useState('')

  // Custom confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {})

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ppdb_tk')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPpdbList(data)
    } else {
      setPpdbList([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    if (detailsModalOpen || confirmOpen || credsModalOpen || waModalOpen || editModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [detailsModalOpen, confirmOpen, credsModalOpen, waModalOpen, editModalOpen])

  const handleOpenEdit = (app: PPDBApplication) => {
    const child = (app.child_details as Record<string, any>) || {}
    const father = (app.father_details as Record<string, any>) || {}
    const mother = (app.mother_details as Record<string, any>) || {}

    setEditingApp(app)
    setEditForm({
      student_name: app.student_name || '',
      birth_date: app.birth_date ? app.birth_date.slice(0, 10) : '',
      nik: child.nik || '',
      nisn: child.nisn || '',
      tempat_lahir: child.tempat_lahir || '',
      jenis_kelamin: child.jenis_kelamin === 'P' || child.jenis_kelamin === 'Perempuan' ? 'P' : 'L',
      agama: child.agama || 'Islam',
      alamat: child.alamat || '',
      anak_ke: String(child.anak_ke ?? '1'),
      jml_saudara: String(child.jml_saudara ?? '0'),
      // Ayah
      nama_ayah: father.nama_ayah || '',
      nik_ayah: father.nik_ayah || '',
      pekerjaan_ayah: father.pekerjaan_ayah || '',
      pendidikan_ayah: father.pendidikan_ayah || '',
      penghasilan_ayah: father.penghasilan_ayah || '',
      hp_ayah: father.hp_ayah || '',
      email_ayah: father.email_ayah || '',
      alamat_ayah: father.alamat_ayah || '',
      // Ibu
      nama_ibu: mother.nama_ibu || '',
      nik_ibu: mother.nik_ibu || '',
      pekerjaan_ibu: mother.pekerjaan_ibu || '',
      pendidikan_ibu: mother.pendidikan_ibu || '',
      penghasilan_ibu: mother.penghasilan_ibu || '',
      hp_ibu: mother.hp_ibu || '',
      email_ibu: mother.email_ibu || '',
      alamat_ibu: mother.alamat_ibu || '',
      // Status
      status: app.status || 'Submitted',
      payment_status: app.payment_status || 'Pending',
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingApp) return
    if (!editForm.student_name.trim()) {
      toast.error('Nama siswa tidak boleh kosong.')
      return
    }

    setSavingEdit(true)
    const child_details = {
      ...((editingApp.child_details as Record<string, any>) || {}),
      nama_lengkap: editForm.student_name.trim(),
      nik: editForm.nik.slice(0, 16).trim(),
      nisn: editForm.nisn.slice(0, 10).trim(),
      tempat_lahir: editForm.tempat_lahir.trim(),
      birth_date: editForm.birth_date,
      tanggal_lahir: editForm.birth_date,
      jenis_kelamin: editForm.jenis_kelamin,
      agama: editForm.agama,
      alamat: editForm.alamat.trim(),
      anak_ke: editForm.anak_ke,
      jml_saudara: editForm.jml_saudara,
    }

    const father_details = {
      ...((editingApp.father_details as Record<string, any>) || {}),
      nama_ayah: editForm.nama_ayah.trim(),
      nik_ayah: editForm.nik_ayah.trim(),
      pekerjaan_ayah: editForm.pekerjaan_ayah.trim(),
      pendidikan_ayah: editForm.pendidikan_ayah,
      penghasilan_ayah: editForm.penghasilan_ayah,
      hp_ayah: editForm.hp_ayah.trim(),
      email_ayah: editForm.email_ayah.trim(),
      alamat_ayah: editForm.alamat_ayah.trim(),
    }

    const mother_details = {
      ...((editingApp.mother_details as Record<string, any>) || {}),
      nama_ibu: editForm.nama_ibu.trim(),
      nik_ibu: editForm.nik_ibu.trim(),
      pekerjaan_ibu: editForm.pekerjaan_ibu.trim(),
      pendidikan_ibu: editForm.pendidikan_ibu,
      penghasilan_ibu: editForm.penghasilan_ibu,
      hp_ibu: editForm.hp_ibu.trim(),
      email_ibu: editForm.email_ibu.trim(),
      alamat_ibu: editForm.alamat_ibu.trim(),
    }

    const result = await updatePPDB(editingApp.id, {
      student_name: editForm.student_name.trim(),
      birth_date: editForm.birth_date,
      status: editForm.status,
      payment_status: editForm.payment_status,
      child_details,
      father_details,
      mother_details,
      development_health: (editingApp.development_health as Record<string, any>) || {},
    })

    setSavingEdit(false)
    if (result.success) {
      toast.success('Data pendaftaran PPDB berhasil diperbarui!')
      setEditModalOpen(false)
      await loadData()
    } else {
      toast.error(result.error || 'Gagal memperbarui data PPDB.')
    }
  }

  const openWaModal = (app: PPDBApplication) => {
    const father = (app.father_details as Record<string, any>) || {}
    const mother = (app.mother_details as Record<string, any>) || {}
    const defaultRecipient: 'ayah' | 'ibu' = father.hp_ayah ? 'ayah' : (mother.hp_ibu ? 'ibu' : 'ayah')
    setWaApp(app)
    setWaRecipientType(defaultRecipient)
    setWaTemplateType('observasi')
    setWaMessageText(getWaTemplateText('observasi', app, defaultRecipient))
    setWaModalOpen(true)
  }

  const handleRecipientChange = (recipient: 'ayah' | 'ibu') => {
    setWaRecipientType(recipient)
    setWaMessageText(getWaTemplateText(waTemplateType, waApp, recipient))
  }

  const handleTemplateChange = (tmpl: WaTemplateType) => {
    setWaTemplateType(tmpl)
    setWaMessageText(getWaTemplateText(tmpl, waApp, waRecipientType))
  }

  const getWaRecipientPhone = () => {
    if (!waApp) return ''
    const father = (waApp.father_details as Record<string, any>) || {}
    const mother = (waApp.mother_details as Record<string, any>) || {}
    return (waRecipientType === 'ayah' ? father.hp_ayah : mother.hp_ibu) || ''
  }

  const handleSendWa = () => {
    const phone = getWaRecipientPhone()
    if (!phone) {
      toast.error(`Nomor WhatsApp ${waRecipientType === 'ayah' ? 'Ayah' : 'Ibu'} belum diisi pada formulir.`)
      return
    }
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1)
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(waMessageText)}`
    window.open(url, '_blank')
    setWaModalOpen(false)
    toast.success('Membuka WhatsApp...')
  }

  const handleApprove = async (id: string) => {
    setActionPendingId(id)
    const result = await approvePPDB(id)
    setActionPendingId(null)

    if (result.success) {
      setGeneratedCreds({
        studentName: ppdbList.find(app => app.id === id)?.student_name,
        username: result.username,
        password: result.password
      })
      setCredsModalOpen(true)
      
      // Update local state status
      setPpdbList(prev => prev.map(app => 
        app.id === id 
          ? { ...app, status: 'Diterima', payment_status: 'Verified' }
          : app
      ))
      toast.success('Pendaftaran diterima & data murid aktif berhasil disinkronkan!')
    } else {
      toast.error(result.error || 'Terjadi kesalahan.')
    }
  }

  const handleViewDetails = async (app: PPDBApplication) => {
    setSelectedApp(app)
    setDetailsModalOpen(true)
    setLoadingDetails(true)
    setSelectedDetails(null)

    try {
      // 1. Fetch documents
      const { data: docs } = await supabase
        .from('ppdb_documents_tk')
        .select('*')
        .eq('ppdb_id', app.id)

      // 2. Fetch payment
      const { data: payment } = await supabase
        .from('payments_tk')
        .select('*')
        .eq('ppdb_id', app.id)
        .maybeSingle()

      // 3. Fetch student
      const { data: student } = await supabase
        .from('students_tk')
        .select('*')
        .eq('nama', app.student_name)
        .eq('tanggal_lahir', app.birth_date)
        .maybeSingle()

      // 4. Fetch parent
      let parent = null
      if (student) {
        const { data: parentData } = await supabase
          .from('parents_tk')
          .select('*')
          .eq('student_id', student.id)
          .maybeSingle()
        parent = parentData
      }

      setSelectedDetails({
        docs: (docs || []) as RegistrationDocument[],
        payment: (payment || null) as RegistrationPayment | null,
        student: (student || null) as StudentDetails | null,
        parent: (parent || null) as ParentDetails | null
      })
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat detail pendaftaran.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleRejectClick = (appId: string) => {
    setConfirmTitle('Tolak Pendaftaran')
    setConfirmMessage('Apakah Anda yakin ingin menolak pendaftaran ini? Status pendaftaran akan diubah menjadi Ditolak.')
    setOnConfirm(() => async () => {
      const { error } = await supabase
        .from('ppdb_tk')
        .update({ status: 'Ditolak' })
        .eq('id', appId)
      if (error) {
        toast.error('Gagal menolak pendaftaran: ' + error.message)
      } else {
        toast.success('Pendaftaran berhasil ditolak!')
        loadData()
      }
    })
    setConfirmOpen(true)
  }

  const handleDeleteClick = (appId: string) => {
    setConfirmTitle('Hapus Pendaftaran')
    setConfirmMessage('Apakah Anda yakin ingin menghapus pendaftaran ini secara permanen? Semua berkas dan data terkait akan ikut terhapus dari sistem.')
    setOnConfirm(() => async () => {
      setActionPendingId(appId)
      const { error } = await supabase.from('ppdb_tk').delete().eq('id', appId)
      setActionPendingId(null)
      if (error) {
        toast.error('Gagal menghapus pendaftaran: ' + error.message)
      } else {
        toast.success('Pendaftaran berhasil dihapus!')
        loadData()
      }
    })
    setConfirmOpen(true)
  }

  const handleResendCreds = async (id: string) => {
    setActionPendingId(id)
    const result = await resendCredentialsEmail(id)
    setActionPendingId(null)

    if (result.success) {
      toast.success('Kredensial login berhasil dikirim ulang ke email orang tua!')
    } else {
      toast.error(result.error || 'Gagal mengirim ulang kredensial.')
    }
  }

  const getStatusBadge = (status: string) => {
    return <StatusBadge status={status} />
  }

  const filteredList = useMemo(() => {
    return ppdbList.filter((app) => {
      const matchSearch =
        !searchQuery ||
        app.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || app.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [ppdbList, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, currentPage, pageSize])

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Kelola Pendaftar PPDB</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Verifikasi dokumen dan kelulusan calon siswa baru.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadData} variant="outline" className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Muat Ulang Data
          </Button>
        </div>
      </div>

      {/* PPDB Applicants List */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Aplikasi PPDB Aktif</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Daftar calon siswa baru yang mendaftar secara daring ({filteredList.length} pendaftar).</CardDescription>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <TableSearchFilter
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder="Cari nama calon siswa..."
            />

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (val) {
                  setStatusFilter(val)
                  setCurrentPage(1)
                }
              }}
            >
              <SelectTrigger className="h-9 w-40 bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Verifikasi Berkas">Verifikasi Berkas</SelectItem>
                <SelectItem value="Diterima">Diterima</SelectItem>
                <SelectItem value="Ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada data pendaftar yang sesuai.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Nama Calon Siswa</th>
                    <th className="p-4">Tanggal Lahir</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedList.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-primary-blue">{app.student_name}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">ID: {app.id.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-600">
                        {new Date(app.birth_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">{getStatusBadge(app.status)}</td>
                      <td className="p-4 pr-8 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button
                            onClick={() => openWaModal(app)}
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          >
                            <MessageCircle size={13} /> WA Ortu
                          </Button>
                          <Button
                            onClick={() => handleViewDetails(app)}
                            variant="outline"
                            className="h-8 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary-blue font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            Detail
                          </Button>
                          <Button
                            onClick={() => handleOpenEdit(app)}
                            variant="outline"
                            className="h-8 border-gray-200 text-primary-blue hover:bg-primary-blue/5 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit3 size={13} /> Edit
                          </Button>
                          {['Submitted', 'Verifikasi Berkas'].includes(app.status) && (
                            <>
                              <Button
                                onClick={() => handleApprove(app.id)}
                                disabled={actionPendingId === app.id}
                                className="h-8 bg-primary-green hover:bg-primary-green/90 text-white font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                {actionPendingId === app.id ? 'Memproses...' : 'Terima PPDB'}
                              </Button>
                              <Button
                                onClick={() => handleRejectClick(app.id)}
                                variant="outline"
                                className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          {app.status === 'Diterima' && (
                            <>
                              <Button
                                onClick={() => handleApprove(app.id)}
                                disabled={actionPendingId === app.id}
                                variant="outline"
                                title="Sinkronkan ulang ke data murid aktif"
                                className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                              >
                                <UserCheck size={13} /> Sinkron Murid
                              </Button>
                              <Button
                                onClick={() => handleResendCreds(app.id)}
                                disabled={actionPendingId === app.id}
                                variant="outline"
                                className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                              >
                                {actionPendingId === app.id ? 'Mengirim...' : 'Kirim Ulang Akun'}
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => handleDeleteClick(app.id)}
                            disabled={actionPendingId === app.id}
                            variant="outline"
                            className="h-8 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs px-2.5 cursor-pointer inline-flex items-center gap-1"
                          >
                            Hapus
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
            totalItems={filteredList.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* CREDENTIALS SUCCESS DIALOG */}
      <Dialog open={credsModalOpen} onOpenChange={setCredsModalOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-md bg-white p-8">
          <DialogHeader className="space-y-3 text-center">
            <div className="w-12 h-12 bg-[#07A363]/10 text-primary-green rounded-full flex items-center justify-center mx-auto">
              <KeyRound size={24} />
            </div>
            <DialogTitle className="text-xl font-black text-primary-blue">Akun Orang Tua Dibuat & Siswa Aktif</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold leading-relaxed">
              Pendaftaran ananda <span className="font-bold text-primary-blue">{generatedCreds?.studentName}</span> telah diterima dan data murid telah aktif.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-4 my-2 border border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold">Username Login:</span>
              <span className="font-bold font-mono text-primary-blue bg-white px-2.5 py-1 rounded-lg border border-gray-200">{generatedCreds?.username}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold">Password Awal:</span>
              <span className="font-bold font-mono text-primary-green bg-white px-2.5 py-1 rounded-lg border border-gray-200">{generatedCreds?.password}</span>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-gray-200/60 text-[11px] text-gray-500 font-medium leading-relaxed">
              <Mail size={14} className="text-primary-green shrink-0 mt-0.5" />
              <span>
                Kredensial login dan panduan aplikasi telah dikirimkan secara otomatis ke alamat email orang tua.
              </span>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            {selectedApp && (
              <Button
                onClick={() => {
                  setCredsModalOpen(false)
                  openWaModal(selectedApp)
                }}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs gap-1.5"
              >
                <MessageCircle size={14} /> Kirim WhatsApp
              </Button>
            )}
            <Button onClick={() => setCredsModalOpen(false)} className="flex-1 bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold text-xs">
              Tutup & Selesai
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WHATSAPP NOTIFICATION DIALOG */}
      <Dialog open={waModalOpen} onOpenChange={setWaModalOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-2xl bg-white p-7 max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-primary-blue">Kirim Pesan WhatsApp</DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-400">
                  Kirim pemberitahuan resmi PPDB ke orang tua ananda <span className="font-bold text-primary-blue">{waApp?.student_name}</span>.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {waApp && (
            <div className="space-y-5 pt-3 text-xs">
              {/* 1. Pilih Penerima (Ayah / Ibu) */}
              <div className="space-y-2">
                <label className="font-extrabold text-primary-blue uppercase tracking-wider text-[11px]">1. Pilih Nomor Tujuan (Ayah / Ibu)</label>
                {(() => {
                  const father = (waApp.father_details as Record<string, any>) || {}
                  const mother = (waApp.mother_details as Record<string, any>) || {}
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => handleRecipientChange('ayah')}
                        className={cn(
                          'cursor-pointer rounded-2xl border-2 p-3.5 transition-all flex items-start gap-3',
                          waRecipientType === 'ayah' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-gray-100 hover:border-gray-200 bg-[#F8F6F2]',
                          !father.hp_ayah && 'opacity-60 cursor-not-allowed'
                        )}
                      >
                        <input
                          type="radio"
                          name="wa_recipient"
                          checked={waRecipientType === 'ayah'}
                          onChange={() => handleRecipientChange('ayah')}
                          className="mt-1 accent-[#25D366]"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-primary-blue flex items-center gap-1">👨 Ayah: {father.nama_ayah || 'Tidak ada nama'}</div>
                          <div className="font-mono text-gray-600 font-bold mt-0.5">{father.hp_ayah || 'Nomor HP belum diisi'}</div>
                        </div>
                      </div>

                      <div
                        onClick={() => handleRecipientChange('ibu')}
                        className={cn(
                          'cursor-pointer rounded-2xl border-2 p-3.5 transition-all flex items-start gap-3',
                          waRecipientType === 'ibu' ? 'border-[#25D366] bg-[#25D366]/5' : 'border-gray-100 hover:border-gray-200 bg-[#F8F6F2]',
                          !mother.hp_ibu && 'opacity-60 cursor-not-allowed'
                        )}
                      >
                        <input
                          type="radio"
                          name="wa_recipient"
                          checked={waRecipientType === 'ibu'}
                          onChange={() => handleRecipientChange('ibu')}
                          className="mt-1 accent-[#25D366]"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-primary-blue flex items-center gap-1">👩 Ibu: {mother.nama_ibu || 'Tidak ada nama'}</div>
                          <div className="font-mono text-gray-600 font-bold mt-0.5">{mother.hp_ibu || 'Nomor HP belum diisi'}</div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* 2. Pilihan Template Pesan Cepat */}
              <div className="space-y-2">
                <label className="font-extrabold text-primary-blue uppercase tracking-wider text-[11px]">2. Pilih Template Pesan Cepat</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTemplateChange('observasi')}
                    className={cn(
                      'p-3 rounded-xl border text-left font-bold transition-all text-xs flex flex-col justify-between gap-1.5',
                      waTemplateType === 'observasi' ? 'border-[#25D366] bg-[#25D366]/10 text-emerald-950 font-black' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    )}
                  >
                    <span className="text-base">📅</span>
                    <span>1. Jadwal Observasi & Wawancara</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTemplateChange('ukur_seragam')}
                    className={cn(
                      'p-3 rounded-xl border text-left font-bold transition-all text-xs flex flex-col justify-between gap-1.5',
                      waTemplateType === 'ukur_seragam' ? 'border-[#25D366] bg-[#25D366]/10 text-emerald-950 font-black' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    )}
                  >
                    <span className="text-base">📏</span>
                    <span>2. Pengukuran Seragam</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTemplateChange('ambil_seragam')}
                    className={cn(
                      'p-3 rounded-xl border text-left font-bold transition-all text-xs flex flex-col justify-between gap-1.5',
                      waTemplateType === 'ambil_seragam' ? 'border-[#25D366] bg-[#25D366]/10 text-emerald-950 font-black' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    )}
                  >
                    <span className="text-base">🎒</span>
                    <span>3. Pengambilan Seragam</span>
                  </button>
                </div>
              </div>

              {/* 3. Editor Isi Pesan WhatsApp */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-primary-blue uppercase tracking-wider text-[11px]">3. Tinjau & Sesuaikan Pesan</label>
                  <span className="text-[10px] text-gray-400 font-medium">Bisa diedit sebelum dikirim</span>
                </div>
                <textarea
                  rows={8}
                  value={waMessageText}
                  onChange={(e) => setWaMessageText(e.target.value)}
                  placeholder="Ketik pesan WhatsApp..."
                  className="w-full rounded-2xl border border-gray-200 bg-[#F8F6F2] p-4 text-xs font-medium leading-relaxed text-gray-800 focus:border-[#25D366] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-[#25D366]" />
                  <span>Target No. WA: <strong className="font-mono">{getWaRecipientPhone() || '(Belum terisi)'}</strong></span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700">Tersambung via wa.me</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleSendWa}
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold rounded-xl py-3 text-xs gap-2 cursor-pointer shadow-lg shadow-[#25D366]/20"
                >
                  <Send size={15} /> Buka & Kirim WhatsApp
                </Button>
                <Button
                  type="button"
                  onClick={() => setWaModalOpen(false)}
                  variant="outline"
                  className="border-gray-200 hover:border-gray-300 font-bold rounded-xl py-3 text-xs px-5 cursor-pointer"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PPDB DETAILS DIALOG */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-4xl bg-white p-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-black text-primary-blue">Detail Pendaftaran PPDB</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-gray-400">
                Data lengkap calon siswa dan berkas pendaftaran ananda <span className="font-bold text-primary-blue">{selectedApp?.student_name}</span>.
              </DialogDescription>
            </div>
            {selectedApp && getStatusBadge(selectedApp.status)}
          </DialogHeader>

          {loadingDetails ? (
            <div className="py-20 text-center text-gray-400 font-bold">Memuat detail data calon siswa...</div>
          ) : !selectedDetails ? (
            <div className="py-20 text-center text-red-500 font-bold">Gagal memuat data. Silakan coba lagi.</div>
          ) : (
            <div className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LEFT COLUMN: STUDENT & PARENT DETAILS */}
              <div className="space-y-6">
                {/* 1. DATA CALON SISWA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">1. Data Calon Siswa</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3 border border-gray-50 text-xs">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Nama Lengkap:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.student?.nama}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Tempat/Tgl Lahir:</span>
                      <span className="col-span-2 font-bold text-primary-blue">
                        {selectedDetails.student?.tempat_lahir || '-'}, {selectedDetails.student?.tanggal_lahir ? new Date(selectedDetails.student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Jenis Kelamin:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.student?.jenis_kelamin === 'P' ? '👧 Perempuan' : '👦 Laki-laki'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Agama:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.student?.agama || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">NIK Anak:</span>
                      <span className="col-span-2 font-bold text-primary-blue font-mono">{selectedDetails.student?.nik || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">NISN Anak:</span>
                      <span className="col-span-2 font-bold text-primary-blue font-mono">{selectedDetails.student?.nisn || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Keluarga:</span>
                      <span className="col-span-2 font-bold text-primary-blue">Anak Ke-{selectedDetails.student?.anak_ke || '1'} dari {selectedDetails.student?.jml_saudara || '0'} bersaudara</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 font-semibold">Alamat:</span>
                      <span className="col-span-2 font-semibold text-primary-blue leading-relaxed">{selectedDetails.student?.alamat || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. DATA ORANG TUA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">2. Data Orang Tua</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-4 border border-gray-50 text-xs">
                    {/* AYAH */}
                    <div className="space-y-2 pb-3 border-b border-gray-200/60">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">👨 Identitas Ayah Kandung</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Nama Ayah:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.nama_ayah || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Pekerjaan:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.pekerjaan?.split('/')?.[0]?.trim() || '-'}</span>
                      </div>
                    </div>
                    {/* IBU */}
                    <div className="space-y-2">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">👩 Identitas Ibu Kandung</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Nama Ibu:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.nama_ibu || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Pekerjaan:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.pekerjaan?.split('/')?.[1]?.trim() || '-'}</span>
                      </div>
                    </div>
                    {/* CONTACT */}
                    <div className="space-y-2 pt-3 border-t border-gray-200/60">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">📞 Kontak & Alamat</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">No. HP / WA:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.hp || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Email:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.email || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Alamat Orang Tua:</span>
                        <span className="col-span-2 font-semibold text-primary-blue leading-relaxed">{selectedDetails.parent?.alamat || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DOCUMENTS & PAYMENT */}
              <div className="space-y-6">
                {/* 3. DOKUMEN BERKAS */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">3. Dokumen Lampiran</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3 border border-gray-50 text-xs">
                    {selectedDetails.docs.length === 0 ? (
                      <div className="text-center text-gray-400 py-4 font-semibold">Tidak ada berkas yang diunggah.</div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedDetails.docs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#07A363]/30 transition-all">
                            <div>
                              <div className="font-bold text-primary-blue">{documentLabel(doc.type)}</div>
                              <div className="text-[10px] text-gray-400 font-medium">Dokumen PPDB</div>
                            </div>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#07265F]/5 hover:bg-[#07265F]/10 text-primary-blue hover:text-primary-blue/90 font-extrabold rounded-lg text-[10px] transition-colors"
                            >
                              Lihat Berkas
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. INFORMASI BIAYA & PEMBAYARAN */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">4. Riwayat Pembayaran</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-4 border border-gray-50 text-xs">
                    {!selectedDetails.payment ? (
                      <div className="text-center text-gray-400 py-4 font-semibold">Tidak ada data pembayaran.</div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-semibold">Metode Pembayaran:</span>
                            <Badge className="bg-blue-50 text-blue-700 border-none font-bold rounded-full">{selectedDetails.payment.method}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-semibold">Jumlah Biaya:</span>
                            <span className="font-bold text-primary-blue">Rp {parseFloat(String(selectedDetails.payment.amount)).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-semibold">Status:</span>
                            <Badge className={cn(
                              "border-none font-bold rounded-full",
                              selectedDetails.payment.status === 'Verified' ? "bg-emerald-100 text-emerald-800" :
                              selectedDetails.payment.status === 'Rejected' ? "bg-rose-100 text-rose-800" :
                              "bg-amber-100 text-amber-800"
                            )}>
                              {selectedDetails.payment.status === 'Verified' ? 'Diverifikasi' : 
                               selectedDetails.payment.status === 'Rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                            </Badge>
                          </div>
                        </div>

                        {selectedDetails.payment.proof && (
                          <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                            <span className="text-gray-400 font-semibold">Bukti Pembayaran:</span>
                            <a
                              href={selectedDetails.payment.proof}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 bg-[#07A363]/10 hover:bg-[#07A363]/25 text-[#07A363] font-extrabold rounded-lg text-[10px] transition-all"
                            >
                              Lihat Bukti Transfer
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div>
                  <h3 className="text-sm font-black text-primary-blue">Formulir Pendaftaran Lengkap</h3>
                  <p className="mt-1 text-[11px] font-medium text-gray-400">Snapshot jawaban yang dikirim orang tua/wali saat pendaftaran.</p>
                </div>
                <SnapshotGroup title="A. Keterangan Anak" sections={CHILD_FORM_SECTIONS} data={selectedApp?.child_details} defaultOpen />
                <SnapshotGroup title="B. Identitas Ayah" sections={FATHER_FORM_SECTIONS} data={selectedApp?.father_details} />
                <SnapshotGroup title="B. Identitas Ibu" sections={MOTHER_FORM_SECTIONS} data={selectedApp?.mother_details} />
                <SnapshotGroup title="C. Perkembangan dan Kesehatan Anak" sections={HEALTH_FORM_SECTIONS} data={selectedApp?.development_health} />
              </div>
            </div>
          )}

          {/* DIALOG FOOTER ACTIONS */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end items-center">
            {selectedApp && (
              <>
                <Button
                  onClick={() => {
                    setDetailsModalOpen(false)
                    handleOpenEdit(selectedApp)
                  }}
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer gap-1.5"
                >
                  <Edit3 size={15} /> Edit Data Pendaftar
                </Button>
                <Button
                  onClick={() => {
                    setDetailsModalOpen(false)
                    openWaModal(selectedApp)
                  }}
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer gap-1.5"
                >
                  <MessageCircle size={15} /> Kirim Pesan WA
                </Button>
              </>
            )}
            {selectedApp && ['Submitted', 'Verifikasi Berkas'].includes(selectedApp.status) && (
              <>
                <Button
                  onClick={() => {
                    setDetailsModalOpen(false)
                    handleApprove(selectedApp.id)
                  }}
                  disabled={actionPendingId === selectedApp.id}
                  className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer"
                >
                  Terima Calon Siswa
                </Button>
                <Button
                  onClick={() => {
                    setDetailsModalOpen(false)
                    handleRejectClick(selectedApp.id)
                  }}
                  variant="outline"
                  className="border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl text-xs py-2.5 px-4 cursor-pointer"
                >
                  Tolak Pendaftaran
                </Button>
              </>
            )}
            {selectedApp && selectedApp.status === 'Diterima' && (
              <>
                <Button
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={actionPendingId === selectedApp.id}
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer"
                >
                  <UserCheck size={14} className="mr-1.5" /> Sinkronkan Data Murid
                </Button>
                <Button
                  onClick={() => handleResendCreds(selectedApp.id)}
                  disabled={actionPendingId === selectedApp.id}
                  className="bg-primary-blue hover:bg-primary-blue/90 text-white font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer"
                >
                  {actionPendingId === selectedApp.id ? 'Mengirim...' : 'Kirim Ulang Kredensial'}
                </Button>
              </>
            )}
            <Button onClick={() => setDetailsModalOpen(false)} variant="outline" className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs py-2.5 px-5 cursor-pointer">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT PPDB DIALOG */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-3xl bg-white p-7 max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-green/10 text-primary-green">
                <Edit3 size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-primary-blue">Edit Data Pendaftar PPDB</DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-400">
                  Perbarui identitas calon murid, orang tua/wali, serta status pendaftaran dan biaya.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-6 pt-2">
            <Tabs defaultValue="anak" className="w-full">
              <TabsList className="grid grid-cols-4 bg-[#F8F6F2] p-1 rounded-2xl h-auto mb-5">
                <TabsTrigger value="anak" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                  👧 Calon Murid
                </TabsTrigger>
                <TabsTrigger value="ayah" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                  👨 Data Ayah
                </TabsTrigger>
                <TabsTrigger value="ibu" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                  👩 Data Ibu
                </TabsTrigger>
                <TabsTrigger value="status" className="rounded-xl font-bold text-xs py-2 data-[state=active]:bg-white data-[state=active]:text-primary-blue data-[state=active]:shadow-sm">
                  ⚙️ Status & Biaya
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: CALON MURID */}
              <TabsContent value="anak" className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Nama Lengkap Murid *</Label>
                  <Input
                    value={editForm.student_name}
                    onChange={(e) => setEditForm({ ...editForm, student_name: e.target.value })}
                    required
                    placeholder="Nama lengkap anak..."
                    className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Tempat Lahir</Label>
                    <Input
                      value={editForm.tempat_lahir}
                      onChange={(e) => setEditForm({ ...editForm, tempat_lahir: e.target.value })}
                      placeholder="Contoh: Bandung"
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Tanggal Lahir *</Label>
                    <Input
                      type="date"
                      value={editForm.birth_date}
                      onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                      required
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Jenis Kelamin</Label>
                    <Select value={editForm.jenis_kelamin} onValueChange={(v) => setEditForm({ ...editForm, jenis_kelamin: v || 'L' })}>
                      <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Agama</Label>
                    <Select value={editForm.agama} onValueChange={(v) => setEditForm({ ...editForm, agama: v || 'Islam' })}>
                      <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Kristen">Kristen</SelectItem>
                        <SelectItem value="Katolik">Katolik</SelectItem>
                        <SelectItem value="Hindu">Hindu</SelectItem>
                        <SelectItem value="Buddha">Buddha</SelectItem>
                        <SelectItem value="Konghucu">Konghucu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">NIK Anak (16 Digit)</Label>
                    <Input
                      value={editForm.nik}
                      maxLength={16}
                      onChange={(e) => setEditForm({ ...editForm, nik: e.target.value })}
                      placeholder="16 digit NIK..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">NISN Anak (10 Digit)</Label>
                    <Input
                      value={editForm.nisn}
                      maxLength={10}
                      onChange={(e) => setEditForm({ ...editForm, nisn: e.target.value })}
                      placeholder="10 digit NISN..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Anak Ke-</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editForm.anak_ke}
                      onChange={(e) => setEditForm({ ...editForm, anak_ke: e.target.value })}
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Jumlah Saudara</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.jml_saudara}
                      onChange={(e) => setEditForm({ ...editForm, jml_saudara: e.target.value })}
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Alamat Tempat Tinggal</Label>
                  <Textarea
                    rows={2}
                    value={editForm.alamat}
                    onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                    placeholder="Alamat lengkap domisili anak..."
                    className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold resize-none"
                  />
                </div>
              </TabsContent>

              {/* TAB 2: IDENTITAS AYAH */}
              <TabsContent value="ayah" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Nama Lengkap Ayah</Label>
                    <Input
                      value={editForm.nama_ayah}
                      onChange={(e) => setEditForm({ ...editForm, nama_ayah: e.target.value })}
                      placeholder="Nama ayah kandung/wali..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">NIK Ayah</Label>
                    <Input
                      value={editForm.nik_ayah}
                      maxLength={16}
                      onChange={(e) => setEditForm({ ...editForm, nik_ayah: e.target.value })}
                      placeholder="16 digit NIK Ayah..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Pekerjaan Ayah</Label>
                    <Input
                      value={editForm.pekerjaan_ayah}
                      onChange={(e) => setEditForm({ ...editForm, pekerjaan_ayah: e.target.value })}
                      placeholder="Contoh: Karyawan Swasta, PNS, Wiraswasta..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Pendidikan Terakhir</Label>
                    <Input
                      value={editForm.pendidikan_ayah}
                      onChange={(e) => setEditForm({ ...editForm, pendidikan_ayah: e.target.value })}
                      placeholder="Contoh: S1, SMA, D3..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Nomor HP / WhatsApp Ayah</Label>
                    <Input
                      value={editForm.hp_ayah}
                      onChange={(e) => setEditForm({ ...editForm, hp_ayah: e.target.value })}
                      placeholder="08123456789"
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Email Ayah</Label>
                    <Input
                      type="email"
                      value={editForm.email_ayah}
                      onChange={(e) => setEditForm({ ...editForm, email_ayah: e.target.value })}
                      placeholder="ayah@email.com"
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Penghasilan per Bulan</Label>
                  <Input
                    value={editForm.penghasilan_ayah}
                    onChange={(e) => setEditForm({ ...editForm, penghasilan_ayah: e.target.value })}
                    placeholder="Contoh: Rp 5.000.000 - Rp 10.000.000"
                    className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Alamat Rumah Ayah</Label>
                  <Textarea
                    rows={2}
                    value={editForm.alamat_ayah}
                    onChange={(e) => setEditForm({ ...editForm, alamat_ayah: e.target.value })}
                    placeholder="Alamat lengkap tempat tinggal ayah..."
                    className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold resize-none"
                  />
                </div>
              </TabsContent>

              {/* TAB 3: IDENTITAS IBU */}
              <TabsContent value="ibu" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Nama Lengkap Ibu</Label>
                    <Input
                      value={editForm.nama_ibu}
                      onChange={(e) => setEditForm({ ...editForm, nama_ibu: e.target.value })}
                      placeholder="Nama ibu kandung/wali..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">NIK Ibu</Label>
                    <Input
                      value={editForm.nik_ibu}
                      maxLength={16}
                      onChange={(e) => setEditForm({ ...editForm, nik_ibu: e.target.value })}
                      placeholder="16 digit NIK Ibu..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Pekerjaan Ibu</Label>
                    <Input
                      value={editForm.pekerjaan_ibu}
                      onChange={(e) => setEditForm({ ...editForm, pekerjaan_ibu: e.target.value })}
                      placeholder="Contoh: Ibu Rumah Tangga, Guru, Dokter..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Pendidikan Terakhir</Label>
                    <Input
                      value={editForm.pendidikan_ibu}
                      onChange={(e) => setEditForm({ ...editForm, pendidikan_ibu: e.target.value })}
                      placeholder="Contoh: S1, SMA, D3..."
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Nomor HP / WhatsApp Ibu</Label>
                    <Input
                      value={editForm.hp_ibu}
                      onChange={(e) => setEditForm({ ...editForm, hp_ibu: e.target.value })}
                      placeholder="08123456789"
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Email Ibu</Label>
                    <Input
                      type="email"
                      value={editForm.email_ibu}
                      onChange={(e) => setEditForm({ ...editForm, email_ibu: e.target.value })}
                      placeholder="ibu@email.com"
                      className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Penghasilan per Bulan</Label>
                  <Input
                    value={editForm.penghasilan_ibu}
                    onChange={(e) => setEditForm({ ...editForm, penghasilan_ibu: e.target.value })}
                    placeholder="Contoh: Rp 3.000.000 - Rp 5.000.000"
                    className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Alamat Rumah Ibu</Label>
                  <Textarea
                    rows={2}
                    value={editForm.alamat_ibu}
                    onChange={(e) => setEditForm({ ...editForm, alamat_ibu: e.target.value })}
                    placeholder="Alamat lengkap tempat tinggal ibu..."
                    className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold resize-none"
                  />
                </div>
              </TabsContent>

              {/* TAB 4: STATUS & PEMBAYARAN */}
              <TabsContent value="status" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Status Pendaftaran</Label>
                    <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v || 'Submitted' })}>
                      <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Submitted">Submitted (Baru Masuk)</SelectItem>
                        <SelectItem value="Verifikasi Berkas">Verifikasi Berkas</SelectItem>
                        <SelectItem value="Diterima">Diterima (Lulus PPDB)</SelectItem>
                        <SelectItem value="Ditolak">Ditolak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Status Pembayaran Formulir</Label>
                    <Select value={editForm.payment_status} onValueChange={(v) => setEditForm({ ...editForm, payment_status: v || 'Pending' })}>
                      <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Pending">Pending (Menunggu)</SelectItem>
                        <SelectItem value="Verified">Verified (Lunas / Diverifikasi)</SelectItem>
                        <SelectItem value="Rejected">Rejected (Ditolak)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-[11px] font-semibold flex items-start gap-2 leading-relaxed">
                  <UserCheck size={16} className="text-primary-green shrink-0 mt-0.5" />
                  <span>
                    <strong>Otomatisasi Data:</strong> Jika status pendaftaran diatur ke <strong>Diterima</strong>, sistem akan otomatis membuat atau menyinkronkan data murid ke tabel Master Murid (Aktif) beserta akun portal orang tua.
                  </span>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
              <Button
                type="button"
                onClick={() => setEditModalOpen(false)}
                variant="outline"
                className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs py-2.5 px-5 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={savingEdit}
                className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs py-2.5 px-6 cursor-pointer gap-1.5"
              >
                <Save size={15} /> {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan Data'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CUSTOM CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-md bg-white p-8">
          <DialogHeader className="space-y-3 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <DialogTitle className="text-lg font-black text-primary-blue">{confirmTitle}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold leading-relaxed">
              {confirmMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-6">
            <Button
              onClick={() => {
                setConfirmOpen(false)
                onConfirm()
              }}
              className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-2.5 cursor-pointer"
            >
              Ya, Lanjutkan
            </Button>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outline"
              className="flex-1 border-gray-200 hover:border-gray-300 font-bold rounded-xl py-2.5 cursor-pointer"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
