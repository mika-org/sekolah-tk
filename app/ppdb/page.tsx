'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  CheckCircle2,
  Copy,
  FileText,
  KeyRound,
  RotateCcw,
  Save,
  User,
  Users,
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  UploadCloud,
  Camera,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { submitPPDB, verifyPpdbToken, purchasePPDBForm, saveInitialPPDBForm } from '@/actions/ppdb'
import { getSettings } from '@/actions/settings'
import { buttonVariants } from '@/components/ui/button'
import {
  allFields,
  CHILD_FORM_SECTIONS,
  FATHER_FORM_SECTIONS,
  MOTHER_FORM_SECTIONS,
  type PPDBFieldDefinition,
} from '@/lib/ppdb/form-definition'
import { cn, getCleanWhatsAppNumber } from '@/lib/utils'

interface FormState {
  success: boolean
  error: string
  ppdbId: string
  token?: string
  errorStep?: number
}

const initialFormState: FormState = { success: false, error: '', ppdbId: '' }

const inputClassName =
  'h-12 w-full rounded-xl border border-[#0F7A4A]/60 bg-white px-4 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-[#0F7A4A] focus:ring-2 focus:ring-[#0F7A4A]/20'
const textareaClassName =
  'min-h-[140px] md:h-[132px] w-full resize-none rounded-xl border border-[#0F7A4A]/60 bg-white p-4 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-[#0F7A4A] focus:ring-2 focus:ring-[#0F7A4A]/20'

function FormField({ field, children }: { field: PPDBFieldDefinition; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', field.span === 2 && 'sm:col-span-2')}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={field.name} className="text-xs font-bold text-gray-700">
          {field.label}
          {field.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {field.hint && <span className="text-[10px] font-medium text-gray-400">{field.hint}</span>}
      </div>
      {children}
    </div>
  )
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: PPDBFieldDefinition
  value?: string
  onChange: (name: string, value: string) => void
}) {
  if (field.type === 'select') {
    return (
      <FormField field={field}>
        <select
          id={field.name}
          name={field.name}
          value={value ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={cn(inputClassName, 'cursor-pointer')}
        >
          <option value="">Pilih {field.label.toLowerCase()}</option>
          {field.options?.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </FormField>
    )
  }

  if (field.type === 'textarea') {
    return (
      <FormField field={field}>
        <textarea
          id={field.name}
          name={field.name}
          value={value ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={textareaClassName}
        />
      </FormField>
    )
  }

  return (
    <FormField field={field}>
      <input
        id={field.name}
        name={field.name}
        type={
          field.type === 'date'
            ? 'date'
            : field.type === 'number'
            ? 'number'
            : field.type === 'email'
            ? 'email'
            : 'text'
        }
        value={value ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className={inputClassName}
      />
    </FormField>
  )
}

export default function PPDBPage() {
  // Navigation & Wizard State
  // regStep 1: Isi Data Pembeli Formulir
  // regStep 2: Pembayaran
  // regStep 3: Selesai (Pembelian Berhasil)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1)
  
  // Kode Akses & Mode Formulir Lengkap PPDB
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [inputToken, setInputToken] = useState('')
  const [verifyingToken, setVerifyingToken] = useState(false)
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [existingPpdbId, setExistingPpdbId] = useState<string | null>(null)
  
  // Full Form SPMB steps (Step 2: Biodata Lengkap, Step 3: Lampiran Berkas)
  const [fullFormMode, setFullFormMode] = useState(false)
  const [fullFormStep, setFullFormStep] = useState<2 | 3>(2)
  const [fullSubmitState, setFullSubmitState] = useState<FormState>(initialFormState)
  const [isPending, setIsPending] = useState(false)

  const PPDB_DRAFT_STORAGE_KEY = 'ppdb_initial_registration_draft'

  // Form Data & Files
  const [formData, setFormData] = useState<Record<string, string>>({
    payment_method: 'Transfer',
  })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [fotoAnakFile, setFotoAnakFile] = useState<File | null>(null)
  const [kkFile, setKkFile] = useState<File | null>(null)
  const [aktaFile, setAktaFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [dbSettings, setDbSettings] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [savingInitial, setSavingInitial] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Restore draft formulir awal dari localStorage jika tersedia
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PPDB_DRAFT_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({ ...prev, ...parsed }))
          if (parsed.existingPpdbId) {
            setExistingPpdbId(parsed.existingPpdbId)
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memuat draft data formulir awal:', err)
    }
  }, [])

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getSettings()
        if (res.success && res.settings) {
          setDbSettings(res.settings)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      try {
        localStorage.setItem(
          PPDB_DRAFT_STORAGE_KEY,
          JSON.stringify({
            student_name: updated.student_name || '',
            parent_name: updated.parent_name || '',
            phone: updated.phone || '',
            email: updated.email || '',
            alamat: updated.alamat || '',
            existingPpdbId: existingPpdbId || '',
          })
        )
      } catch {}
      return updated
    })
  }

  const getFieldValue = (fieldName: string): string => {
    if (formData[fieldName] !== undefined && formData[fieldName] !== null && formData[fieldName] !== '') {
      return formData[fieldName]
    }
    // Pemetaan otomatis isian yang sudah pernah diisi (Tahap 1 / data registrasi awal)
    if (fieldName === 'student_name') return formData.student_name || ''
    if (fieldName === 'alamat') return formData.alamat || ''
    if (fieldName === 'nama_ayah') return formData.nama_ayah || formData.parent_name || ''
    if (fieldName === 'hp_ayah') return formData.hp_ayah || formData.phone || ''
    if (fieldName === 'email_ayah') return formData.email_ayah || formData.email || ''
    if (fieldName === 'alamat_ayah') return formData.alamat_ayah || formData.alamat || ''
    if (fieldName === 'alamat_ibu') return formData.alamat_ibu || formData.alamat || ''
    if (fieldName === 'status_ayah') return formData.status_ayah || 'Kandung'
    if (fieldName === 'status_ibu') return formData.status_ibu || 'Kandung'
    if (fieldName === 'status_pendaftaran') return formData.status_pendaftaran || 'Murid baru'
    if (fieldName === 'kewarganegaraan') return formData.kewarganegaraan || 'WNI'
    if (fieldName === 'agama') return formData.agama || 'Islam'
    return ''
  }

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Nomor rekening berhasil disalin!')
  }

  // Reset Formulir
  const handleResetForm = () => {
    try {
      localStorage.removeItem(PPDB_DRAFT_STORAGE_KEY)
    } catch {}
    setFormData({ payment_method: 'Transfer' })
    setProofFile(null)
    setAktaFile(null)
    setKtpFile(null)
    setActiveToken(null)
    setExistingPpdbId(null)
    setInputToken('')
    setShowTokenInput(false)
    setRegStep(1)
    setFullFormMode(false)
    setFullFormStep(2)
    setFullSubmitState(initialFormState)
    if (formRef.current) formRef.current.reset()
    toast.info('Formulir pendaftaran berhasil direset.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Klik Daftar Sekarang di Header: Scroll mulus ke formulir registrasi
  const handleDaftarSekarangClick = () => {
    setFullFormMode(false)
    setRegStep(1)
    setShowTokenInput(false)
    setMobileMenuOpen(false)
    const el = document.getElementById('registration-form-card')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }
  }

  // Validasi & Gunakan Kode Akses Formulir
  const handleValidateToken = async () => {
    if (!inputToken.trim()) {
      toast.error('Silakan masukkan kode akses formulir Anda.')
      return
    }

    setVerifyingToken(true)
    try {
      const res = await verifyPpdbToken(inputToken)
      if (!res.success) {
        if (res.isPending) {
          toast.warning(res.error, { duration: 6000 })
        } else {
          toast.error(res.error)
        }
        return
      }

      if (res.isVerified && res.data) {
        const d = res.data
        setActiveToken(d.token)
        setExistingPpdbId(d.ppdbId)

        const childD = (d.childDetails as Record<string, any>) || {}
        const fatherD = (d.fatherDetails as Record<string, any>) || {}
        const motherD = (d.motherDetails as Record<string, any>) || {}

        // Isi otomatis SELURUH isian yang pernah diisi (Tahap 1, formulir awal, dan data tersimpan sebelumnya)
        setFormData((prev) => {
          const merged: Record<string, string> = {
            ...prev,
            // 1. Seluruh field tersimpan sebelumnya dari database
            ...Object.fromEntries(
              Object.entries(childD).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])
            ),
            ...Object.fromEntries(
              Object.entries(fatherD).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])
            ),
            ...Object.fromEntries(
              Object.entries(motherD).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])
            ),
            // 2. Data primer pendaftaran awal
            student_name: d.studentName || childD.student_name || prev.student_name || '',
            parent_name: d.parentName || childD.parent_name || fatherD.nama_ayah || prev.parent_name || '',
            alamat: d.alamat || childD.alamat || fatherD.alamat_ayah || prev.alamat || '',
            phone: d.phone || childD.phone || fatherD.hp_ayah || prev.phone || '',
            email: d.email || childD.email || fatherD.email_ayah || prev.email || '',
            ppdb_id: d.ppdbId || prev.ppdb_id || '',
            form_token: d.token || prev.form_token || '',
            // 3. Pemetaan otomatis identitas orang tua (Ayah & Ibu)
            nama_ayah: fatherD.nama_ayah || d.parentName || childD.parent_name || prev.parent_name || '',
            hp_ayah: fatherD.hp_ayah || d.phone || childD.phone || prev.phone || '',
            email_ayah: fatherD.email_ayah || d.email || childD.email || prev.email || '',
            alamat_ayah: fatherD.alamat_ayah || d.alamat || childD.alamat || prev.alamat || '',
            alamat_ibu: motherD.alamat_ibu || d.alamat || childD.alamat || prev.alamat || '',
            status_ayah: fatherD.status_ayah || 'Kandung',
            status_ibu: motherD.status_ibu || 'Kandung',
            // 4. Default pilihan jika belum dipilih
            birth_date: d.birthDate || childD.birth_date || prev.birth_date || '',
            jenis_kelamin: childD.jenis_kelamin || prev.jenis_kelamin || 'L',
            agama: childD.agama || prev.agama || 'Islam',
            kewarganegaraan: childD.kewarganegaraan || prev.kewarganegaraan || 'WNI',
            status_pendaftaran: childD.status_pendaftaran || prev.status_pendaftaran || 'Murid baru',
            anak_ke: String(childD.anak_ke || prev.anak_ke || '1'),
            jml_saudara: String(childD.jml_saudara || prev.jml_saudara || '0'),
          }
          return merged
        })

        toast.success(
          `Kode Akses Terverifikasi! Melanjutkan ke Biodata Lengkap ananda ${d.studentName}.`
        )
        setShowTokenInput(false)
        setFullFormMode(true)
        setFullFormStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err: any) {
      toast.error('Gagal memverifikasi kode akses: ' + err.message)
    } finally {
      setVerifyingToken(false)
    }
  }

  // Step 1: Lanjut ke Pembayaran (Simpan Data Awal Formulir)
  const handleGoToPayment = async () => {
    if (!formData.student_name?.trim()) {
      toast.error('Nama lengkap anak wajib diisi.')
      return
    }
    if (!formData.parent_name?.trim()) {
      toast.error('Nama orang tua / wali wajib diisi.')
      return
    }
    if (!formData.phone?.trim()) {
      toast.error('Nomor telepon wajib diisi.')
      return
    }
    if (!formData.alamat?.trim()) {
      toast.error('Alamat lengkap wajib diisi.')
      return
    }

    setSavingInitial(true)
    try {
      // Simpan data formulir awal ke database agar aman tersimpan sejak awal
      const res = await saveInitialPPDBForm({
        ppdbId: existingPpdbId,
        studentName: formData.student_name.trim(),
        parentName: formData.parent_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || '',
        alamat: formData.alamat.trim(),
      })

      if (res.success && res.ppdbId) {
        setExistingPpdbId(res.ppdbId)
        try {
          localStorage.setItem(
            PPDB_DRAFT_STORAGE_KEY,
            JSON.stringify({
              student_name: formData.student_name,
              parent_name: formData.parent_name,
              phone: formData.phone,
              email: formData.email,
              alamat: formData.alamat,
              existingPpdbId: res.ppdbId,
            })
          )
        } catch {}
      }
    } catch (err) {
      console.warn('Gagal menyimpan data awal formulir ke server:', err)
    } finally {
      setSavingInitial(false)
      setRegStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Step 2: Kirim Pembelian Formulir (Berikutnya)
  const handlePurchaseSubmit = async () => {
    if (!proofFile) {
      toast.error('Mohon unggah bukti pembayaran terlebih dahulu.')
      return
    }

    setIsPending(true)
    try {
      const data = new FormData()
      if (existingPpdbId) data.append('ppdb_id', existingPpdbId)
      data.append('student_name', formData.student_name || '')
      data.append('parent_name', formData.parent_name || '')
      data.append('alamat', formData.alamat || '')
      data.append('phone', formData.phone || '')
      data.append('email', formData.email || '')
      data.append('bukti_pembayaran', proofFile)

      const res = await purchasePPDBForm({ success: false, error: '', ppdbId: '' }, data)
      if (res.success) {
        setExistingPpdbId(res.ppdbId)
        if (res.token) setActiveToken(res.token)
        toast.success('Pembelian formulir pendaftaran berhasil dikirim!')
        setRegStep(3)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        toast.error(res.error || 'Gagal mengirim pembelian formulir.')
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan: ' + (err?.message || err))
    } finally {
      setIsPending(false)
    }
  }

  // Submit Full Biodata SPMB
  const handleFullFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (fullFormStep === 2) {
      if (!formData.birth_date) {
        toast.error('Tanggal lahir anak wajib diisi.')
        return
      }
      if (!formData.jenis_kelamin) {
        toast.error('Jenis kelamin anak wajib dipilih.')
        return
      }
      setFullFormStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Step 3 submission
    if (!aktaFile) {
      toast.error('Akta Kelahiran Anak wajib dilampirkan.')
      return
    }
    if (!ktpFile) {
      toast.error('KTP Orang Tua wajib dilampirkan.')
      return
    }

    setIsPending(true)
    try {
      const data = new FormData()
      data.append('current_step', '3')
      data.append('payment_method', 'Transfer')
      data.append('ppdb_id', existingPpdbId || '')
      data.append('form_token', activeToken || '')

      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          data.append(k, String(v))
        }
      })

      data.set('student_name', (formData.student_name || '').trim())
      data.set('initial_student_name', (formData.student_name || '').trim())
      data.set('nama_lengkap', (formData.student_name || '').trim())
      data.set('parent_name', (formData.parent_name || '').trim())
      data.set('initial_parent_name', (formData.parent_name || '').trim())
      data.set('alamat', (formData.alamat || '').trim())
      data.set('phone', (formData.phone || '').trim())
      data.set('email', (formData.email || '').trim())

      if (!data.get('nama_ayah') && (formData.nama_ayah || formData.parent_name)) {
        data.set('nama_ayah', (formData.nama_ayah || formData.parent_name || '').trim())
      }
      if (!data.get('hp_ayah') && (formData.hp_ayah || formData.phone)) {
        data.set('hp_ayah', (formData.hp_ayah || formData.phone || '').trim())
      }
      if (!data.get('email_ayah') && (formData.email_ayah || formData.email)) {
        data.set('email_ayah', (formData.email_ayah || formData.email || '').trim())
      }
      if (!data.get('alamat_ayah') && (formData.alamat_ayah || formData.alamat)) {
        data.set('alamat_ayah', (formData.alamat_ayah || formData.alamat || '').trim())
      }
      if (!data.get('alamat_ibu') && (formData.alamat_ibu || formData.alamat)) {
        data.set('alamat_ibu', (formData.alamat_ibu || formData.alamat || '').trim())
      }
      if (!data.get('status_ayah')) data.set('status_ayah', formData.status_ayah || 'Kandung')
      if (!data.get('status_ibu')) data.set('status_ibu', formData.status_ibu || 'Kandung')

      if (proofFile) data.append('bukti_pembayaran', proofFile)
      if (fotoAnakFile) data.append('foto_anak', fotoAnakFile)
      if (kkFile) data.append('kk', kkFile)
      if (aktaFile) data.append('akta', aktaFile)
      if (ktpFile) data.append('ktp_ortu', ktpFile)

      const res = await submitPPDB(initialFormState, data)
      setFullSubmitState(res)
      if (res.success) {
        try {
          localStorage.removeItem(PPDB_DRAFT_STORAGE_KEY)
        } catch {}
        toast.success('Pendaftaran SPMB lengkap berhasil dikirim!')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        toast.error(res.error || 'Terjadi kesalahan saat mengirim pendaftaran.')
        if (res.errorStep) setFullFormStep(res.errorStep as 2 | 3)
      }
    } catch (err: any) {
      toast.error('Gagal mengirim pendaftaran: ' + (err?.message || err))
    } finally {
      setIsPending(false)
    }
  }

  const bankName = dbSettings?.payment_bank_name || 'BANK MUAMALAT INDONESIA'
  const accountNumber = dbSettings?.payment_account_number || '1130011857'
  const accountOwner = dbSettings?.payment_account_name || 'Yayasan Istiqamah Bandung'
  const accountSubOwner = dbSettings?.payment_account_subname || 'HETI HERAWATI OR ANTY NUDIANTI IMANI'
  const rawFee = dbSettings?.ppdb_fee || '500000'
  const formattedFee = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(rawFee) || 500000)

  const schoolPhone = getCleanWhatsAppNumber(dbSettings?.school_phone)
  const formattedSchoolPhone = schoolPhone.startsWith('62')
    ? `+${schoolPhone.slice(0, 2)} ${schoolPhone.slice(2, 5)}-${schoolPhone.slice(5, 9)}-${schoolPhone.slice(9)}`
    : `+62 811-2198-853`

  // ─── SUKSES FORMULIR LENGKAP PPDB (SESUAI TAMPILAN PPDB SAAT INI) ───
  if (fullSubmitState.success) {
    return (
      <div className="min-h-screen bg-[#A5DCEB] bg-[url('/images/hero_bg_clean.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg rounded-3xl bg-white p-8 sm:p-10 text-center shadow-2xl border border-gray-100 space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 size={44} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D]">
              Pendaftaran Lengkap Berhasil Dikirim!
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
              Seluruh biodata anak, orang tua, dan dokumen persyaratan telah berhasil diterima. Panitia SPMB akan segera memverifikasi berkas dan menghubungi Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-[#F8F6F2] p-4 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-500">ID Registrasi SPMB:</span>
              <span className="font-mono font-black text-[#0F7A4A] text-sm">
                {fullSubmitState.ppdbId}
              </span>
            </div>
            {activeToken && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Kode Akses Formulir:</span>
                <span className="font-mono font-black text-[#0F7A4A]">{activeToken}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-500">Status Berkas:</span>
              <span className="font-bold text-[#1B365D]">Menunggu Verifikasi Berkas</span>
            </div>
          </div>
          <div className="space-y-2.5">
            <a
              href={`https://wa.me/${schoolPhone}?text=Halo%20Admin%20SPMB%20TK%20Istiqamah,%20saya%20sudah%20mengirimkan%20berkas%20pendaftaran%20lengkap%20online.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>Konfirmasi Berkas ke WhatsApp ({formattedSchoolPhone})</span>
            </a>
            <Link
              href="/"
              className={cn(
                buttonVariants(),
                'w-full rounded-xl bg-[#1B365D] font-bold text-xs py-3 text-white hover:bg-[#1B365D]/90'
              )}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#A5DCEB] bg-[url('/images/hero_bg_clean.png')] bg-cover bg-center bg-no-repeat relative flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* ─── FLOATING TOP NAVBAR ─── */}
      <header className="relative z-40 mx-auto w-full max-w-4xl">
        <nav className="flex items-center justify-between rounded-full bg-white/95 px-6 sm:px-8 py-2.5 shadow-md backdrop-blur-md border border-gray-100">
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0F7A4A] transition-colors cursor-pointer"
            >
              Beranda
            </Link>
            <Link
              href="/tentang-kami"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0F7A4A] transition-colors cursor-pointer"
            >
              Tentang Kami
            </Link>
            <Link
              href="/program"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0F7A4A] transition-colors cursor-pointer"
            >
              Program
            </Link>
            <Link
              href="/galeri"
              className="hidden md:inline-block text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0F7A4A] transition-colors cursor-pointer"
            >
              Galeri
            </Link>
            <Link
              href="/kontak"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0F7A4A] transition-colors cursor-pointer"
            >
              Kontak
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDaftarSekarangClick}
              className="rounded-full bg-[#F59E0B] hover:bg-[#D97706] px-5 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white shadow transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              Daftar Sekarang
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden text-gray-700 hover:text-[#0F7A4A] p-1 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sm:hidden absolute top-14 left-0 right-0 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex flex-col gap-2 z-50 text-center"
            >
              <Link href="/" className="py-2 text-xs font-bold text-gray-700 hover:text-[#0F7A4A]">
                Beranda
              </Link>
              <Link href="/tentang-kami" className="py-2 text-xs font-bold text-gray-700 hover:text-[#0F7A4A]">
                Tentang Kami
              </Link>
              <Link href="/program" className="py-2 text-xs font-bold text-gray-700 hover:text-[#0F7A4A]">
                Program
              </Link>
              <Link href="/galeri" className="py-2 text-xs font-bold text-gray-700 hover:text-[#0F7A4A]">
                Galeri
              </Link>
              <Link href="/kontak" className="py-2 text-xs font-bold text-gray-700 hover:text-[#0F7A4A]">
                Kontak
              </Link>
              <button
                type="button"
                onClick={handleDaftarSekarangClick}
                className="w-full py-2.5 mt-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Daftar Sekarang
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="relative z-20 mx-auto w-full max-w-4xl py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {/* MODAL / INPUT KODE AKSES FORMULIR (SEPERTI SAAT INI PADA HALAMAN PPDB) */}
        <AnimatePresence>
          {showTokenInput && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            >
              <div className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#EAF7ED] via-white to-[#EAF7ED] p-6 sm:p-8 border-2 border-[#0F7A4A]/30 shadow-2xl space-y-4 text-center relative">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center justify-center gap-2 text-[#0F7A4A] font-black text-base sm:text-lg">
                  <KeyRound size={22} className="text-[#0F7A4A]" />
                  <span>Masukkan Kode Akses Formulir Anda</span>
                </div>
                <p className="text-xs text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
                  Kode akses diberikan oleh Panitia SPMB setelah pembayaran uang pendaftaran Anda diverifikasi.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto pt-2">
                  <input
                    type="text"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                    placeholder="Contoh: TK-A8B9C2"
                    className="h-12 w-full text-center sm:text-left rounded-xl border border-[#0F7A4A]/40 bg-white px-4 font-mono font-black text-[#1B365D] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F7A4A]/30 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleValidateToken}
                    disabled={verifyingToken || !inputToken.trim()}
                    className="w-full sm:w-auto shrink-0 bg-[#0F7A4A] hover:bg-[#0d6b41] disabled:opacity-50 text-white font-extrabold text-xs px-6 h-12 rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5"
                  >
                    <ArrowRight size={14} />
                    <span>{verifyingToken ? 'Memeriksa...' : 'Lanjutkan'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── JIKA MODE FULL FORM AKTIF (PENGISIAN BIODATA LENGKAP PPDB DENGAN KODE AKSES) ─── */}
        {fullFormMode ? (
          <div className="w-full rounded-[28px] bg-white p-6 sm:p-10 shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold text-[#0F7A4A] uppercase tracking-widest bg-[#EAF7ED] border border-[#0F7A4A]/20 px-2.5 py-1 rounded-full">
                  Kode Akses: {activeToken || 'Terverifikasi'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B365D] mt-2">
                  {fullFormStep === 2 ? 'Tahap 2: Biodata Lengkap Calon Murid' : 'Tahap 3: Lampiran Berkas Persyaratan'}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {fullFormStep === 2
                    ? 'Lengkapi identitas lengkap ananda dan orang tua / wali.'
                    : 'Unggah berkas akta kelahiran dan KTP orang tua.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw size={12} /> Batal
              </button>
            </div>

            <form ref={formRef} onSubmit={handleFullFormSubmit} className="space-y-6">
              {fullFormStep === 2 && (
                <div className="space-y-6">
                  {/* Identitas Anak */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1B365D] flex items-center gap-2">
                      <User size={15} className="text-[#0F7A4A]" /> 1. Identitas Lengkap Anak
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allFields(CHILD_FORM_SECTIONS).map((field) => (
                        <DynamicField
                          key={field.name}
                          field={field}
                          value={getFieldValue(field.name)}
                          onChange={handleChange}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Identitas Orang Tua */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1B365D] flex items-center gap-2">
                      <Users size={15} className="text-[#0F7A4A]" /> 2. Identitas Orang Tua / Wali
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allFields(FATHER_FORM_SECTIONS).map((field) => (
                        <DynamicField
                          key={field.name}
                          field={field}
                          value={getFieldValue(field.name)}
                          onChange={handleChange}
                        />
                      ))}
                      {allFields(MOTHER_FORM_SECTIONS).map((field) => (
                        <DynamicField
                          key={field.name}
                          field={field}
                          value={getFieldValue(field.name)}
                          onChange={handleChange}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setFullFormMode(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Kembali ke Pembelian
                    </button>
                    <button
                      type="submit"
                      className="bg-[#0F7A4A] hover:bg-[#0d6b41] text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Lanjut ke Unggah Berkas</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {fullFormStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Pas Foto Calon Murid */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 block">
                        Pas Foto Calon Murid <span className="text-xs text-gray-400 font-normal">(Opsional)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-[#0F7A4A] rounded-2xl p-5 bg-[#F8F6F2]/60 text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          id="foto_anak"
                          accept=".png,.pdf,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
                          onChange={(e) => setFotoAnakFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="foto_anak" className="cursor-pointer flex flex-col items-center gap-1.5">
                          <Camera size={24} className="text-[#0F7A4A]" />
                          <span className="text-xs font-bold text-[#1B365D]">
                            {fotoAnakFile ? fotoAnakFile.name : 'Pilih Pas Foto Calon Murid'}
                          </span>
                          <span className="text-[10px] text-gray-400">Format: PNG, PDF, JPG, JPEG (Maks. 10MB)</span>
                        </label>
                      </div>
                    </div>

                    {/* Kartu Keluarga */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 block">
                        Kartu Keluarga (KK) <span className="text-xs text-gray-400 font-normal">(Opsional)</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-[#0F7A4A] rounded-2xl p-5 bg-[#F8F6F2]/60 text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          id="kk"
                          accept=".png,.pdf,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
                          onChange={(e) => setKkFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="kk" className="cursor-pointer flex flex-col items-center gap-1.5">
                          <FileText size={24} className="text-[#0F7A4A]" />
                          <span className="text-xs font-bold text-[#1B365D]">
                            {kkFile ? kkFile.name : 'Pilih berkas Kartu Keluarga'}
                          </span>
                          <span className="text-[10px] text-gray-400">Format: PNG, PDF, JPG, JPEG (Maks. 10MB)</span>
                        </label>
                      </div>
                    </div>

                    {/* Akta Kelahiran */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 block">
                        Akta Kelahiran Anak <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-[#0F7A4A] rounded-2xl p-5 bg-[#F8F6F2]/60 text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          id="akta"
                          accept=".png,.pdf,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
                          onChange={(e) => setAktaFile(e.target.files?.[0] || null)}
                          className="hidden"
                          required
                        />
                        <label htmlFor="akta" className="cursor-pointer flex flex-col items-center gap-1.5">
                          <FileText size={24} className="text-[#0F7A4A]" />
                          <span className="text-xs font-bold text-[#1B365D]">
                            {aktaFile ? aktaFile.name : 'Pilih berkas Akta Kelahiran'}
                          </span>
                          <span className="text-[10px] text-gray-400">Format: PNG, PDF, JPG, JPEG (Maks. 10MB)</span>
                        </label>
                      </div>
                    </div>

                    {/* KTP Orang Tua */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 block">
                        KTP Orang Tua / Wali <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-[#0F7A4A] rounded-2xl p-5 bg-[#F8F6F2]/60 text-center cursor-pointer transition-colors">
                        <input
                          type="file"
                          id="ktp_ortu"
                          accept=".png,.pdf,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
                          onChange={(e) => setKtpFile(e.target.files?.[0] || null)}
                          className="hidden"
                          required
                        />
                        <label htmlFor="ktp_ortu" className="cursor-pointer flex flex-col items-center gap-1.5">
                          <FileText size={24} className="text-[#0F7A4A]" />
                          <span className="text-xs font-bold text-[#1B365D]">
                            {ktpFile ? ktpFile.name : 'Pilih berkas KTP Orang Tua'}
                          </span>
                          <span className="text-[10px] text-gray-400">Format: PNG, PDF, JPG, JPEG (Maks. 10MB)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan */}
                  <div className="bg-[#F8F6F2] rounded-2xl p-4 text-xs space-y-1.5 border border-gray-100 text-gray-600">
                    <div><strong>Calon Murid:</strong> {formData.student_name}</div>
                    <div><strong>Orang Tua:</strong> {formData.parent_name} ({formData.phone})</div>
                    <div><strong>Kode Akses:</strong> <span className="font-mono font-bold text-[#0F7A4A]">{activeToken}</span></div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setFullFormStep(2)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Kembali ke Biodata
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-[#0F7A4A] hover:bg-[#0d6b41] text-white font-black text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>{isPending ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Lengkap'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          /* ─── ALUR REGISTRASI / BELI FORMULIR SESUAI DENGAN 3 GAMBAR USER ─── */
          <div id="registration-form-card" className="space-y-6 scroll-mt-20">
            {/* 3-STEP WIZARD PROGRESS BAR (IDENTIK DENGAN GAMBAR) */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 px-2">
              {/* Step 1: Beli Formulir */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full font-bold text-xs sm:text-sm text-white shadow-xs',
                    regStep >= 1 ? 'bg-[#0F7A4A]' : 'bg-[#8DD0CE]'
                  )}
                >
                  1
                </div>
                <span
                  className={cn(
                    'text-xs sm:text-sm font-bold',
                    regStep >= 1 ? 'text-[#0F7A4A]' : 'text-[#1B365D]'
                  )}
                >
                  Beli Formulir
                </span>
              </div>

              {/* Connector 1 -> 2 */}
              <div
                className={cn(
                  'h-[2px] w-8 sm:w-16 transition-colors',
                  regStep >= 2 ? 'bg-[#0F7A4A]' : 'bg-[#0F7A4A]'
                )}
              />

              {/* Step 2: Pembayaran */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full font-bold text-xs sm:text-sm text-white shadow-xs transition-colors',
                    regStep >= 2 ? 'bg-[#0F7A4A]' : 'bg-[#8DD0CE]'
                  )}
                >
                  2
                </div>
                <span
                  className={cn(
                    'text-xs sm:text-sm font-bold transition-colors',
                    regStep >= 2 ? 'text-[#0F7A4A]' : 'text-[#1B365D]'
                  )}
                >
                  Pembayaran
                </span>
              </div>

              {/* Connector 2 -> 3 */}
              <div
                className={cn(
                  'h-[2px] w-8 sm:w-16 transition-colors',
                  regStep >= 3 ? 'bg-[#0F7A4A]' : 'bg-[#8DD0CE]/60'
                )}
              />

              {/* Step 3: Selesai */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full font-bold text-xs sm:text-sm text-white shadow-xs transition-colors',
                    regStep >= 3 ? 'bg-[#0F7A4A]' : 'bg-[#8DD0CE]'
                  )}
                >
                  3
                </div>
                <span
                  className={cn(
                    'text-xs sm:text-sm font-bold transition-colors',
                    regStep >= 3 ? 'text-[#0F7A4A]' : 'text-[#1B365D]'
                  )}
                >
                  Selesai
                </span>
              </div>
            </div>

            {/* ─── TAHAP 1: ISI DATA PEMBELI FORMULIR (SCREENSHOT 1) ─── */}
            {regStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[28px] bg-white p-6 sm:p-10 shadow-2xl border border-gray-100/80"
              >
                {/* Cloud tab decoration on top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-white rounded-t-full shadow-xs" />

                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
                    Isi Data Pembeli Formulir
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium">
                    Mohon lengkapi data berikut dengan benar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-[#1B365D]">
                        Nama Lengkap Anak
                      </label>
                      <input
                        type="text"
                        value={formData.student_name || ''}
                        onChange={(e) => handleChange('student_name', e.target.value)}
                        placeholder="Contoh: Rizky Alrasyid"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-[#1B365D]">
                        Nama Orang Tua/Wali
                      </label>
                      <input
                        type="text"
                        value={formData.parent_name || ''}
                        onChange={(e) => handleChange('parent_name', e.target.value)}
                        placeholder="Contoh: Agus Mulyana"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-[#1B365D]">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="Contoh: 0812 3456 789"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-[#1B365D]">
                        Email aktif
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="Contoh: agusmul27@gmail.com"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-[#1B365D]">
                        Alamat Lengkap
                      </label>
                      <textarea
                        value={formData.alamat || ''}
                        onChange={(e) => handleChange('alamat', e.target.value)}
                        placeholder="Jl. kemerdekaan No. 45"
                        className={textareaClassName}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-8 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setShowTokenInput(true)}
                    className="text-left group cursor-pointer"
                  >
                    <div className="text-xs sm:text-sm text-gray-700 font-medium">
                      Sudah membeli formulir?
                    </div>
                    <div className="text-xs sm:text-sm text-[#0F7A4A] font-bold group-hover:underline transition-colors">
                      Masukan kode akses!
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToPayment}
                    disabled={savingInitial}
                    className="w-full sm:w-auto bg-[#0F7A4A] hover:bg-[#0d6b41] disabled:opacity-50 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    {savingInitial ? 'Menyimpan Data...' : 'Lanjut ke Pembayaran'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── TAHAP 2: PEMBAYARAN (SCREENSHOT 2) ─── */}
            {regStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-[28px] bg-white p-6 sm:p-10 shadow-2xl border border-gray-100/80"
              >
                {/* Cloud tab decoration on top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-white rounded-t-full shadow-xs" />

                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B365D] tracking-tight">
                    Pembayaran
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 font-medium">
                    Mohon melakukan pembayaran sesuai dengan ketentuan berikut
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Left Column: Rincian, Total, Bank & Upload Bukti */}
                  <div className="space-y-4 flex flex-col justify-between">
                    {/* Breakdown Box */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between text-gray-700 font-medium">
                        <span>Formulir Pendaftaran</span>
                        <span className="font-semibold text-gray-900">{formattedFee}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-700 font-medium">
                        <span>Biaya Admin</span>
                        <span className="font-semibold text-gray-900">Rp 0</span>
                      </div>
                    </div>

                    {/* Total Highlight Box */}
                    <div className="rounded-xl border border-[#7BD39A] bg-[#EAF7ED] p-4 flex items-center justify-between font-bold text-sm sm:text-base">
                      <span className="text-[#1B365D]">Total Pembayaran</span>
                      <span className="text-[#0F7A4A] font-extrabold text-base sm:text-lg">
                        {formattedFee}
                      </span>
                    </div>

                    {/* Bank Account Box */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0">
                          <Image
                            src="/images/bank_muamalat.svg"
                            alt="Bank Muamalat"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-[#1B365D]">{bankName}</div>
                          <div className="font-mono text-sm sm:text-base font-black text-gray-900 tracking-wide">
                            {accountNumber}
                          </div>
                          <div className="text-[11px] text-gray-700 font-semibold">a/n {accountOwner}</div>
                          {accountSubOwner && (
                            <div className="text-[10px] text-gray-500 font-medium leading-tight">
                              ({accountSubOwner})
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyAccount(accountNumber)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                      >
                        <Copy size={12} />
                        <span>Salin</span>
                      </button>
                    </div>

                    {/* Upload Bukti Pembayaran Button */}
                    <div className="relative">
                      <input
                        type="file"
                        id="proof_upload"
                        accept=".png,.pdf,.jpg,.jpeg,image/png,image/jpeg,image/jpg,application/pdf"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label
                        htmlFor="proof_upload"
                        className={cn(
                          'w-full rounded-xl border-2 py-3 px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs',
                          proofFile
                            ? 'border-[#0F7A4A] bg-[#EAF7ED] text-[#0F7A4A]'
                            : 'border-[#0F7A4A]/70 text-[#0F7A4A] bg-white hover:bg-emerald-50/50'
                        )}
                      >
                        <UploadCloud size={18} />
                        <span className="truncate">
                          {proofFile ? proofFile.name : 'Upload Bukti Pembayaran'}
                        </span>
                      </label>
                      <span className="text-[10px] text-gray-400 block text-center mt-1">
                        Format: PNG, PDF, JPG, JPEG (Maks. 10MB)
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Cara Pembayaran & Tombol Berikutnya */}
                  <div className="flex flex-col justify-between">
                    <div className="rounded-xl border border-[#0F7A4A]/70 bg-white p-6 h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#1B365D] mb-5">
                          Cara Pembayaran
                        </h3>

                        <div className="space-y-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F7A4A] text-xs font-bold text-white shadow-xs">
                              1
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed pt-0.5">
                              Transfer ke nomor rekening di samping sebesar {formattedFee}
                            </p>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F7A4A] text-xs font-bold text-white shadow-xs">
                              2
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed pt-0.5">
                              Klik tombol “Upload Bukti” untuk melampirkan bukti pembayaran
                            </p>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F7A4A] text-xs font-bold text-white shadow-xs">
                              3
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed pt-0.5">
                              Klik berikutnya untuk menuju langkah selanjutnya
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tombol Berikutnya */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Kembali
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={handlePurchaseSubmit}
                        className="flex-1 bg-[#0F7A4A] hover:bg-[#0d6b41] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-center"
                      >
                        {isPending ? 'Mengirimkan...' : 'Berikutnya'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── TAHAP 3: SELESAI (SCREENSHOT 3) ─── */}
            {regStep === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[28px] bg-white p-8 sm:p-14 shadow-2xl border border-gray-100/80 max-w-2xl mx-auto text-center flex flex-col items-center"
              >
                {/* Cloud tab decoration on top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-white rounded-t-full shadow-xs" />

                {/* Big Green Circle Checkmark */}
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#0F7A4A] text-white shadow-md mb-6">
                  <Check size={40} strokeWidth={3.5} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#1B365D] tracking-tight">
                  Pembelian Formulir Berhasil
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium">
                  Terimakasih telah melakukan pembelian formulir pendaftaran
                </p>

                {/* WhatsApp Contact Box */}
                <a
                  href={`https://wa.me/${schoolPhone}?text=Halo%20Admin%20PPDB%20TK%20Istiqamah,%20saya%20sudah%20membeli%20formulir%20dan%20mengunggah%20bukti%20pembayaran.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-md rounded-2xl border-2 border-emerald-600/40 bg-[#F2FAF5] p-4 flex items-center justify-center gap-3 my-8 hover:bg-emerald-100/70 transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shrink-0 shadow-xs">
                    <MessageCircle size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-emerald-950">
                      Silahkan hubungi kami jika ada pertanyaan
                    </div>
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span>WhatsApp:</span>
                      <span className="font-mono font-bold text-[#0F7A4A] group-hover:underline">
                        {formattedSchoolPhone}
                      </span>
                      <span className="text-[10px] text-gray-500 font-normal">(Admin SPMB)</span>
                    </div>
                  </div>
                </a>

                <div className="space-y-3 w-full max-w-md">
                  <Link
                    href="/"
                    className="block w-full bg-[#0F7A4A] hover:bg-[#0d6b41] text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    Kembali ke Halaman Awal
                  </Link>

                  {/* Opsi akses jika sudah dapat kode dari admin */}
                  <button
                    type="button"
                    onClick={() => setShowTokenInput(true)}
                    className="w-full py-2.5 text-xs font-bold text-[#0F7A4A] hover:text-[#0d6b41] hover:underline cursor-pointer transition-colors"
                  >
                    Sudah mendapatkan Kode Akses? Masukkan kode di sini
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Subtle Footer note */}
      <footer className="relative z-10 text-center text-[11px] text-gray-700 font-medium py-2">
        KB &amp; TK Istiqamah Bandung &copy; {new Date().getFullYear()} · Portal Resmi SPMB Online
      </footer>
    </div>
  )
}
