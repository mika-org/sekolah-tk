'use client'

import React, { useState } from 'react'
import { MapPin, Phone, Mail, Send, Clock, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Harap lengkapi kolom yang bertanda bintang (*)')
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      toast.success('Pesan Anda berhasil terkirim! Tim kami akan segera merespons.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 1000)
  }

  return (
    <div className="w-full pt-20 sm:pt-24 pb-16">
      {/* ─── HEADER SECTION (Clean, tanpa awan atau bulatan dekoratif) ─── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="bg-[#102A4E] rounded-[24px] sm:rounded-[32px] py-10 sm:py-14 px-6 sm:px-10 text-center text-white shadow-xl border border-white/10">
          <span className="inline-block bg-white/15 text-blue-100 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            Layanan Informasi &amp; Kontak
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-black tracking-tight">
            Hubungi KB &amp; TK Istiqamah
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/85 font-medium max-w-2xl mx-auto leading-relaxed">
            Kami siap menyambut dan melayani pertanyaan Ayah &amp; Bunda seputar program pendidikan, fasilitas, serta informasi pendaftaran siswa baru.
          </p>
        </div>
      </section>

      {/* ─── CONTACT DETAILS & FORM ──────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Left Column: Info Cards & Map */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Green Information Card */}
            <div className="bg-[#0B7347] text-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-7 shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white mb-5 pb-3 border-b border-white/20">
                  Informasi Sekolah
                </h2>

                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Alamat */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={17} className="text-emerald-200" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-200">
                        Alamat Kampus
                      </p>
                      <p className="font-medium text-white leading-snug mt-0.5">
                        Jl. Taman Citarum No. 1, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp SPMB */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone size={17} className="text-emerald-200" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-200">
                        WhatsApp SPMB / Admin
                      </p>
                      <a
                        href="https://wa.me/628112198853?text=Halo%20Admin%20SPMB%20TK%20Istiqamah,%20saya%20ingin%20bertanya%20informasi%20sekolah."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-white hover:underline block text-sm mt-0.5"
                      >
                        0811 2198 853 (Ustadzah Admin SPMB) ↗
                      </a>
                      <p className="text-[11px] text-emerald-100/80 mt-0.5">
                        Telp Kantor: 022 - 4241799 (Tata Usaha)
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail size={17} className="text-emerald-200" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-200">
                        Email Resmi
                      </p>
                      <a
                        href="mailto:info@tkistiqamah.sch.id"
                        className="font-medium text-white hover:underline block mt-0.5"
                      >
                        info@tkistiqamah.sch.id
                      </a>
                    </div>
                  </div>

                  {/* Jam Layanan */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={17} className="text-emerald-200" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-200">
                        Jam Pelayanan Kantor
                      </p>
                      <p className="font-medium text-white leading-snug mt-0.5">
                        Senin – Jumat: 07.30 – 13.00 WIB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Button */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <a
                  href="https://wa.me/628112198853?text=Halo%20KB%20TK%20Istiqamah%20Bandung,%20saya%20ingin%20konsultasi%20pendaftaran%20sekolah..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-emerald-50 text-[#075E38] font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Chat Langsung via WhatsApp
                </a>
              </div>
            </div>

            {/* Embedded Google Maps */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 h-64 lg:h-72 relative">
              <iframe
                title="Lokasi KB & TK Istiqamah Bandung"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8227096645395!2d107.6189914!3d-6.9117621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6378e907d73%3A0xe13b194d80a373b5!2sYayasan%20Istiqamah%20Bandung!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                className="w-full h-full border-none"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 shadow-sm border border-gray-100 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1B3B6F] mb-1">
                  Kirim Pesan
                </h2>
                <p className="text-xs sm:text-sm text-[#4A607A] font-medium mb-6">
                  Silakan tuliskan pesan atau pertanyaan Anda. Tim kami akan segera menanggapi melalui WhatsApp atau Email.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold text-[#1B3B6F]">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nama Ayah / Bunda"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B7347]/25 focus:border-[#0B7347] text-xs sm:text-sm font-semibold text-[#1B3B6F]"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold text-[#1B3B6F]">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nama@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B7347]/25 focus:border-[#0B7347] text-xs sm:text-sm font-semibold text-[#1B3B6F]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold text-[#1B3B6F]">
                        No. WhatsApp / HP
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Contoh: 08123456789"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B7347]/25 focus:border-[#0B7347] text-xs sm:text-sm font-semibold text-[#1B3B6F]"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold text-[#1B3B6F]">
                        Topik / Subjek
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Informasi SPMB / Program / Lainnya"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B7347]/25 focus:border-[#0B7347] text-xs sm:text-sm font-semibold text-[#1B3B6F]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-extrabold text-[#1B3B6F]">
                      Isi Pesan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tuliskan pertanyaan atau informasi yang ingin Ayah & Bunda ketahui..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B7347]/25 focus:border-[#0B7347] text-xs sm:text-sm font-semibold text-[#1B3B6F] resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0B7347] hover:bg-[#075E38] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Kirim Pesan <Send size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
