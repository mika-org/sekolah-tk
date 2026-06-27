'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, School, Phone, Mail, MapPin, Globe } from 'lucide-react'

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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-primary-blue">Pengaturan Website</h1>
        <p className="text-gray-500 font-semibold text-xs mt-1">Kelola informasi dasar yang tampil di halaman publik sekolah.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <Input defaultValue="KB & TK Istiqamah" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue">Tagline / Slogan</Label>
              <Input defaultValue="Membangun Generasi Islami yang Cerdas dan Berakhlak" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><MapPin size={12} />Alamat</Label>
              <Input defaultValue="Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Phone size={12} />No. Telepon</Label>
              <Input defaultValue="022 - 4241799 / 0811 2198 853" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Mail size={12} />Email Resmi</Label>
              <Input defaultValue="info@tkistiqamah.sch.id" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
            </div>
            <Button className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold text-xs cursor-pointer mt-2">
              Simpan Informasi Sekolah
            </Button>
          </CardContent>
        </Card>

        {/* Social Media + Tahun Ajaran */}
        <div className="space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <Globe size={18} className="text-primary-green" />
                Media Sosial
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Akun media sosial yang tampil di footer dan halaman kontak.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Instagram size={12} />Instagram</Label>
                <Input defaultValue="@kbtkistiqamah" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue flex items-center gap-1.5"><Facebook size={12} />Facebook</Label>
                <Input defaultValue="TK Istiqamah Bandung" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
              </div>
              <Button className="w-full bg-primary-green hover:bg-primary-green/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                Simpan Media Sosial
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-8 border-b border-gray-50">
              <CardTitle className="text-base font-black text-primary-blue flex items-center gap-2">
                <Settings size={18} className="text-primary-green" />
                Tahun Ajaran Aktif
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Tahun Ajaran</Label>
                <select className="w-full px-3.5 py-2.5 bg-[#F8F6F2] border-transparent focus:bg-white rounded-xl text-sm font-medium outline-none h-10">
                  <option>2024/2025</option>
                  <option>2025/2026</option>
                  <option>2026/2027</option>
                  <option>2027/2028</option>
                  <option>2028/2029</option>
                  <option>2029/2030</option>
                  <option>2030/2031</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary-blue">Biaya Pendaftaran (Rp)</Label>
                <Input defaultValue="250000" type="number" className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium h-10" />
              </div>
              <Button className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold text-xs cursor-pointer">
                Simpan Pengaturan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info note */}
      <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-semibold flex items-start gap-2 leading-relaxed">
        <Settings size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          Pengaturan ini untuk keperluan tampilan antarmuka. Perubahan konten website (hero text, deskripsi program, dll.) saat ini dikelola langsung melalui kode aplikasi. Fitur CMS dinamis akan tersedia di versi selanjutnya.
        </span>
      </div>
    </div>
  )
}
