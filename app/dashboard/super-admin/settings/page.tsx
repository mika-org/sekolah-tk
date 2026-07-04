'use client'

import React, { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '@/actions/settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Settings, School, Phone, Mail, MapPin, Globe, CreditCard, RefreshCw, Save } from 'lucide-react'

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings states
  const [schoolName, setSchoolName] = useState('KB & TK Istiqamah')
  const [schoolTagline, setSchoolTagline] = useState('Membangun Generasi Islami yang Cerdas dan Berakhlak')
  const [schoolAddress, setSchoolAddress] = useState('Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung')
  const [schoolPhone, setSchoolPhone] = useState('022 - 4241799 / 0811 2198 853')
  const [schoolEmail, setSchoolEmail] = useState('info@tkistiqamah.sch.id')
  
  const [socialInstagram, setSocialInstagram] = useState('@kbtkistiqamah')
  const [socialFacebook, setSocialFacebook] = useState('TK Istiqamah Bandung')
  
  const [academicYear, setAcademicYear] = useState('2026/2027')
  const [ppdbFee, setPpdbFee] = useState('250000')

  const [paymentBankName, setPaymentBankName] = useState('Bank Mandiri')
  const [paymentAccountNumber, setPaymentAccountNumber] = useState('131-00-1234567-8')
  const [paymentAccountName, setPaymentAccountName] = useState('Yayasan Istiqamah Bandung')

  const loadSettings = async () => {
    setLoading(true)
    const result = await getSettings()
    if (result.success && result.settings) {
      const s = result.settings
      if (s.school_name) setSchoolName(s.school_name)
      if (s.school_tagline) setSchoolTagline(s.school_tagline)
      if (s.school_address) setSchoolAddress(s.school_address)
      if (s.school_phone) setSchoolPhone(s.school_phone)
      if (s.school_email) setSchoolEmail(s.school_email)
      if (s.social_instagram) setSocialInstagram(s.social_instagram)
      if (s.social_facebook) setSocialFacebook(s.social_facebook)
      if (s.academic_year) setAcademicYear(s.academic_year)
      if (s.ppdb_fee) setPpdbFee(s.ppdb_fee)
      if (s.payment_bank_name) setPaymentBankName(s.payment_bank_name)
      if (s.payment_account_number) setPaymentAccountNumber(s.payment_account_number)
      if (s.payment_account_name) setPaymentAccountName(s.payment_account_name)
    } else {
      toast.error('Gagal memuat pengaturan database. Menggunakan data bawaan.')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const settingsPayload = {
      school_name: schoolName,
      school_tagline: schoolTagline,
      school_address: schoolAddress,
      school_phone: schoolPhone,
      school_email: schoolEmail,
      social_instagram: socialInstagram,
      social_facebook: socialFacebook,
      academic_year: academicYear,
      ppdb_fee: ppdbFee,
      payment_bank_name: paymentBankName,
      payment_account_number: paymentAccountNumber,
      payment_account_name: paymentAccountName,
    }

    const result = await updateSettings(settingsPayload)
    if (result.success) {
      toast.success('Pengaturan website berhasil diperbarui!')
    } else {
      toast.error('Gagal menyimpan pengaturan: ' + result.error)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Pengaturan Website</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Kelola informasi dasar, biaya pendaftaran, dan nomor rekening pembayaran.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadSettings} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
            <RefreshCw size={14} /> Muat Ulang
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-primary-green/10 gap-2">
            <Save size={14} /> {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Memuat pengaturan website...</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info Sekolah */}
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <School size={18} className="text-primary-green" />
                Informasi Sekolah
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Data utama yang tampil di halaman landing page.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Nama Sekolah</Label>
                <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Tagline / Slogan</Label>
                <Input value={schoolTagline} onChange={e => setSchoolTagline(e.target.value)} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><MapPin size={12} />Alamat</Label>
                <Input value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Phone size={12} />No. Telepon</Label>
                <Input value={schoolPhone} onChange={e => setSchoolPhone(e.target.value)} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Mail size={12} />Email Resmi</Label>
                <Input value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
              </div>
            </CardContent>
          </Card>

          {/* Kolom Kanan */}
          <div className="space-y-8">
            {/* Rekening Pembayaran */}
            <Card className="bg-white rounded-[32px] shadow-sm border-none">
              <CardHeader className="p-8 border-b border-gray-50">
                <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-green" />
                  Rekening Pembayaran PPDB
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Nomor rekening transfer administrasi pendaftar baru.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue">Nama Bank</Label>
                  <Input value={paymentBankName} onChange={e => setPaymentBankName(e.target.value)} placeholder="Contoh: Bank Syariah Indonesia (BSI)" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Nomor Rekening</Label>
                    <Input value={paymentAccountNumber} onChange={e => setPaymentAccountNumber(e.target.value)} placeholder="Contoh: 7118229341" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Nama Pemilik Rekening</Label>
                    <Input value={paymentAccountName} onChange={e => setPaymentAccountName(e.target.value)} placeholder="Contoh: KB TK Istiqamah" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Sosial */}
            <Card className="bg-white rounded-[32px] shadow-sm border-none">
              <CardHeader className="p-8 border-b border-gray-50">
                <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                  <Globe size={18} className="text-primary-green" />
                  Media Sosial
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Tautan resmi media sosial sekolah.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Instagram size={12} />Instagram</Label>
                  <Input value={socialInstagram} onChange={e => setSocialInstagram(e.target.value)} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Facebook size={12} />Facebook</Label>
                  <Input value={socialFacebook} onChange={e => setSocialFacebook(e.target.value)} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
                </div>
              </CardContent>
            </Card>

            {/* Tahun Ajaran */}
            <Card className="bg-white rounded-[32px] shadow-sm border-none">
              <CardHeader className="p-8 border-b border-gray-50">
                <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                  <Settings size={18} className="text-primary-green" />
                  Tahun Ajaran & Biaya PPDB
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Tahun Ajaran Aktif</Label>
                    <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none h-10">
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                      <option value="2026/2027">2026/2027</option>
                      <option value="2027/2028">2027/2028</option>
                      <option value="2028/2029">2028/2029</option>
                      <option value="2029/2030">2029/2030</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-primary-blue">Biaya Pendaftaran (Rp)</Label>
                    <Input value={ppdbFee} onChange={e => setPpdbFee(e.target.value)} type="number" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" required />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      )}

      {/* Info note */}
      <div className="p-5 bg-blue-50 text-blue-700 rounded-3xl text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
        <Settings size={18} className="flex-shrink-0 mt-0.5" />
        <span>
          Pengaturan ini disimpan di database Supabase secara aman. Beberapa halaman seperti Form PPDB, halaman instruksi pembayaran, dan kontak publik akan menyinkronkan data rekening bank dan kontak ini secara dinamis.
        </span>
      </div>
    </div>
  )
}
