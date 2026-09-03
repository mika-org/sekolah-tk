'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  KeyRound,
  RotateCcw,
  Save,
  ShieldCheck,
  Star,
  Upload,
  User,
  Users,
  CreditCard,
  Building2,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'

import { submitPPDB, verifyPpdbToken, purchasePPDBForm } from '@/actions/ppdb'
import { getSettings } from '@/actions/settings'
import { buttonVariants } from '@/components/ui/button'
import {
  allFields,
  CHILD_FORM_SECTIONS,
  FATHER_FORM_SECTIONS,
  MOTHER_FORM_SECTIONS,
  type PPDBFieldDefinition,
} from '@/lib/ppdb/form-definition'
import { cn } from '@/lib/utils'

interface FormState {
  success: boolean
  error: string
  ppdbId: string
  token?: string
  errorStep?: number
}

const initialState: FormState = { success: false, error: '', ppdbId: '' }

const STEPS = [
  { num: 1, label: 'Beli Formulir (Data Awal)', sublabel: 'Data kontak & bukti transfer uang pendaftaran', icon: CreditCard },
  { num: 2, label: 'Biodata Lengkap', sublabel: 'Identitas lengkap anak & orang tua', icon: Users },
  { num: 3, label: 'Lampiran Berkas', sublabel: 'Akta kelahiran, KTP & finalisasi pendaftaran', icon: FileText },
]

const inputClassName =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:border-[#07A363] focus:bg-white focus:ring-2 focus:ring-[#07A363]/10'
const textareaClassName =
  'min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:border-[#07A363] focus:bg-white focus:ring-2 focus:ring-[#07A363]/10'

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
  const [state, setState] = useState<FormState>(initialState)
  const [isPending, setIsPending] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Record<string, string>>({
    payment_method: 'Transfer',
  })
  const [dbSettings, setDbSettings] = useState<any>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [aktaFile, setAktaFile] = useState<File | null>(null)
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Kode Akses Formulir state
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [inputToken, setInputToken] = useState('')
  const [verifyingToken, setVerifyingToken] = useState(false)
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [existingPpdbId, setExistingPpdbId] = useState<string | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false)

  useEffect(() => {
    async function loadSettings() {
      const res = await getSettings()
      if (res.success && res.settings) {
        setDbSettings(res.settings)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Nomor rekening berhasil disalin!')
  }

  // Reset Beli Formulir
  const handleResetForm = () => {
    setFormData({ payment_method: 'Transfer' })
    setProofFile(null)
    setAktaFile(null)
    setKtpFile(null)
    setActiveToken(null)
    setExistingPpdbId(null)
    setInputToken('')
    setShowTokenInput(false)
    setPurchaseSuccess(false)
    setStep(1)
    if (formRef.current) formRef.current.reset()
    toast.info('Formulir berhasil direset ke awal.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Validasi & Gunakan Kode Akses Formulir
  const handleValidateToken = async () => {
    if (!inputToken.trim()) {
      toast.error('Silakan ketikkan kode akses formulir Anda.')
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

        // Isi otomatis data awal dari pendaftaran yang sudah diverifikasi
        setFormData((prev) => ({
          ...prev,
          student_name: d.studentName || '',
          parent_name: d.parentName || '',
          alamat: d.alamat || '',
          phone: d.phone || '',
          email: d.email || '',
          ppdb_id: d.ppdbId || '',
          form_token: d.token || '',
          // Fill existing child data if any
          birth_date: d.childDetails?.birth_date || '',
          nik: d.childDetails?.nik || '',
          nisn: d.childDetails?.nisn || '',
          tempat_lahir: d.childDetails?.tempat_lahir || '',
          jenis_kelamin: d.childDetails?.jenis_kelamin || 'L',
          agama: d.childDetails?.agama || 'Islam',
          anak_ke: String(d.childDetails?.anak_ke || '1'),
          jml_saudara: String(d.childDetails?.jml_saudara || '0'),
          // Ayah
          nama_ayah: d.fatherDetails?.nama_ayah || d.parentName || '',
          nik_ayah: d.fatherDetails?.nik_ayah || '',
          pekerjaan_ayah: d.fatherDetails?.pekerjaan_ayah || '',
          pendidikan_ayah: d.fatherDetails?.pendidikan_ayah || '',
          penghasilan_ayah: d.fatherDetails?.penghasilan_ayah || '',
          hp_ayah: d.fatherDetails?.hp_ayah || d.phone || '',
          // Ibu
          nama_ibu: d.motherDetails?.nama_ibu || '',
          nik_ibu: d.motherDetails?.nik_ibu || '',
          pekerjaan_ibu: d.motherDetails?.pekerjaan_ibu || '',
          pendidikan_ibu: d.motherDetails?.pendidikan_ibu || '',
          penghasilan_ibu: d.motherDetails?.penghasilan_ibu || '',
          hp_ibu: d.motherDetails?.hp_ibu || '',
        }))

        toast.success(`Kode Akses Terverifikasi! Melanjutkan ke Biodata Lengkap ananda ${d.studentName}.`)
        setShowTokenInput(false)
        setStep(2)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err: any) {
      toast.error('Gagal memverifikasi kode akses: ' + err.message)
    } finally {
      setVerifyingToken(false)
    }
  }

  // Handle pembelian formulir (Tahap 1 standalone)
  const handlePurchaseOnly = async () => {
    if (!formData.student_name?.trim()) {
      toast.error('Nama calon anak wajib diisi.')
      return
    }
    if (!formData.parent_name?.trim()) {
      toast.error('Nama orang tua / wali wajib diisi.')
      return
    }
    if (!formData.alamat?.trim()) {
      toast.error('Alamat tempat tinggal wajib diisi.')
      return
    }
    if (!formData.phone?.trim()) {
      toast.error('Kontak WhatsApp / HP yang bisa dihubungi wajib diisi.')
      return
    }
    if (!proofFile) {
      toast.error('Bukti transfer pembayaran uang pendaftaran wajib dilampirkan.')
      return
    }

    const data = new FormData()
    data.append('student_name', formData.student_name)
    data.append('parent_name', formData.parent_name)
    data.append('alamat', formData.alamat)
    data.append('phone', formData.phone)
    data.append('email', formData.email || '')
    data.append('bukti_pembayaran', proofFile)

    const res = await purchasePPDBForm({ success: false, error: '', ppdbId: '' }, data)
    if (res.success) {
      setPurchaseSuccess(true)
      setExistingPpdbId(res.ppdbId)
      toast.success('Pemesanan formulir pendaftaran berhasil dikirim!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error(res.error || 'Gagal mengirim pembelian formulir.')
    }
  }

  const validateStep2 = () => {
    if (!formData.birth_date) {
      toast.error('Tanggal lahir anak wajib diisi.')
      return false
    }
    if (!formData.jenis_kelamin) {
      toast.error('Jenis kelamin anak wajib dipilih.')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.student_name?.trim()) {
        toast.error('Nama lengkap calon anak wajib diisi.')
        return
      }
      if (!formData.parent_name?.trim()) {
        toast.error('Nama orang tua / wali wajib diisi.')
        return
      }
      if (!formData.alamat?.trim()) {
        toast.error('Alamat tempat tinggal wajib diisi.')
        return
      }
      if (!formData.phone?.trim()) {
        toast.error('Kontak WhatsApp / HP yang bisa dihubungi wajib diisi.')
        return
      }
      if (!proofFile && !activeToken) {
        toast.error('Bukti transfer pembayaran uang pendaftaran wajib dilampirkan.')
        return
      }
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (step === 2) {
      if (!validateStep2()) return
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (step === 1) {
      handleNext()
      return
    }
    if (step === 2) {
      handleNext()
      return
    }

    // Step 3 validation
    if (!formData.student_name?.trim()) {
      toast.error('Nama lengkap calon anak wajib diisi.')
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.parent_name?.trim()) {
      toast.error('Nama orang tua / wali wajib diisi.')
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.alamat?.trim()) {
      toast.error('Alamat tempat tinggal wajib diisi.')
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.phone?.trim()) {
      toast.error('Kontak WhatsApp / HP yang bisa dihubungi wajib diisi.')
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!existingPpdbId && !activeToken && !proofFile) {
      toast.error('Bukti transfer pembayaran uang pendaftaran wajib dilampirkan.')
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.birth_date) {
      toast.error('Tanggal lahir anak wajib diisi.')
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (!formData.jenis_kelamin) {
      toast.error('Jenis kelamin anak wajib dipilih.')
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
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

      // Append all formData keys so values from Step 1 and Step 2 are fully preserved
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          data.append(k, String(v))
        }
      })

      // Explicitly set essential keys to avoid missing aliases
      data.set('student_name', (formData.student_name || '').trim())
      data.set('initial_student_name', (formData.student_name || '').trim())
      data.set('nama_lengkap', (formData.student_name || '').trim())
      data.set('parent_name', (formData.parent_name || '').trim())
      data.set('initial_parent_name', (formData.parent_name || '').trim())
      data.set('alamat', (formData.alamat || '').trim())
      data.set('phone', (formData.phone || '').trim())
      data.set('email', (formData.email || '').trim())

      // Append files
      if (proofFile) data.append('bukti_pembayaran', proofFile)
      if (aktaFile) data.append('akta', aktaFile)
      if (ktpFile) data.append('ktp_ortu', ktpFile)

      const res = await submitPPDB(initialState, data)
      setState(res)
      if (res.success) {
        toast.success('Pendaftaran SPMB lengkap berhasil dikirim!')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        toast.error(res.error || 'Terjadi kesalahan saat mengirim pendaftaran.')
        if (res.errorStep) {
          setStep(res.errorStep)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    } catch (err: any) {
      console.error('Submit error:', err)
      toast.error('Gagal mengirim pendaftaran: ' + (err?.message || err))
    } finally {
      setIsPending(false)
    }
  }

  // Tampilan sukses akhir pendaftaran lengkap
  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F0F9F4] via-[#F8F6F2] to-[#EEF2FF] p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg rounded-3xl bg-white p-8 sm:p-10 text-center shadow-xl border border-gray-100 space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 size={44} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-primary-blue">Pendaftaran Lengkap Berhasil Dikirim!</h1>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Seluruh biodata anak, orang tua, dan dokumen persyaratan telah berhasil diterima. Panitia SPMB akan segera memverifikasi berkas dan menghubungi Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-[#F8F6F2] p-4 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-500">ID Registrasi SPMB:</span>
              <span className="font-mono font-black text-[#07A363] text-sm">{state.ppdbId}</span>
            </div>
            {activeToken && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Kode Akses Formulir:</span>
                <span className="font-mono font-black text-purple-700">{activeToken}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-500">Status Berkas:</span>
              <span className="font-bold text-primary-blue">Menunggu Verifikasi Berkas</span>
            </div>
          </div>
          <div className="space-y-2.5">
            <a
              href="https://wa.me/628112198853?text=Halo%20Admin%20SPMB%20TK%20Istiqamah,%20saya%20sudah%20mengirimkan%20berkas%20pendaftaran%20lengkap%20online."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>Konfirmasi Berkas ke WhatsApp Narahubung</span>
            </a>
            <Link
              href="/"
              className={cn(buttonVariants(), 'w-full rounded-xl bg-primary-blue font-bold text-xs py-3 text-white hover:bg-primary-blue/90')}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Tampilan sukses setelah pembelian formulir (menunggu verifikasi pembayaran & kode dari admin)
  if (purchaseSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F0F9F4] via-[#F8F6F2] to-[#EEF2FF] p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg rounded-3xl bg-white p-8 sm:p-10 text-center shadow-xl border border-gray-100 space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
            <CreditCard size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-primary-blue">Pembelian Formulir Diterima!</h1>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Bukti transfer pembayaran uang pendaftaran Anda telah kami terima. Panitia SPMB akan memverifikasi pembayaran dan memberikan <strong>Kode Akses Formulir</strong> melalui WhatsApp untuk membuka pengisian Biodata Lengkap.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-[#F8F6F2] p-4 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-500">ID Registrasi:</span>
              <span className="font-mono font-black text-primary-blue">{existingPpdbId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-500">Status Pembayaran:</span>
              <span className="font-bold text-amber-600">Menunggu Verifikasi Admin</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <a
              href="https://wa.me/628112198853?text=Halo%20Admin%20PPDB%20TK%20Istiqamah,%20saya%20sudah%20melakukan%20pembelian%20formulir%20dan%20unggah%20bukti%20transfer.%20Mohon%20verifikasi%20untuk%20mendapatkan%20Kode%20Akses%20Formulir."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>Konfirmasi Pembayaran ke WA (0811 2198 853)</span>
            </a>
            <button
              onClick={() => {
                setPurchaseSuccess(false)
                setShowTokenInput(true)
              }}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-primary-blue font-bold text-xs py-3 rounded-xl transition-all"
            >
              Sudah Dapat Kode Akses? Masukkan Kode di Sini
            </button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'ghost' }), 'w-full text-xs text-gray-500 font-bold')}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const bankName = dbSettings?.payment_bank_name || 'Bank Mandiri'
  const accountNumber = dbSettings?.payment_account_number || '131-00-1234567-8'
  const accountOwner = dbSettings?.payment_account_name || 'Yayasan Istiqamah Bandung'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] via-[#F8F6F2] to-[#EEF2FF]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary-blue hover:text-primary-green transition-colors"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-[#07A363]">
            <ShieldCheck size={14} className="text-[#07A363]" />
            Portal Pendaftaran Resmi
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        {/* Banner Title */}
        <div className="mb-8 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#07A363]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#07A363]">
            <Star size={12} className="fill-current" /> SPMB ONLINE TAHUN AJARAN 2026/2027
          </div>
          <h1 className="text-3xl font-black tracking-tight text-primary-blue sm:text-5xl">
            Pendaftaran Murid Baru (SPMB)
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
            KB &amp; TK Istiqamah Bandung · Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung
          </p>

          {/* Action Bar: Masukkan Kode Akses & Reset Beli Formulir */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs border',
                showTokenInput
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
              )}
            >
              <KeyRound size={13} />
              <span>Sudah Beli Formulir? Masukkan Kode Akses</span>
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw size={13} />
              <span>Reset Beli Formulir</span>
            </button>
          </div>
        </div>

        {/* Form Input Kode Akses Terbuka */}
        <AnimatePresence>
          {showTokenInput && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 mx-auto max-w-xl rounded-3xl bg-gradient-to-r from-purple-50 via-white to-purple-50 p-6 border-2 border-purple-200 shadow-lg space-y-3 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-purple-700 font-black text-sm">
                <KeyRound size={18} />
                <span>Masukkan Kode Akses Formulir Anda</span>
              </div>
              <p className="text-xs text-gray-500 font-medium max-w-md mx-auto">
                Kode akses diberikan oleh Panitia SPMB setelah pembayaran uang pendaftaran Anda diverifikasi.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto pt-1">
                <input
                  type="text"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                  placeholder="Contoh: TK-A8B9C2"
                  className="h-11 w-full text-center sm:text-left rounded-xl border border-purple-300 bg-white px-3 font-mono font-black text-purple-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
                <button
                  type="button"
                  onClick={handleValidateToken}
                  disabled={verifyingToken || !inputToken.trim()}
                  className="w-full sm:w-auto shrink-0 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-extrabold text-xs px-6 h-11 rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5"
                >
                  <ArrowRight size={14} />
                  <span>{verifyingToken ? 'Memeriksa...' : 'Lanjutkan ke Biodata Lengkap'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3 Step Wizard Progress */}
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STEPS.map((item) => {
            const Icon = item.icon
            const active = item.num === step
            const done = item.num < step
            return (
              <div
                key={item.num}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all text-left',
                  active && 'border-[#07A363] bg-white shadow-md shadow-[#07265F]/5',
                  done && 'border-emerald-200 bg-emerald-50/50',
                  item.num > step && 'border-gray-100 bg-white/40 opacity-60'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold',
                    active || done ? 'bg-[#07A363] text-white' : 'bg-gray-100 text-gray-400'
                  )}
                >
                  {done ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-black text-primary-blue">{item.label}</div>
                  <div className="truncate text-[10px] font-medium text-gray-400">{item.sublabel}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Left Summary Box */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-5 rounded-3xl bg-gradient-to-br from-primary-blue via-[#0c367d] to-primary-blue p-6 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  {React.createElement(STEPS[step - 1].icon, { size: 22 })}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                    Tahap {step} dari {STEPS.length}
                  </div>
                  <div className="font-black text-base">{STEPS[step - 1].label}</div>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs border-t border-white/15">
                <div className="flex justify-between">
                  <span className="text-white/70">Biaya Formulir:</span>
                  <span className="font-extrabold text-emerald-300">Uang Pendaftaran</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Nominal:</span>
                  <span className="font-black text-lg font-mono">Rp 250.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Metode Bayar:</span>
                  <span className="font-bold text-white">Transfer Bank Only</span>
                </div>
                {activeToken && (
                  <div className="flex justify-between pt-1 border-t border-white/10">
                    <span className="text-white/70">Kode Akses:</span>
                    <span className="font-mono font-black text-purple-300 bg-white/10 px-2 py-0.5 rounded">
                      {activeToken}
                    </span>
                  </div>
                )}
              </div>

              {/* Narahubung Konfirmasi Box */}
              <div className="rounded-2xl bg-white/10 p-4 space-y-2 border border-white/15">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <PhoneCall size={14} /> Narahubung Konfirmasi Pembayaran
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                  Ustadzah Admin Keuangan: <strong>0811 2198 853</strong>
                </p>
                <a
                  href="https://wa.me/628112198853?text=Halo%20Bagian%20Keuangan%20TK%20Istiqamah,%20saya%20ingin%20mengonfirmasi%20bukti%20transfer%20pembayaran%20pendaftaran%20SPMB."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm mt-1"
                >
                  <MessageCircle size={14} /> Chat Konfirmasi via WA
                </a>
              </div>
            </div>
          </aside>

          {/* Right Form Card */}
          <div className="lg:col-span-8">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="rounded-[32px] bg-white p-6 sm:p-10 shadow-sm border border-gray-100 space-y-8"
            >
              <input type="hidden" name="current_step" value={step.toString()} />
              <input type="hidden" name="payment_method" value="Transfer" />
              <input type="hidden" name="ppdb_id" value={existingPpdbId || ''} />
              <input type="hidden" name="form_token" value={activeToken || ''} />

              {/* Persist all formData state into DOM so nothing is lost between step transitions */}
              {Object.entries(formData).map(([k, v]) => {
                if (step === 1 && ['student_name', 'parent_name', 'alamat', 'phone', 'email'].includes(k)) return null
                return <input key={`persist_${k}`} type="hidden" name={k} value={v || ''} />
              })}

              {state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{state.error}</span>
                </div>
              )}

              {/* ─── TAHAP 1: BELI FORMULIR (DATA AWAL & TRANSFER) ─── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-black text-primary-blue">Tahap 1: Beli Formulir (Data Awal)</h2>
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        Isi data kontak awal dan unggah bukti transfer Rp 250.000 untuk memperoleh Kode Akses Formulir.
                      </p>
                    </div>
                  </div>

                  {/* Data Awal Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        Nama Lengkap Calon Anak <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="student_name"
                        value={formData.student_name || ''}
                        onChange={(e) => handleChange('student_name', e.target.value)}
                        placeholder="Contoh: Muhammad Althaf Syahputra"
                        className={inputClassName}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        Nama Orang Tua / Wali <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="parent_name"
                        value={formData.parent_name || ''}
                        onChange={(e) => handleChange('parent_name', e.target.value)}
                        placeholder="Nama Ayah / Ibu"
                        className={inputClassName}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        No. WhatsApp / HP yang Bisa Dihubungi <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className={inputClassName}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Email Aktif Orang Tua</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="email@orangtua.com"
                        className={inputClassName}
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">
                        Alamat Tempat Tinggal Lengkap <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="alamat"
                        value={formData.alamat || ''}
                        onChange={(e) => handleChange('alamat', e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
                        className={textareaClassName}
                        required
                      />
                    </div>
                  </div>

                  {/* Informasi Pembayaran: Transfer Bank & Bukti Transfer */}
                  <div className="bg-[#F8F6F2] rounded-3xl p-6 border border-gray-200/70 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary-blue font-black text-sm">
                        <Building2 size={18} className="text-primary-green" />
                        <span>Pembayaran Uang Pendaftaran (Hanya Transfer Bank)</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                        Biaya Registrasi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1">
                        <span className="text-gray-400 font-semibold">Bank Tujuan:</span>
                        <p className="font-extrabold text-primary-blue text-sm">{bankName}</p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1">
                        <span className="text-gray-400 font-semibold">Nomor Rekening:</span>
                        <div className="flex items-center justify-between">
                          <p className="font-black text-primary-blue font-mono text-sm">{accountNumber}</p>
                          <button
                            type="button"
                            onClick={() => handleCopyAccount(accountNumber)}
                            className="text-primary-green hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Copy size={13} /> Salin
                          </button>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-1 sm:col-span-2">
                        <span className="text-gray-400 font-semibold">Atas Nama Rekening:</span>
                        <p className="font-bold text-primary-blue">{accountOwner}</p>
                      </div>
                    </div>

                    {/* Upload Bukti Bayar */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-gray-700 block">
                        Unggah Bukti Transfer Pembayaran <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-primary-green rounded-2xl p-4 bg-white text-center cursor-pointer">
                        <input
                          type="file"
                          id="upload-bukti"
                          name="bukti_pembayaran"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label htmlFor="upload-bukti" className="cursor-pointer flex flex-col items-center gap-1">
                          <Upload size={20} className="text-primary-green" />
                          <span className="text-xs font-bold text-primary-blue">
                            {proofFile ? proofFile.name : 'Pilih foto atau dokumen bukti transfer (JPG / PNG / PDF)'}
                          </span>
                          <span className="text-[10px] text-gray-400">Ukuran maksimal 2 MB</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handlePurchaseOnly}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3.5 rounded-full transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard size={16} />
                      <span>Kirim Pemesanan Formulir Saja</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold text-xs px-8 py-3.5 rounded-full transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Lanjut Isi Biodata Lengkap</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAHAP 2: BIODATA LENGKAP (IDENTITAS ANAK & IDENTITAS ORANG TUA) ─── */}
              {/* Note: "3. Riwayat Tumbuh Kembang & Kesehatan" ditutup/ditiadakan sesuai permintaan user */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-black text-primary-blue">Tahap 2: Biodata Lengkap Calon Murid</h2>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      Lengkapi data identitas lengkap anak dan identitas orang tua (ayah &amp; ibu).
                    </p>
                  </div>

                  {/* Bagian 1: Identitas Lengkap Anak */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-blue flex items-center gap-2">
                      <User size={15} className="text-[#07A363]" /> 1. Identitas Lengkap Anak
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allFields(CHILD_FORM_SECTIONS).map((field) => {
                        if (field.name === 'student_name' || field.name === 'alamat') return null
                        return (
                          <DynamicField
                            key={field.name}
                            field={field}
                            value={formData[field.name]}
                            onChange={handleChange}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Bagian 2: Identitas Orang Tua (Ayah & Ibu) */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-blue flex items-center gap-2">
                      <Users size={15} className="text-[#07A363]" /> 2. Identitas Orang Tua / Wali
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allFields(FATHER_FORM_SECTIONS).map((field) => (
                        <DynamicField
                          key={field.name}
                          field={field}
                          value={formData[field.name]}
                          onChange={handleChange}
                        />
                      ))}
                      {allFields(MOTHER_FORM_SECTIONS).map((field) => (
                        <DynamicField
                          key={field.name}
                          field={field}
                          value={formData[field.name]}
                          onChange={handleChange}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-6 py-3.5 rounded-full transition-all cursor-pointer"
                    >
                      Kembali ke Tahap 1
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold text-xs px-8 py-3.5 rounded-full transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Lanjut ke Unggah Berkas</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAHAP 3: LAMPIRAN BERKAS & FINALISASI ─── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-black text-primary-blue">Tahap 3: Lampiran Berkas Persyaratan</h2>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      Unggah berkas dokumen akta kelahiran anak dan kartu tanda penduduk (KTP) orang tua.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Akta Kelahiran */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">
                        Akta Kelahiran Anak <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-primary-green rounded-2xl p-5 bg-[#F8F6F2]/60 text-center cursor-pointer">
                        <input
                          type="file"
                          id="akta"
                          name="akta"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setAktaFile(e.target.files?.[0] || null)}
                          className="hidden"
                          required
                        />
                        <label htmlFor="akta" className="cursor-pointer flex flex-col items-center gap-1.5">
                          <FileText size={24} className="text-primary-green" />
                          <span className="text-xs font-bold text-primary-blue">
                            {aktaFile ? aktaFile.name : 'Pilih berkas Akta Kelahiran'}
                          </span>
                          <span className="text-[10px] text-gray-400">Format: JPG, PNG, PDF (Maks. 2MB)</span>
                        </label>
                      </div>
                    </div>

                    {/* KTP Orang Tua */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">
                        KTP Orang Tua / Wali <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-primary-green rounded-2xl p-5 bg-[#F8F6F2]/60 text-center cursor-pointer">
                        <input
                          type="file"
                          id="ktp_ortu"
                          name="ktp_ortu"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setKtpFile(e.target.files?.[0] || null)}
                          className="hidden"
                          required
                        />
                        <label htmlFor="ktp_ortu" className="cursor-pointer flex flex-col items-center gap-1.5">
                          <FileText size={24} className="text-primary-green" />
                          <span className="text-xs font-bold text-primary-blue">
                            {ktpFile ? ktpFile.name : 'Pilih berkas KTP Orang Tua'}
                          </span>
                          <span className="text-[10px] text-gray-400">Format: JPG, PNG, PDF (Maks. 2MB)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Summary Ringkasan Data */}
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3 text-xs border border-gray-200/70">
                    <h4 className="font-extrabold text-primary-blue uppercase tracking-wider">Ringkasan Pendaftaran:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                      <div>
                        <strong>Nama Anak:</strong> {formData.student_name}
                      </div>
                      <div>
                        <strong>Nama Orang Tua:</strong> {formData.parent_name}
                      </div>
                      <div>
                        <strong>No. Kontak / WA:</strong> {formData.phone}
                      </div>
                      <div>
                        <strong>Biaya Pendaftaran:</strong> Rp 250.000 (Transfer Bank)
                      </div>
                      {activeToken && (
                        <div>
                          <strong>Kode Akses Formulir:</strong> <span className="font-mono text-purple-700 font-bold">{activeToken}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-6 py-3.5 rounded-full transition-all cursor-pointer"
                    >
                      Kembali ke Tahap 2
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-primary-green hover:bg-primary-green/90 text-white font-black text-xs px-10 py-3.5 rounded-full transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Save size={16} />
                      <span>{isPending ? 'Mengirimkan Pendaftaran...' : 'Kirim Pendaftaran Lengkap'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
