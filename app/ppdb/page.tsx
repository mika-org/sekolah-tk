'use client'

import React, { useState, useActionState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { submitPPDB } from '@/actions/ppdb'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ArrowRight, Save, User, Users, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormState {
  success: boolean;
  error: string;
  ppdbId: string;
}

const initialState: FormState = {
  success: false,
  error: '',
  ppdbId: '',
}

export default function PPDBPage() {
  const [step, setStep] = useState(1)
  const [state, formAction, isPending] = useActionState(submitPPDB, initialState)

  const [paymentMethod, setPaymentMethod] = useState('Transfer')

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="min-h-screen bg-[#F8F6F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-blue hover:text-primary-green transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-primary-blue">Pendaftaran Peserta Didik Baru (PPDB)</h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto text-sm">
            Isi formulir pendaftaran KB & TK Istiqamah di bawah ini dengan lengkap dan benar.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center max-w-md mx-auto">
          {[
            { num: 1, label: 'Data Anak', icon: User },
            { num: 2, label: 'Orang Tua', icon: Users },
            { num: 3, label: 'Dokumen', icon: FileText }
          ].map((s) => {
            const Icon = s.icon
            const active = step >= s.num
            const current = step === s.num
            return (
              <div key={s.num} className="flex flex-col items-center space-y-1.5 flex-1 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  current 
                    ? 'bg-primary-green text-white ring-4 ring-primary-green/10' 
                    : active 
                      ? 'bg-primary-blue text-white' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[10px] font-bold ${active ? 'text-primary-blue' : 'text-gray-400'}`}>{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* Main form card */}
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-50 overflow-hidden">
          {state?.success ? (
            /* SUCCESS PANEL */
            <div className="p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 text-primary-green rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-black text-primary-blue">Pendaftaran Berhasil Dikirim!</h2>
              <div className="max-w-md mx-auto space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
                <p>
                  Terima kasih telah mendaftar di KB & TK Istiqamah. Formulir pendaftaran ananda telah masuk ke database kami.
                </p>
                <div className="p-4 bg-[#F8F6F2] rounded-2xl border border-gray-100 text-left space-y-2">
                  <div className="font-bold text-primary-blue text-xs">Informasi Pendaftaran:</div>
                  <div className="text-xs">ID Registrasi: <span className="font-mono font-bold text-primary-green">{state.ppdbId || 'N/A'}</span></div>
                  <div className="text-xs">Status Awal: <span className="font-bold text-amber-500">Submitted</span></div>
                  <div className="text-xs">Status Pembayaran: <span className="font-bold text-amber-500">Pending Verification</span></div>
                </div>
                <p className="text-xs text-gray-400 font-semibold">
                  Tim Admin kami akan melakukan verifikasi berkas dan bukti pembayaran dalam waktu 1-2 hari kerja. Anda akan menerima notifikasi/kontak lebih lanjut.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({ variant: 'default' }),
                    "bg-primary-blue hover:bg-primary-blue/95 text-white rounded-xl font-bold px-6 py-2.5 inline-block text-xs"
                  )}
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : (
            <form action={formAction} className="p-8 sm:p-12 space-y-8">
              {state?.error && (
                <div className="p-4 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {state.error}
                </div>
              )}

              {/* STEP 1: DATA ANAK */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-black text-primary-blue border-b border-gray-50 pb-2">Identitas Calon Siswa</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="student_name" className="text-xs font-bold text-primary-blue">Nama Lengkap Anak *</Label>
                      <Input id="student_name" name="student_name" required placeholder="Contoh: Muhammad Al-Fatih" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jenis_kelamin" className="text-xs font-bold text-primary-blue">Jenis Kelamin</Label>
                      <Select name="jenis_kelamin" defaultValue="L">
                        <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                          <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nik" className="text-xs font-bold text-primary-blue">NIK Anak (16 Digit)</Label>
                      <Input id="nik" name="nik" maxLength={16} placeholder="Format: 647101..." className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nisn" className="text-xs font-bold text-primary-blue">NISN Anak (10 Digit jika ada)</Label>
                      <Input id="nisn" name="nisn" maxLength={10} placeholder="Format: 015..." className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tempat_lahir" className="text-xs font-bold text-primary-blue">Tempat Lahir</Label>
                      <Input id="tempat_lahir" name="tempat_lahir" placeholder="Contoh: Balikpapan" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_date" className="text-xs font-bold text-primary-blue">Tanggal Lahir Calon Siswa *</Label>
                      <Input id="birth_date" name="birth_date" type="date" required className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agama" className="text-xs font-bold text-primary-blue">Agama</Label>
                      <Select name="agama" defaultValue="Islam">
                        <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                          <SelectValue placeholder="Pilih Agama" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Islam">Islam</SelectItem>
                          <SelectItem value="Kristen">Kristen</SelectItem>
                          <SelectItem value="Katolik">Katolik</SelectItem>
                          <SelectItem value="Hindu">Hindu</SelectItem>
                          <SelectItem value="Budha">Budha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="anak_ke" className="text-xs font-bold text-primary-blue">Anak Ke</Label>
                        <Input id="anak_ke" name="anak_ke" type="number" min={1} defaultValue={1} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jml_saudara" className="text-xs font-bold text-primary-blue">Jumlah Saudara</Label>
                        <Input id="jml_saudara" name="jml_saudara" type="number" min={0} defaultValue={0} className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alamat" className="text-xs font-bold text-primary-blue">Alamat Tempat Tinggal</Label>
                    <Textarea id="alamat" name="alamat" rows={3} placeholder="Alamat lengkap RT/RW, Kelurahan, Kecamatan..." className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DATA ORANG TUA */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* DATA AYAH */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-primary-blue border-b border-gray-50 pb-2">Identitas Ayah Kandung</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nama_ayah" className="text-xs font-bold text-primary-blue">Nama Lengkap Ayah</Label>
                        <Input id="nama_ayah" name="nama_ayah" placeholder="Nama lengkap beserta gelar jika ada" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pekerjaan_ayah" className="text-xs font-bold text-primary-blue">Pekerjaan Ayah</Label>
                        <Input id="pekerjaan_ayah" name="pekerjaan_ayah" placeholder="Contoh: Karyawan Swasta" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hp_ayah" className="text-xs font-bold text-primary-blue">No. HP / WhatsApp Ayah</Label>
                        <Input id="hp_ayah" name="hp_ayah" placeholder="Contoh: 0812..." className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_ayah" className="text-xs font-bold text-primary-blue">Email Ayah</Label>
                        <Input id="email_ayah" name="email_ayah" type="email" placeholder="Contoh: ayah@mail.com" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="penghasilan_ayah" className="text-xs font-bold text-primary-blue">Estimasi Penghasilan Bulanan</Label>
                        <Select name="penghasilan_ayah" defaultValue="3jt - 5jt">
                          <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                            <SelectValue placeholder="Pilih Penghasilan" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Dibawah 3jt">Dibawah Rp 3.000.000</SelectItem>
                            <SelectItem value="3jt - 5jt">Rp 3.000.000 - Rp 5.000.000</SelectItem>
                            <SelectItem value="5jt - 10jt">Rp 5.000.000 - Rp 10.000.000</SelectItem>
                            <SelectItem value="Diatas 10jt">Diatas Rp 10.000.000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alamat_ayah" className="text-xs font-bold text-primary-blue">Alamat Ayah (Kosongkan jika sama dengan anak)</Label>
                        <Input id="alamat_ayah" name="alamat_ayah" placeholder="Alamat lengkap..." className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                    </div>
                  </div>

                  {/* DATA IBU */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-primary-blue border-b border-gray-50 pb-2">Identitas Ibu Kandung</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nama_ibu" className="text-xs font-bold text-primary-blue">Nama Lengkap Ibu</Label>
                        <Input id="nama_ibu" name="nama_ibu" placeholder="Nama lengkap beserta gelar jika ada" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pekerjaan_ibu" className="text-xs font-bold text-primary-blue">Pekerjaan Ibu</Label>
                        <Input id="pekerjaan_ibu" name="pekerjaan_ibu" placeholder="Contoh: Ibu Rumah Tangga" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hp_ibu" className="text-xs font-bold text-primary-blue">No. HP / WhatsApp Ibu</Label>
                        <Input id="hp_ibu" name="hp_ibu" placeholder="Contoh: 0857..." className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_ibu" className="text-xs font-bold text-primary-blue">Email Ibu</Label>
                        <Input id="email_ibu" name="email_ibu" type="email" placeholder="Contoh: ibu@mail.com" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="penghasilan_ibu" className="text-xs font-bold text-primary-blue">Estimasi Penghasilan Bulanan</Label>
                        <Select name="penghasilan_ibu" defaultValue="Dibawah 3jt">
                          <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                            <SelectValue placeholder="Pilih Penghasilan" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Dibawah 3jt">Dibawah Rp 3.000.000</SelectItem>
                            <SelectItem value="3jt - 5jt">Rp 3.000.000 - Rp 5.000.000</SelectItem>
                            <SelectItem value="5jt - 10jt">Rp 5.000.000 - Rp 10.000.000</SelectItem>
                            <SelectItem value="Diatas 10jt">Diatas Rp 10.000.000</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alamat_ibu" className="text-xs font-bold text-primary-blue">Alamat Ibu (Kosongkan jika sama dengan anak)</Label>
                        <Input id="alamat_ibu" name="alamat_ibu" placeholder="Alamat lengkap..." className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: DOKUMEN & PEMBAYARAN */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-primary-blue border-b border-gray-50 pb-2">Unggah Berkas Pendukung (Format: JPG/PNG/PDF, Max 2MB)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="kk" className="text-xs font-bold text-primary-blue">Kartu Keluarga (KK)</Label>
                        <Input id="kk" name="kk" type="file" className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="akta" className="text-xs font-bold text-primary-blue">Akta Kelahiran Anak</Label>
                        <Input id="akta" name="akta" type="file" className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foto_anak" className="text-xs font-bold text-primary-blue">Foto Anak (Pas Foto 3x4)</Label>
                        <Input id="foto_anak" name="foto_anak" type="file" className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ktp_ayah" className="text-xs font-bold text-primary-blue">KTP Ayah</Label>
                        <Input id="ktp_ayah" name="ktp_ayah" type="file" className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium cursor-pointer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ktp_ibu" className="text-xs font-bold text-primary-blue">KTP Ibu</Label>
                        <Input id="ktp_ibu" name="ktp_ibu" type="file" className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t border-gray-50">
                    <h3 className="text-lg font-black text-primary-blue pb-1">Biaya Pendaftaran PPDB</h3>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div>
                        <div className="font-extrabold text-sm text-primary-blue">Uang Pangkal Registrasi Awal</div>
                        <div className="text-xs text-gray-500 font-semibold mt-0.5">Biaya verifikasi berkas, tes kecocokan, dan administrasi.</div>
                      </div>
                      <div className="text-2xl font-black text-primary-green">Rp 250.000</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="payment_method" className="text-xs font-bold text-primary-blue">Metode Pembayaran</Label>
                        <Select 
                          name="payment_method" 
                          defaultValue="Transfer"
                          onValueChange={(val) => setPaymentMethod(val as string)}
                        >
                          <SelectTrigger className="bg-[#F8F6F2] border-transparent rounded-xl text-sm font-medium">
                            <SelectValue placeholder="Pilih Metode" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Transfer">Bank Transfer (BSI / Mandiri)</SelectItem>
                            <SelectItem value="QRIS">QRIS E-Wallet</SelectItem>
                            <SelectItem value="Cash">Tunai ke Sekolah</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bukti_pembayaran" className="text-xs font-bold text-primary-blue">Unggah Bukti Transfer / Resi Pembayaran</Label>
                        <Input id="bukti_pembayaran" name="bukti_pembayaran" type="file" className="bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium cursor-pointer" />
                      </div>
                    </div>

                    {paymentMethod === 'Transfer' && (
                      <div className="p-4 bg-[#F8F6F2] rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1.5 font-medium leading-relaxed">
                        <div className="font-extrabold text-primary-blue">Rekening Bank Tujuan Transfer:</div>
                        <div>Bank Syariah Indonesia (BSI): <span className="font-bold text-primary-green">711 0023 234</span> a.n Yayasan Istiqamah Balikpapan</div>
                        <div>Bank Mandiri: <span className="font-bold text-primary-green">149 00 12345 678</span> a.n Yayasan Istiqamah Balikpapan</div>
                        <div className="text-[10px] text-gray-400 font-semibold pt-1">*) Tuliskan berita transfer: PPDB [Nama Anak] contoh: "PPDB Althaf"</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    onClick={prevStep} 
                    variant="outline" 
                    className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    Sebelumnya
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="bg-primary-blue hover:bg-primary-blue/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    Berikutnya
                    <ArrowRight size={14} />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-green/10 cursor-pointer"
                  >
                    <Save size={14} />
                    {isPending ? 'Mengirim...' : 'Kirim Pendaftaran'}
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
