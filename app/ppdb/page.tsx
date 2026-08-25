'use client'

import React, { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileText,
  HeartPulse,
  MapPin,
  Save,
  ShieldCheck,
  Star,
  Upload,
  User,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { submitPPDB } from '@/actions/ppdb'
import { getSettings } from '@/actions/settings'
import { buttonVariants } from '@/components/ui/button'
import {
  allFields,
  CHILD_FORM_SECTIONS,
  FATHER_FORM_SECTIONS,
  HEALTH_FORM_SECTIONS,
  MOTHER_FORM_SECTIONS,
  type PPDBFieldDefinition,
  type PPDBFormSection,
} from '@/lib/ppdb/form-definition'
import { cn } from '@/lib/utils'

interface FormState {
  success: boolean
  error: string
  ppdbId: string
  errorStep?: number
}

const initialState: FormState = { success: false, error: '', ppdbId: '' }
const MAX_FILE_SIZE = 2 * 1024 * 1024

const STEPS = [
  { num: 1, label: 'Data Anak', sublabel: 'Identitas dan tempat tinggal', icon: User },
  { num: 2, label: 'Orang Tua/Wali', sublabel: 'Identitas ayah dan ibu', icon: Users },
  { num: 3, label: 'Tumbuh Kembang', sublabel: 'Perkembangan dan kesehatan', icon: HeartPulse },
  { num: 4, label: 'Berkas & Bayar', sublabel: 'Lampiran dan pembayaran', icon: FileText },
]

const inputClassName = 'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:border-[#07A363] focus:bg-white focus:ring-2 focus:ring-[#07A363]/10'
const textareaClassName = 'min-h-24 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:border-[#07A363] focus:bg-white focus:ring-2 focus:ring-[#07A363]/10'

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

function DynamicField({ field }: { field: PPDBFieldDefinition }) {
  const uppercaseValue = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.currentTarget
    const cursor = target.selectionStart
    target.value = target.value.toLocaleUpperCase('id-ID')
    target.setSelectionRange(cursor, cursor)
  }

  if (field.type === 'select') {
    return (
      <FormField field={field}>
        <select id={field.name} name={field.name} defaultValue="" className={cn(inputClassName, 'cursor-pointer')}>
          <option value="">Pilih {field.label.toLowerCase()}</option>
          {field.options?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
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
          rows={3}
          placeholder={field.placeholder}
          onInput={field.uppercase ? uppercaseValue : undefined}
          className={cn(textareaClassName, field.uppercase && 'uppercase')}
        />
      </FormField>
    )
  }

  return (
    <FormField field={field}>
      <input
        id={field.name}
        name={field.name}
        type={field.type || 'text'}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        min={field.min}
        step={field.step}
        inputMode={field.type === 'number' || field.name.includes('nik') || field.name.includes('kartu_keluarga') || field.name.includes('kode_pos') ? 'numeric' : undefined}
        onInput={field.uppercase ? uppercaseValue : undefined}
        className={cn(inputClassName, field.uppercase && 'uppercase')}
      />
    </FormField>
  )
}

function FormSections({ sections, icon: Icon = ClipboardCheck }: { sections: PPDBFormSection[]; icon?: React.ElementType }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#07A363]/10">
              <Icon size={16} className="text-[#07A363]" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#07265F]">{section.title}</h3>
              {section.description && <p className="mt-1 text-[11px] font-medium leading-relaxed text-gray-400">{section.description}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {section.fields.map((field) => <DynamicField key={field.name} field={field} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

function UploadCard({
  id,
  label,
  description,
  required,
  selectedFile,
  onChange,
}: {
  id: string
  label: string
  description: string
  required?: boolean
  selectedFile?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="group relative">
      <label htmlFor={id} className="block cursor-pointer">
        <div className={cn(
          'flex h-36 flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-5 text-center transition-all',
          selectedFile ? 'border-[#07A363] bg-[#07A363]/[0.03]' : 'border-gray-200 group-hover:border-[#07A363] group-hover:bg-[#07A363]/[0.02]',
        )}>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', selectedFile ? 'bg-[#07A363]/10' : 'bg-gray-100')}>
            {selectedFile ? <Check size={17} className="text-[#07A363]" /> : <Upload size={17} className="text-gray-400" />}
          </div>
          <div className="w-full min-w-0">
            <div className="truncate text-xs font-extrabold text-[#07265F]">
              {label}{required && <span className="ml-0.5 text-red-500">*</span>}
            </div>
            <div className="mt-1 truncate px-1 text-[9px] font-medium text-gray-400">{selectedFile || description}</div>
          </div>
        </div>
        <input id={id} name={id} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onChange} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
      </label>
    </div>
  )
}

export default function PPDBPage() {
  const [step, setStep] = useState(1)
  const [state, formAction, isPending] = useActionState(submitPPDB, initialState)
  const [paymentMethod, setPaymentMethod] = useState('Transfer')
  const [copiedBank, setCopiedBank] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>({})
  const [dbSettings, setDbSettings] = useState<Record<string, string> | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    void getSettings().then((result) => {
      if (result.success && result.settings) setDbSettings(result.settings as Record<string, string>)
    })
  }, [])

  useEffect(() => {
    if (state.error) setStep(state.errorStep || 4)
  }, [state])

  const getField = (name: string) => {
    if (!formRef.current) return ''
    const value = new FormData(formRef.current).get(name)
    return typeof value === 'string' ? value : ''
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = event.target.files?.[0]
    if (file && file.size > MAX_FILE_SIZE) {
      event.target.value = ''
      setSelectedFiles((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      toast.error(`${file.name} melebihi batas 2 MB.`)
      return
    }
    setSelectedFiles((current) => {
      const next = { ...current }
      if (file) next[id] = file.name
      else delete next[id]
      return next
    })
  }

  const nextStep = () => {
    if (step === 1) {
      const missing = allFields(CHILD_FORM_SECTIONS).find((field) => field.required && !getField(field.name).trim())
      if (missing) {
        toast.error(`${missing.label} wajib diisi.`)
        document.getElementById(missing.name)?.focus()
        return
      }
    }
    if (step === 2) {
      const fatherName = getField('nama_ayah').trim()
      const motherName = getField('nama_ibu').trim()
      if (!fatherName && !motherName) {
        toast.error('Isi minimal satu identitas orang tua/wali.')
        return
      }
      if (fatherName && !getField('hp_ayah').trim()) {
        toast.error('No. Telepon/HP Ayah wajib diisi.')
        return
      }
      if (motherName && !getField('hp_ibu').trim()) {
        toast.error('No. Telepon/HP Ibu wajib diisi.')
        return
      }
    }
    setStep((current) => Math.min(current + 1, STEPS.length))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (step !== STEPS.length) {
      event.preventDefault()
      return
    }
    if (!window.confirm('Apakah seluruh data sudah benar dan siap dikirim?')) event.preventDefault()
  }

  const handleCopy = (text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedBank(text)
    toast.success('Nomor rekening disalin.')
    window.setTimeout(() => setCopiedBank(null), 2000)
  }

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F0F9F4] via-[#F8F6F2] to-[#EEF2FF] p-6">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md space-y-6 rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#07A363] to-emerald-400 shadow-lg shadow-[#07A363]/25">
            <CheckCircle2 size={52} className="text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#07265F]">Pendaftaran Berhasil</h2>
            <p className="text-sm font-medium leading-relaxed text-gray-500">Formulir dan lampiran telah diterima. Admin akan melakukan verifikasi data pendaftaran.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-[#07265F]/5 to-[#07A363]/5 p-4 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500">ID Registrasi</span>
              <span className="font-mono font-extrabold text-[#07A363]">{state.ppdbId}</span>
            </div>
          </div>
          <Link href="/" className={cn(buttonVariants(), 'w-full rounded-xl bg-[#07265F] font-bold text-white hover:bg-[#07265F]/90')}>Kembali ke Beranda</Link>
        </motion.div>
      </div>
    )
  }

  const previousEducation = getField('riwayat_pendidikan')
  const mutationRequired = getField('status_pendaftaran') === 'Siswa pindahan'
  const graduationLetterRequired = ['Daycare', 'Kelompok Bermain (KB)'].includes(previousEducation)
  const bankName = dbSettings?.payment_bank_name || 'Bank Mandiri'
  const accountNumber = dbSettings?.payment_account_number || '131-00-1234567-8'
  const accountOwner = dbSettings?.payment_account_name || 'Yayasan Istiqamah Bandung'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9F4] via-[#F8F6F2] to-[#EEF2FF]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="group inline-flex items-center gap-2 text-sm font-bold text-[#07265F] transition-colors hover:text-[#07A363]">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Kembali ke Beranda
          </Link>
          <div className="hidden items-center gap-1.5 text-xs font-bold text-gray-400 sm:flex">
            <ShieldCheck size={14} className="text-[#07A363]" />
            Data pendaftaran tersimpan aman
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-9 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#07A363]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#07A363]">
            <Star size={12} className="fill-current" /> Tahun Ajaran 2026/2027
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#07265F] sm:text-5xl">Formulir Pendaftaran Murid Baru</h1>
          <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-gray-500">TK Istiqamah · Taman Citarum, Kelurahan Citarum, Kecamatan Bandung Wetan, Kota Bandung</p>
        </div>

        <div className="mb-9 grid grid-cols-2 gap-2 md:grid-cols-4">
          {STEPS.map((item) => {
            const Icon = item.icon
            const active = item.num === step
            const done = item.num < step
            return (
              <button
                key={item.num}
                type="button"
                disabled={item.num > step || isPending}
                onClick={() => item.num < step && setStep(item.num)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all',
                  active && 'border-[#07A363]/30 bg-white shadow-lg shadow-[#07265F]/5',
                  done && 'cursor-pointer border-transparent bg-white/50',
                  item.num > step && 'cursor-not-allowed border-transparent bg-white/30 opacity-50',
                )}
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', active || done ? 'bg-[#07A363] text-white' : 'bg-gray-100 text-gray-400')}>
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-extrabold text-[#07265F]">{item.label}</div>
                  <div className="hidden truncate text-[9px] font-medium text-gray-400 sm:block">{item.sublabel}</div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-5 rounded-3xl bg-gradient-to-br from-[#07265F] to-[#0a3580] p-6 text-white shadow-xl shadow-[#07265F]/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">{React.createElement(STEPS[step - 1].icon, { size: 20 })}</div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Langkah {step} dari {STEPS.length}</div>
                  <div className="font-extrabold">{STEPS[step - 1].label}</div>
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-[10px] font-bold text-white/50"><span>Progress</span><span>{step * 25}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#07A363] transition-all" style={{ width: `${step * 25}%` }} /></div>
              </div>
              <div className="space-y-2 border-t border-white/10 pt-4 text-[11px] font-medium leading-relaxed text-white/70">
                {step === 1 && <><p>• Siapkan Akta Kelahiran dan Kartu Keluarga.</p><p>• Isi data sesuai dokumen resmi.</p><p>• Tanda bintang wajib dilengkapi.</p></>}
                {step === 2 && <><p>• Isi minimal satu identitas orang tua/wali.</p><p>• Nomor HP digunakan untuk konfirmasi.</p><p>• Lengkapi alamat rumah dan kantor bila ada.</p></>}
                {step === 3 && <><p>• Isi berdasarkan riwayat anak yang sebenarnya.</p><p>• Bila tidak pernah/tidak ada, pilih atau tulis “Tidak”.</p><p>• Informasi membantu guru menyiapkan pendampingan.</p></>}
                {step === 4 && <><p>• KK dan Akta Kelahiran wajib dilampirkan.</p><p>• JPG, PNG, atau PDF maksimal 2 MB.</p><p>• Surat KB/mutasi mengikuti riwayat sekolah.</p></>}
              </div>
              <div className="space-y-2 border-t border-white/10 pt-4 text-[10px] font-medium text-white/50">
                <div className="flex gap-2"><MapPin size={13} className="shrink-0" /> Taman Citarum, Bandung Wetan</div>
                <div className="flex gap-2"><Activity size={13} className="shrink-0" /> Senin–Jumat, 08.00–15.00</div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5 sm:px-8">
                <div><h2 className="font-extrabold text-[#07265F]">{STEPS[step - 1].label}</h2><p className="mt-0.5 text-xs font-medium text-gray-400">{STEPS[step - 1].sublabel}</p></div>
                <div className="text-xs font-extrabold text-gray-300">{step} / {STEPS.length}</div>
              </div>

              <form ref={formRef} action={formAction} onSubmit={handleSubmit}>
                <input type="hidden" name="current_step" value={step} />
                <input type="hidden" name="payment_method" value={paymentMethod} />
                {isPending && <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white/75 backdrop-blur-[1px]"><div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#07A363]" /><div className="text-sm font-bold text-[#07265F]">Memproses pendaftaran...</div></div>}
                {state.error && <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600 sm:mx-8">{state.error}</div>}

                <div className={cn('p-6 sm:p-8', step !== 1 && 'hidden')}><FormSections sections={CHILD_FORM_SECTIONS} icon={User} /></div>
                <div className={cn('space-y-10 p-6 sm:p-8', step !== 2 && 'hidden')}>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5"><FormSections sections={FATHER_FORM_SECTIONS} icon={User} /></div>
                  <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-5"><FormSections sections={MOTHER_FORM_SECTIONS} icon={User} /></div>
                </div>
                <div className={cn('p-6 sm:p-8', step !== 3 && 'hidden')}>
                  <div className="mb-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-medium leading-relaxed text-emerald-800">Data tumbuh kembang bersifat pribadi dan digunakan sekolah untuk memahami kebutuhan pendampingan anak.</div>
                  <FormSections sections={HEALTH_FORM_SECTIONS} icon={HeartPulse} />
                </div>

                <div className={cn('space-y-8 p-6 sm:p-8', step !== 4 && 'hidden')}>
                  <section className="space-y-4">
                    <div><h3 className="text-xs font-extrabold uppercase tracking-widest text-[#07265F]">Dokumen Lampiran</h3><p className="mt-1 text-[11px] font-medium text-gray-400">JPG, PNG, atau PDF · maksimal 2 MB per berkas.</p></div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {[
                        { id: 'kk', label: 'Kartu Keluarga', description: 'Fotokopi/scan KK', required: true },
                        { id: 'akta', label: 'Akta Kelahiran', description: `Akta ${getField('student_name') || 'anak'}`, required: true },
                        { id: 'foto_anak', label: 'Foto Anak', description: 'Pas foto 3×4, tampak depan' },
                        { id: 'ktp_ayah', label: 'KTP Ayah', description: 'KTP yang masih berlaku' },
                        { id: 'ktp_ibu', label: 'KTP Ibu', description: 'KTP yang masih berlaku' },
                        { id: 'surat_mutasi', label: 'Surat Mutasi', description: 'Untuk siswa pindahan', required: mutationRequired },
                        { id: 'surat_lulus_kb', label: 'Surat Keterangan Lulus KB/Daycare', description: 'Untuk anak yang pernah sekolah', required: graduationLetterRequired },
                      ].map((document) => (
                        <UploadCard key={document.id} {...document} selectedFile={selectedFiles[document.id]} onChange={(event) => handleFileChange(event, document.id)} />
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#07265F]">Biaya dan Metode Pembayaran</h3>
                    <div className="flex flex-col justify-between gap-3 rounded-2xl bg-gradient-to-br from-[#07A363] to-emerald-400 p-5 text-white shadow-lg shadow-[#07A363]/20 sm:flex-row sm:items-center">
                      <div><div className="font-extrabold">Uang Pangkal Registrasi</div><div className="mt-0.5 text-xs font-medium text-white/75">Verifikasi berkas dan administrasi siswa baru</div></div>
                      <div className="text-3xl font-black">Rp 250.000</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ value: 'Transfer', label: 'Transfer Bank', icon: '🏦' }, { value: 'QRIS', label: 'QRIS', icon: '📱' }, { value: 'Cash', label: 'Tunai', icon: '💵' }].map((method) => (
                        <button key={method.value} type="button" onClick={() => setPaymentMethod(method.value)} className={cn('flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all', paymentMethod === method.value ? 'border-[#07A363] bg-[#07A363]/5' : 'border-gray-200')}>
                          <span className="text-xl">{method.icon}</span><span className="text-[10px] font-extrabold text-gray-600">{method.label}</span>
                        </button>
                      ))}
                    </div>
                    {paymentMethod === 'Transfer' && <div className="flex items-center justify-between rounded-2xl border border-[#07265F]/15 bg-[#07265F]/5 p-4"><div><div className="text-[10px] font-extrabold uppercase text-[#07265F]">{bankName}</div><div className="font-mono text-lg font-extrabold tracking-widest text-[#07265F]">{accountNumber}</div><div className="text-[10px] font-medium text-gray-400">a.n. {accountOwner}</div></div><button type="button" onClick={() => handleCopy(accountNumber.replace(/[-\s]/g, ''))} className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400">{copiedBank ? <Check size={16} className="text-[#07A363]" /> : <Copy size={16} />}</button></div>}
                    {paymentMethod === 'QRIS' && <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs font-medium text-purple-700">Hubungi admin sekolah untuk memperoleh kode QR pembayaran.</div>}
                    {paymentMethod === 'Cash' && <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-xs font-medium text-orange-700">Pembayaran tunai dilakukan di kantor TK Istiqamah pada jam kerja.</div>}
                  </section>

                  {paymentMethod !== 'Cash' && <section className="space-y-3"><h3 className="text-xs font-extrabold uppercase tracking-widest text-[#07265F]">Bukti Pembayaran</h3><UploadCard id="bukti_pembayaran" label="Bukti Transfer/QRIS" description="Foto bukti pembayaran" selectedFile={selectedFiles.bukti_pembayaran} onChange={(event) => handleFileChange(event, 'bukti_pembayaran')} /></section>}

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium leading-relaxed text-emerald-900">
                    <input type="checkbox" name="pernyataan_kebenaran" value="setuju" className="mt-0.5 h-4 w-4 accent-[#07A363]" />
                    <span>Saya menyatakan seluruh data yang diisi benar dan dapat dipertanggungjawabkan. Saya telah melampirkan Kartu Keluarga dan Akta Kelahiran serta dokumen tambahan sesuai riwayat pendidikan anak.</span>
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-5 sm:px-8">
                  {step > 1 ? <button type="button" disabled={isPending} onClick={() => setStep((current) => current - 1)} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 rounded-xl border-gray-200 px-5 text-xs font-bold')}><ArrowLeft size={14} /> Sebelumnya</button> : <div />}
                  {step < STEPS.length ? <button type="button" onClick={nextStep} className={cn(buttonVariants(), 'h-11 rounded-xl bg-[#07265F] px-6 font-bold text-white hover:bg-[#07265F]/90')}>Selanjutnya <ArrowRight size={14} /></button> : <button type="submit" disabled={isPending} className={cn(buttonVariants(), 'h-11 rounded-xl bg-gradient-to-r from-[#07A363] to-emerald-500 px-7 font-extrabold uppercase tracking-wide text-white')}><Save size={15} /> {isPending ? 'Mengirim...' : 'Kirim Pendaftaran'}</button>}
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
