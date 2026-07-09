'use client'

import React, { useState } from 'react'
import { MapPin, Phone, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
      toast.error('Harap isi semua kolom wajib (*)')
      return
    }

    setLoading(true)
    
    // Simulate sending message
    setTimeout(() => {
      setLoading(false)
      toast.success('Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    }, 1200)
  }

  return (
    <div className="w-full pt-24">
      {/* ─── HEADER SECTION ─────────────────────── */}
      <section className="relative py-16 bg-[#07265F] text-white rounded-[32px] max-w-7xl mx-auto px-6 sm:px-8 text-center overflow-hidden shadow-lg mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#07A363]/20 rounded-full pointer-events-none translate-y-12 -translate-x-12" />
        <h1 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Hubungi Kami</h1>
        <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto opacity-95 relative z-10 leading-relaxed">
          Punya pertanyaan mengenai program belajar kami, PPDB, atau hal lainnya? Jangan ragu untuk mengirimkan pesan atau berkunjung ke lokasi kami.
        </p>
      </section>

      {/* ─── CONTACT SECTION ────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Info & Map */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#07A363] text-white rounded-[28px] p-8 shadow-md h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black mb-6">Informasi Kontak</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <MapPin size={18} className="mt-0.5 flex-shrink-0 text-white" />
                    <div>
                      <p className="font-extrabold text-xs uppercase tracking-wider text-white/70">Alamat</p>
                      <p className="text-sm font-semibold leading-relaxed mt-0.5">Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone size={18} className="mt-0.5 flex-shrink-0 text-white" />
                    <div>
                      <p className="font-extrabold text-xs uppercase tracking-wider text-white/70">Telepon / WhatsApp</p>
                      <p className="text-sm font-semibold mt-0.5">022 - 4241799 / 0811 2198 853</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail size={18} className="mt-0.5 flex-shrink-0 text-white" />
                    <div>
                      <p className="font-extrabold text-xs uppercase tracking-wider text-white/70">Email</p>
                      <p className="text-sm font-semibold mt-0.5">info@tkistiqamah.sch.id</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                    <div>
                      <p className="font-extrabold text-xs uppercase tracking-wider text-white/70">Instagram</p>
                      <p className="text-sm font-semibold mt-0.5">@kbtkistiqamah</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20 mt-8 text-xs font-semibold text-white/80">
                Jam Operasional: Senin - Jumat (07.30 - 13.00)
              </div>
            </div>

            {/* Map Frame Card */}
            <div className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-gray-100 h-64 lg:h-80 relative">
              {/* Google Maps mock placeholder or iframe if we can embed one */}
              <iframe
                title="Peta Lokasi KB & TK Istiqamah Bandung"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8227096645395!2d107.6189914!3d-6.9117621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6378e907d73%3A0xe13b194d80a373b5!2sYayasan%20Istiqamah%20Bandung!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                className="w-full h-full border-none"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Feedback Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-[#07265F] mb-2">Formulir Pesan</h3>
                <p className="text-xs text-gray-500 font-semibold mb-8">Kirim pertanyaan Anda langsung melalui form di bawah ini</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold text-[#07265F]">Nama Lengkap <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-4.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07A363]/25 focus:border-[#07A363] text-xs font-semibold text-[#07265F]"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold text-[#07265F]">Alamat Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Masukkan email aktif"
                        className="w-full px-4.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07A363]/25 focus:border-[#07A363] text-xs font-semibold text-[#07265F]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-extrabold text-[#07265F]">Subjek Pesan</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subjek pertanyaan (opsional)"
                      className="w-full px-4.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07A363]/25 focus:border-[#07A363] text-xs font-semibold text-[#07265F]"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-extrabold text-[#07265F]">Isi Pesan <span className="text-red-500">*</span></label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tulis pesan lengkap Anda di sini..."
                      rows={5}
                      className="w-full px-4.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#07A363]/25 focus:border-[#07A363] text-xs font-semibold text-[#07265F] resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Kirim Pesan <Send size={14} />
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
