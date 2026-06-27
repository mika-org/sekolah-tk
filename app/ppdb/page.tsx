'use client'

import React, { useState, useActionState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { submitPPDB } from '@/actions/ppdb'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Hash,
  Heart,
  Home,
  Star,
  BookOpen,
  ShieldCheck,
  Banknote,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FormState {
  success: boolean
  error: string
  ppdbId: string
}

const initialState: FormState = { success: false, error: '', ppdbId: '' }

const STEPS = [
  { num: 1, label: 'Data Anak', sublabel: 'Identitas calon siswa', icon: User },
  { num: 2, label: 'Data Orang Tua', sublabel: 'Identitas ayah & ibu', icon: Users },
  { num: 3, label: 'Berkas & Bayar', sublabel: 'Dokumen & pembayaran', icon: FileText },
]

function FieldGroup({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#07A363]/10 flex items-center justify-center flex-shrink-0">
          <Icon size={14} className="text-[#07A363]" />
        </div>
        <span className="text-[11px] font-extrabold text-[#07265F] uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </div>
  )
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-400 font-medium">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputCls = "bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#07A363] focus:ring-2 focus:ring-[#07A363]/10 rounded-xl text-sm font-medium h-11 transition-all placeholder:text-gray-300 outline-none"
const selectTriggerCls = "bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#07A363]/10 rounded-xl text-sm font-medium h-11 hover:bg-white transition-all"

export default function PPDBPage() {
  const [step, setStep] = useState(1)
  const [state, formAction, isPending] = useActionState(submitPPDB, initialState)
  const [paymentMethod, setPaymentMethod] = useState('Transfer')
  const [copiedBank, setCopiedBank] = useState<string | null>(null)
  const formRef = React.useRef<HTMLFormElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({})

  useEffect(() => {
    if (state?.error) {
      setStep(3)
    }
  }, [state])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [id]: file.name }))
    } else {
      setSelectedFiles(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        e.preventDefault()
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (step !== 3) {
      e.preventDefault()
      return
    }
    const confirmSend = window.confirm('Apakah Anda yakin data yang diisi sudah benar dan ingin mengirim pendaftaran?')
    if (!confirmSend) {
      e.preventDefault()
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedBank(text)
    toast.success(`${label} disalin!`, { description: text, duration: 2500 })
    setTimeout(() => setCopiedBank(null), 2500)
  }

  const getField = (name: string) => {
    if (!formRef.current) return ''
    const fd = new FormData(formRef.current)
    return (fd.get(name) as string) || ''
  }

  const nextStep = () => {
    if (step === 1) {
      const name = getField('student_name').trim()
      const date = getField('birth_date')
      if (!name) { toast.error('Nama lengkap anak wajib diisi!'); return }
      if (!date) { toast.error('Tanggal lahir wajib diisi!'); return }
    }
    if (step === 2) {
      const namaAyah = getField('nama_ayah').trim()
      const hpAyah = getField('hp_ayah').trim()
      const namaIbu = getField('nama_ibu').trim()
      const hpIbu = getField('hp_ibu').trim()
      if (!namaAyah && !namaIbu) { toast.error('Isi minimal satu identitas orang tua!'); return }
      if (namaAyah && !hpAyah) { toast.error('No. HP Ayah wajib diisi!'); return }
      if (namaIbu && !hpIbu) { toast.error('No. HP Ibu wajib diisi!'); return }
    }
    setStep(p => Math.min(p + 1, 3))
  }

  const prevStep = () => setStep(p => Math.max(p - 1, 1))

  const toUpper = (e: React.FormEvent<HTMLInputElement>) => {
    const t = e.currentTarget
    const pos = t.selectionStart
    t.value = t.value.toUpperCase()
    t.setSelectionRange(pos, pos)
  }
  const toUpperTA = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget
    const pos = t.selectionStart
    t.value = t.value.toUpperCase()
    t.setSelectionRange(pos, pos)
  }

  if (state?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] via-[#F8F6F2] to-[#EEF2FF] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 max-w-md w-full text-center space-y-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#07A363] to-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#07A363]/25">
            <CheckCircle2 size={52} className="text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#07265F]">Pendaftaran Berhasil! 🎉</h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Formulir ananda telah kami terima. Tim Admin akan menghubungi Anda dalam 1–2 hari kerja.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#07265F]/5 to-[#07A363]/5 rounded-2xl p-4 text-left space-y-3 border border-gray-100">
            <div className="text-[10px] font-extrabold text-[#07265F] uppercase tracking-widest">Informasi Registrasi</div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">ID Registrasi</span>
              <span className="font-mono text-xs font-extrabold text-[#07A363]">{state.ppdbId || '–'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">Menunggu Verifikasi</span>
            </div>
          </div>

          <Link href="/" className={cn(buttonVariants(), "bg-[#07265F] hover:bg-[#07265F]/90 text-white w-full rounded-xl font-bold py-3 text-sm")}>
            Kembali ke Beranda
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] via-[#F8F6F2] to-[#EEF2FF]">
      {/* TOP NAV */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#07265F] hover:text-[#07A363] transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-400">
            <ShieldCheck size={14} className="text-[#07A363]" />
            Data Anda Aman & Terenkripsi
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* HERO HEADER */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#07A363]/10 text-[#07A363] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest">
            <Star size={12} className="fill-current" />
            Tahun Ajaran 2026 / 2027
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#07265F] tracking-tight leading-tight">
            Pendaftaran Siswa Baru
          </h1>
          <p className="text-gray-500 font-medium text-sm max-w-lg mx-auto leading-relaxed">
            Bergabunglah bersama keluarga besar <span className="font-bold text-[#07265F]">KB & TK Istiqamah</span>. Lengkapi formulir berikut dengan data yang benar.
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            const done = step > s.num
            const current = step === s.num
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => s.num < step && !isPending && setStep(s.num)}
                  disabled={s.num > step || isPending}
                  className={cn(
                    "flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                    current ? "bg-white shadow-lg shadow-[#07265F]/10 border border-gray-100 scale-105" : "",
                    s.num < step ? "cursor-pointer opacity-70 hover:opacity-100" : "",
                    s.num > step ? "opacity-40 cursor-not-allowed" : "",
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold transition-all duration-300",
                    current ? "bg-gradient-to-br from-[#07A363] to-emerald-400 text-white shadow-md shadow-[#07A363]/25" :
                    done ? "bg-[#07265F] text-white" :
                    "bg-gray-100 text-gray-400"
                  )}>
                    {done ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className={cn("text-xs font-extrabold", current ? "text-[#07265F]" : done ? "text-[#07265F]" : "text-gray-400")}>{s.label}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{s.sublabel}</div>
                  </div>
                  <div className={cn("text-[10px] font-bold sm:hidden", current ? "text-[#07265F]" : done ? "text-[#07265F]" : "text-gray-400")}>{s.label}</div>
                </button>

                {idx < STEPS.length - 1 && (
                  <div className="flex-1 max-w-[60px] px-2">
                    <div className="h-0.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className={cn("h-full rounded-full bg-[#07A363] transition-all duration-500", step > s.num ? "w-full" : "w-0")} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* MAIN LAYOUT: Sidebar + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* LEFT SIDEBAR INFO */}
          <div className="lg:col-span-4 space-y-4">
            {/* Current Step Info Card */}
            <div className="bg-gradient-to-br from-[#07265F] to-[#0a3580] rounded-3xl p-6 text-white shadow-xl shadow-[#07265F]/20 space-y-4 sticky top-24">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  {step === 1 && <User size={20} />}
                  {step === 2 && <Users size={20} />}
                  {step === 3 && <FileText size={20} />}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Langkah {step} dari 3</div>
                  <div className="font-extrabold text-base">{STEPS[step - 1].label}</div>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] text-white/50 font-bold mb-2">
                  <span>Progress Pengisian</span>
                  <span>{Math.round(((step - 1) / 3) * 100 + 10)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#07A363] to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${((step - 1) / 3) * 100 + 10}%` }}
                  />
                </div>
              </div>

              {/* Step instructions */}
              <div className="space-y-2.5 pt-1">
                {step === 1 && [
                  'Isi nama lengkap sesuai akta lahir',
                  'Tanggal lahir & jenis kelamin wajib',
                  'NIK & NISN boleh dikosongkan',
                  'Alamat tempat tinggal saat ini',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[11px] text-white/75 font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#07A363]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={9} className="text-[#07A363]" />
                    </div>
                    {tip}
                  </div>
                ))}
                {step === 2 && [
                  'Isi minimal satu dari ayah atau ibu',
                  'No. HP WhatsApp wajib diisi',
                  'Email untuk penerimaan notifikasi',
                  'Alamat kosongkan jika sama dengan anak',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[11px] text-white/75 font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#07A363]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={9} className="text-[#07A363]" />
                    </div>
                    {tip}
                  </div>
                ))}
                {step === 3 && [
                  'Unggah dokumen berformat JPG/PNG/PDF',
                  'Ukuran maksimal tiap berkas 2MB',
                  'Lakukan transfer sebelum kirim',
                  'Sertakan bukti pembayaran yang jelas',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[11px] text-white/75 font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#07A363]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={9} className="text-[#07A363]" />
                    </div>
                    {tip}
                  </div>
                ))}
              </div>

              {/* School Info */}
              <div className="h-px bg-white/10" />
              <div className="text-[10px] text-white/40 font-medium space-y-1 leading-relaxed">
                <div className="font-bold text-white/60">KB & TK Istiqamah Bandung</div>
                <div>📍 Jl. Istiqamah No. 1, Bandung</div>
                <div>📞 (022) 1234-5678</div>
                <div>🕐 Senin – Jumat, 08.00 – 15.00</div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-[#07265F] text-base">{STEPS[step - 1].label}</h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{STEPS[step - 1].sublabel}</p>
                </div>
                <div className="text-xs font-extrabold text-gray-300">
                  {step} / 3
                </div>
              </div>

              <form action={formAction} ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
                <input type="hidden" name="current_step" value={step} />
                {isPending && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#07A363] animate-spin" />
                    <div className="text-sm font-bold text-[#07265F]">Memproses Pendaftaran...</div>
                    <div className="text-xs text-gray-400 font-medium">Mohon tunggu, berkas sedang diunggah.</div>
                  </div>
                )}
                {state?.error && (
                  <div className="mx-8 mt-6 p-3 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {state.error}
                  </div>
                )}

                {/* ─── STEP 1: DATA ANAK ─── */}
                <div className={cn("p-8 space-y-7", step !== 1 && "hidden")}>
                  {/* Data Utama */}
                  <FieldGroup icon={User} title="Data Utama Anak">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <FormField label="Nama Lengkap Anak" required hint="Sesuai akta lahir">
                          <input
                            id="student_name" name="student_name"
                            defaultValue=""
                            onInput={toUpper}
                            placeholder="Contoh: Muhammad Al-Fatih"
                            className={cn(inputCls, 'uppercase w-full px-3')}
                          />
                        </FormField>
                      </div>
                      <FormField label="Jenis Kelamin">
                        <select
                          name="jenis_kelamin"
                          defaultValue="L"
                          className={cn(selectTriggerCls, 'w-full px-3 cursor-pointer')}
                        >
                          <option value="L">👦 Laki-laki</option>
                          <option value="P">👧 Perempuan</option>
                        </select>
                      </FormField>
                      <FormField label="Agama">
                        <select
                          name="agama"
                          defaultValue="Islam"
                          className={cn(selectTriggerCls, 'w-full px-3 cursor-pointer')}
                        >
                          <option value="Islam">Islam</option>
                          <option value="Kristen">Kristen</option>
                          <option value="Katolik">Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Budha">Budha</option>
                        </select>
                      </FormField>
                    </div>
                  </FieldGroup>

                  {/* Kelahiran */}
                  <FieldGroup icon={Calendar} title="Data Kelahiran">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField label="Tempat Lahir">
                        <input
                          id="tempat_lahir" name="tempat_lahir"
                          defaultValue=""
                          onInput={toUpper}
                          placeholder="Contoh: Bandung"
                          className={cn(inputCls, 'uppercase w-full px-3')}
                        />
                      </FormField>
                      <FormField label="Tanggal Lahir" required>
                        <input
                          id="birth_date" name="birth_date" type="date"
                          defaultValue=""
                          className={cn(inputCls, 'w-full px-3')}
                        />
                      </FormField>
                    </div>
                  </FieldGroup>

                  {/* Identitas */}
                  <FieldGroup icon={Hash} title="Nomor Identitas (Opsional)">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField label="NIK Anak" hint="16 digit">
                        <input
                          id="nik" name="nik" maxLength={16}
                          defaultValue=""
                          placeholder="Contoh: 3273..."
                          className={cn(inputCls, 'w-full px-3')}
                        />
                      </FormField>
                      <FormField label="NISN Anak" hint="10 digit, jika ada">
                        <input
                          id="nisn" name="nisn" maxLength={10}
                          defaultValue=""
                          placeholder="Contoh: 0152..."
                          className={cn(inputCls, 'w-full px-3')}
                        />
                      </FormField>
                    </div>
                  </FieldGroup>

                  {/* Keluarga */}
                  <FieldGroup icon={Heart} title="Data Keluarga">
                    <div className="grid grid-cols-2 gap-5">
                      <FormField label="Anak Ke–">
                        <input
                          id="anak_ke" name="anak_ke" type="number" min={1}
                          defaultValue="1"
                          className={cn(inputCls, 'w-full px-3')}
                        />
                      </FormField>
                      <FormField label="Jumlah Saudara">
                        <input
                          id="jml_saudara" name="jml_saudara" type="number" min={0}
                          defaultValue="0"
                          className={cn(inputCls, 'w-full px-3')}
                        />
                      </FormField>
                    </div>
                  </FieldGroup>

                  {/* Alamat */}
                  <FieldGroup icon={Home} title="Alamat Tempat Tinggal">
                    <textarea
                      id="alamat" name="alamat"
                      defaultValue=""
                      onInput={toUpperTA}
                      rows={3}
                      placeholder="Alamat lengkap RT/RW, Kelurahan, Kecamatan, Kota..."
                      className="uppercase w-full px-3 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#07A363] focus:ring-2 focus:ring-[#07A363]/10 rounded-xl text-sm font-medium resize-none transition-all placeholder:text-gray-300 outline-none"
                    />
                  </FieldGroup>
                </div>

                {/* ─── STEP 2: DATA ORANG TUA ─── */}
                <div className={cn("p-8 space-y-8", step !== 2 && "hidden")}>
                  {/* AYAH */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="w-8 h-8 bg-[#07265F] rounded-xl flex items-center justify-center">
                        <User size={15} className="text-white" />
                      </div>
                      <div>
                        <div className="font-extrabold text-[#07265F] text-sm">Identitas Ayah Kandung</div>
                        <div className="text-[10px] text-gray-500 font-medium">Kosongkan semua jika tidak ada</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField label="Nama Lengkap Ayah">
                        <input id="nama_ayah" name="nama_ayah" defaultValue="" onInput={toUpper} placeholder="Nama beserta gelar" className={cn(inputCls, 'uppercase w-full px-3')} />
                      </FormField>
                      <FormField label="Pekerjaan">
                        <input id="pekerjaan_ayah" name="pekerjaan_ayah" defaultValue="" onInput={toUpper} placeholder="Contoh: Karyawan Swasta" className={cn(inputCls, 'uppercase w-full px-3')} />
                      </FormField>
                      <FormField label="No. HP / WhatsApp">
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="hp_ayah" name="hp_ayah" defaultValue="" placeholder="0812 xxxx xxxx" className={cn(inputCls, 'w-full pl-9 pr-3')} />
                        </div>
                      </FormField>
                      <FormField label="Email">
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="email_ayah" name="email_ayah" type="email" defaultValue="" placeholder="ayah@email.com" className={cn(inputCls, 'w-full pl-9 pr-3')} />
                        </div>
                      </FormField>
                      <FormField label="Estimasi Penghasilan Bulanan">
                        <select name="penghasilan_ayah" defaultValue="3jt - 5jt" className={cn(selectTriggerCls, 'w-full px-3 cursor-pointer')}>
                          <option value="Dibawah 3jt">Di bawah Rp 3.000.000</option>
                          <option value="3jt - 5jt">Rp 3.000.000 – Rp 5.000.000</option>
                          <option value="5jt - 10jt">Rp 5.000.000 – Rp 10.000.000</option>
                          <option value="Diatas 10jt">Di atas Rp 10.000.000</option>
                        </select>
                      </FormField>
                      <FormField label="Alamat Ayah" hint="Kosongkan jika sama">
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="alamat_ayah" name="alamat_ayah" defaultValue="" onInput={toUpper} placeholder="Alamat lengkap..." className={cn(inputCls, 'uppercase w-full pl-9 pr-3')} />
                        </div>
                      </FormField>
                    </div>
                  </div>

                  {/* IBU */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100">
                      <div className="w-8 h-8 bg-pink-500 rounded-xl flex items-center justify-center">
                        <User size={15} className="text-white" />
                      </div>
                      <div>
                        <div className="font-extrabold text-pink-700 text-sm">Identitas Ibu Kandung</div>
                        <div className="text-[10px] text-gray-500 font-medium">Kosongkan semua jika tidak ada</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField label="Nama Lengkap Ibu">
                        <input id="nama_ibu" name="nama_ibu" defaultValue="" onInput={toUpper} placeholder="Nama beserta gelar" className={cn(inputCls, 'uppercase w-full px-3')} />
                      </FormField>
                      <FormField label="Pekerjaan">
                        <input id="pekerjaan_ibu" name="pekerjaan_ibu" defaultValue="" onInput={toUpper} placeholder="Contoh: Ibu Rumah Tangga" className={cn(inputCls, 'uppercase w-full px-3')} />
                      </FormField>
                      <FormField label="No. HP / WhatsApp">
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="hp_ibu" name="hp_ibu" defaultValue="" placeholder="0857 xxxx xxxx" className={cn(inputCls, 'w-full pl-9 pr-3')} />
                        </div>
                      </FormField>
                      <FormField label="Email">
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="email_ibu" name="email_ibu" type="email" defaultValue="" placeholder="ibu@email.com" className={cn(inputCls, 'w-full pl-9 pr-3')} />
                        </div>
                      </FormField>
                      <FormField label="Estimasi Penghasilan Bulanan">
                        <select name="penghasilan_ibu" defaultValue="3jt - 5jt" className={cn(selectTriggerCls, 'w-full px-3 cursor-pointer')}>
                          <option value="Dibawah 3jt">Di bawah Rp 3.000.000</option>
                          <option value="3jt - 5jt">Rp 3.000.000 – Rp 5.000.000</option>
                          <option value="5jt - 10jt">Rp 5.000.000 – Rp 10.000.000</option>
                          <option value="Diatas 10jt">Di atas Rp 10.000.000</option>
                        </select>
                      </FormField>
                      <FormField label="Alamat Ibu" hint="Kosongkan jika sama">
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input id="alamat_ibu" name="alamat_ibu" defaultValue="" onInput={toUpper} placeholder="Alamat lengkap..." className={cn(inputCls, 'uppercase w-full pl-9 pr-3')} />
                        </div>
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* ─── STEP 3: DOKUMEN & PEMBAYARAN ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={step === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.25 }}
                  className={cn("p-8 space-y-8", step !== 3 && "hidden")}
                >
                  {/* BERKAS */}
                  <FieldGroup icon={BookOpen} title="Berkas Dokumen Pendukung">
                    <p className="text-xs text-gray-400 font-medium -mt-2">Format JPG, PNG, atau PDF · Maksimal 2MB per berkas</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { id: 'kk', label: 'Kartu Keluarga', sub: 'KK Seluruh keluarga' },
                        { id: 'akta', label: 'Akta Kelahiran', sub: getField('student_name') ? `Akta ${getField('student_name')}` : 'Akta anak yang didaftarkan' },
                        { id: 'foto_anak', label: 'Foto Anak', sub: getField('student_name') ? `Pas foto 3×4 ${getField('student_name')}` : 'Pas foto 3×4, tampak depan' },
                        { id: 'ktp_ayah', label: 'KTP Ayah', sub: getField('nama_ayah') ? `KTP Ayah: ${getField('nama_ayah')}` : 'KTP Ayah yang masih berlaku' },
                        { id: 'ktp_ibu', label: 'KTP Ibu', sub: getField('nama_ibu') ? `KTP Ibu: ${getField('nama_ibu')}` : 'KTP Ibu yang masih berlaku' },
                      ].map((doc) => {
                        const isSelected = !!selectedFiles[doc.id]
                        return (
                          <div key={doc.id} className="group relative">
                            <label htmlFor={doc.id} className="block cursor-pointer">
                              <div className={cn(
                                "border-2 border-dashed rounded-2xl p-5 flex flex-col items-center gap-2.5 text-center transition-all duration-200 h-32 justify-center",
                                isSelected
                                  ? "border-[#07A363] bg-[#07A363]/[0.02]"
                                  : "border-gray-200 group-hover:border-[#07A363] group-hover:bg-[#07A363]/[0.02]"
                              )}>
                                <div className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                  isSelected ? "bg-[#07A363]/10" : "bg-gray-100 group-hover:bg-[#07A363]/10"
                                )}>
                                  {isSelected ? (
                                    <Check size={16} className="text-[#07A363]" />
                                  ) : (
                                    <Upload size={16} className="text-gray-400 group-hover:text-[#07A363] transition-colors" />
                                  )}
                                </div>
                                <div className="min-w-0 w-full px-1">
                                  <div className="text-xs font-extrabold text-[#07265F] truncate">{doc.label}</div>
                                  <div className="text-[9px] text-gray-400 font-medium mt-0.5 truncate px-1">
                                    {isSelected ? selectedFiles[doc.id] : doc.sub}
                                  </div>
                                </div>
                              </div>
                              <Input
                                id={doc.id}
                                name={doc.id}
                                type="file"
                                onChange={(e) => handleFileChange(e, doc.id)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              />
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </FieldGroup>

                  {/* BIAYA */}
                  <FieldGroup icon={Banknote} title="Biaya Pendaftaran">
                    <div className="bg-gradient-to-br from-[#07A363] to-emerald-400 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-[#07A363]/20">
                      <div>
                        <div className="font-extrabold text-base">Uang Pangkal Registrasi</div>
                        <div className="text-white/70 text-xs font-medium mt-0.5 leading-relaxed">Verifikasi berkas · Tes kesiapan belajar · Administrasi siswa baru</div>
                      </div>
                      <div className="text-3xl font-black tracking-tight shrink-0">Rp 250.000</div>
                    </div>
                  </FieldGroup>

                  {/* METODE PEMBAYARAN */}
                  <FieldGroup icon={Wallet} title="Metode Pembayaran">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'Transfer', icon: '🏦', label: 'Bank Transfer' },
                        { value: 'QRIS', icon: '📱', label: 'QRIS / E-Wallet' },
                        { value: 'Cash', icon: '💵', label: 'Tunai ke Sekolah' },
                      ].map(m => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setPaymentMethod(m.value)}
                          className={cn(
                            "p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center transition-all duration-200 cursor-pointer",
                            paymentMethod === m.value
                              ? "border-[#07A363] bg-[#07A363]/5 shadow-sm"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          )}
                        >
                          <span className="text-xl">{m.icon}</span>
                          <span className={cn("text-[10px] font-extrabold leading-tight", paymentMethod === m.value ? "text-[#07A363]" : "text-gray-500")}>{m.label}</span>
                          {paymentMethod === m.value && <input type="hidden" name="payment_method" value={m.value} />}
                        </button>
                      ))}
                    </div>
                    {/* Hidden fallback for payment method */}
                    <input type="hidden" name="payment_method" value={paymentMethod} />

                    {/* Transfer Info */}
                    {paymentMethod === 'Transfer' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-2">
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Rekening Tujuan Yayasan Istiqamah</div>
                        {[
                          { bank: 'BSI Syariah', norek: '711 0023 234', raw: '7110023234', color: 'text-[#07A363]', bg: 'bg-[#07A363]/5', border: 'border-[#07A363]/20' },
                          { bank: 'Bank Mandiri', norek: '149 00 12345 678', raw: '1490012345678', color: 'text-[#07265F]', bg: 'bg-[#07265F]/5', border: 'border-[#07265F]/20' },
                        ].map(bk => (
                          <div key={bk.bank} className={cn("flex items-center justify-between p-4 rounded-2xl border", bk.bg, bk.border)}>
                            <div className="space-y-0.5">
                              <div className={cn("text-[10px] font-extrabold uppercase tracking-wider", bk.color)}>{bk.bank}</div>
                              <div className="font-mono font-extrabold text-lg text-[#07265F] tracking-widest">{bk.norek}</div>
                              <div className="text-[10px] text-gray-400 font-medium">a.n. Yayasan Istiqamah Balikpapan</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(bk.raw, `No. Rek ${bk.bank}`)}
                              className="p-2.5 rounded-xl text-gray-400 hover:text-[#07A363] hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-sm"
                            >
                              {copiedBank === bk.raw ? <Check size={16} className="text-[#07A363]" /> : <Copy size={16} />}
                            </button>
                          </div>
                        ))}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-[11px] text-amber-700 font-semibold leading-relaxed">
                          💡 Tulis berita transfer: <span className="font-extrabold">PPDB {getField('student_name') || '[Nama Anak]'}</span>&nbsp;&nbsp;
                          {getField('student_name') ? (
                            <>Contoh: <em>"PPDB {getField('student_name').trim().split(' ')[0]}"</em></>
                          ) : (
                            <>Contoh: <em>"PPDB Rayyan"</em></>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'QRIS' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-700 font-medium space-y-1.5">
                        <div className="font-extrabold">Pembayaran via QRIS</div>
                        <p>Scan QR Code di sekolah atau hubungi Admin untuk mendapatkan kode QR pembayaran.</p>
                        <p className="text-[10px] text-purple-500">📞 (022) 1234-5678</p>
                      </motion.div>
                    )}

                    {paymentMethod === 'Cash' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-700 font-medium space-y-1.5">
                        <div className="font-extrabold">Pembayaran Tunai di Sekolah</div>
                        <p>Datang ke kantor sekolah pada hari kerja (Senin–Jumat, 08.00–15.00) dengan membawa berkas asli.</p>
                        <p className="text-[10px] text-orange-500">📍 Jl. Istiqamah No. 1, Bandung</p>
                      </motion.div>
                    )}
                  </FieldGroup>

                  {/* BUKTI PEMBAYARAN */}
                  {paymentMethod !== 'Cash' && (
                    <FieldGroup icon={FileText} title="Bukti Pembayaran">
                      <div className="group relative">
                        <label htmlFor="bukti_pembayaran" className="block cursor-pointer">
                          <div className={cn(
                            "border-2 border-dashed rounded-2xl p-6 flex items-center gap-5 transition-all duration-200",
                            selectedFiles['bukti_pembayaran']
                              ? "border-[#07A363] bg-[#07A363]/[0.02]"
                              : "border-gray-200 group-hover:border-[#07A363] group-hover:bg-[#07A363]/[0.02]"
                          )}>
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                              selectedFiles['bukti_pembayaran'] ? "bg-[#07A363]/10" : "bg-gray-100 group-hover:bg-[#07A363]/10"
                            )}>
                              {selectedFiles['bukti_pembayaran'] ? (
                                <Check size={22} className="text-[#07A363]" />
                              ) : (
                                <Upload size={22} className="text-gray-400 group-hover:text-[#07A363] transition-colors" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-extrabold text-[#07265F]">
                                {selectedFiles['bukti_pembayaran'] ? 'Bukti Pembayaran Terpilih' : 'Unggah Bukti Transfer / Resi Bayar'}
                              </div>
                              <div className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                                {selectedFiles['bukti_pembayaran'] ? selectedFiles['bukti_pembayaran'] : 'Foto struk ATM, bukti m-banking, atau resi QRIS · JPG/PNG/PDF (Max 2MB)'}
                              </div>
                            </div>
                          </div>
                          <Input 
                            id="bukti_pembayaran" 
                            name="bukti_pembayaran" 
                            type="file" 
                            onChange={(e) => handleFileChange(e, 'bukti_pembayaran')}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                          />
                        </label>
                      </div>
                    </FieldGroup>
                  )}
                </motion.div>

                {/* NAVIGATION */}
                <div className="flex justify-between items-center px-8 py-5 border-t border-gray-100 bg-gray-50/50">
                  {step > 1 ? (
                    <button
                      key="prev-btn"
                      type="button"
                      onClick={prevStep}
                      disabled={isPending}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer h-11 px-5 disabled:opacity-50 disabled:pointer-events-none"
                      )}
                    >
                      <ArrowLeft size={14} />
                      Sebelumnya
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      key="next-btn"
                      type="button"
                      onClick={nextStep}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "bg-[#07265F] hover:bg-[#07265F]/90 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer h-11 px-6 shadow-md shadow-[#07265F]/20"
                      )}
                    >
                      Selanjutnya
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      key="submit-btn"
                      type="submit"
                      disabled={isPending}
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "bg-gradient-to-r from-[#07A363] to-emerald-500 hover:from-[#07A363]/90 hover:to-emerald-500/90 text-white font-extrabold rounded-xl text-sm flex items-center gap-2 cursor-pointer h-11 px-7 shadow-lg shadow-[#07A363]/25 uppercase tracking-wide disabled:opacity-50 disabled:pointer-events-none"
                      )}
                    >
                      <Save size={15} />
                      {isPending ? 'Mengirim...' : 'Kirim Pendaftaran'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
