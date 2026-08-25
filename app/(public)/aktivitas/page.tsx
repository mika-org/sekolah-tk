'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/database/client'
import { Quote, MessageSquare, Compass, Sun, Heart, Smile } from 'lucide-react'

const STATIC_ACTIVITIES = [
  {
    title: 'Manasik Haji Cilik',
    desc: 'Melatih nilai-nilai spiritual dan pengenalan rukun Islam kelima melalui simulasi manasik haji lengkap.',
    icon: Compass,
    image: '/images/activity_haji.png'
  },
  {
    title: 'Field Trip Edukatif',
    desc: 'Kunjungan belajar ke tempat luar seperti Pemadam Kebakaran, Kebun Binatang, atau Museum untuk memperluas wawasan anak.',
    icon: Sun,
    image: '/images/activity_fieldtrip.png'
  },
  {
    title: 'Pentas Seni & Akhir Tahun',
    desc: 'Panggung unjuk bakat tari, hafalan Al-Qur\'an, menyanyi, dan drama pendek untuk menumbuhkan rasa percaya diri anak.',
    icon: Smile,
    image: '/images/activity_artshow.png'
  },
  {
    title: 'Jumat Berbagi (Infaq Cilik)',
    desc: 'Melatih empati sosial anak sejak dini melalui pengumpulan infaq sukarela dan penyaluran paket makanan kepada sesama.',
    icon: Heart,
    image: '/images/activity_charity.png'
  }
]

export default function AktivitasPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadTestimonials() {
      const { data, error } = await supabase
        .from('testimonials_tk')
        .select('id, name, job, content, photo')
        .eq('published', true)
        .order('id', { ascending: false })
      if (!error && data) {
        setTestimonials(data)
      }
    }
    loadTestimonials()
  }, [])

  return (
    <div className="w-full pt-24">
      {/* ─── HEADER SECTION ─────────────────────── */}
      <section className="relative py-16 bg-[#07265F] text-white rounded-[32px] max-w-7xl mx-auto px-6 sm:px-8 text-center overflow-hidden shadow-lg mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#07A363]/20 rounded-full pointer-events-none translate-y-12 -translate-x-12" />
        <h1 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Aktivitas &amp; Testimoni</h1>
        <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto opacity-95 relative z-10 leading-relaxed">
          Melihat keceriaan kegiatan belajar di KB &amp; TK Istiqamah serta kisah sukses dari para orang tua wali murid.
        </p>
      </section>

      {/* ─── ACTIVITIES GRID ────────────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">Aktivitas Murid</h2>
          <p className="text-sm text-gray-500 font-semibold mt-1">Kegiatan seru harian dan tahunan sekolah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STATIC_ACTIVITIES.map((act, idx) => {
            const IconComponent = act.icon
            return (
              <div key={idx} className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row hover:shadow-md transition-all">
                <div className="relative w-full sm:w-[180px] h-[180px] flex-shrink-0">
                  <Image src={act.image} alt={act.title} fill className="object-cover" />
                </div>
                <div className="p-6 flex flex-col justify-center space-y-3">
                  <div className="flex items-center gap-2 text-[#07A363]">
                    <div className="p-1.5 bg-[#07A363]/10 rounded-lg">
                      <IconComponent size={16} />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wide">Kegiatan</span>
                  </div>
                  <h3 className="font-extrabold text-[#07265F] text-base leading-tight">{act.title}</h3>
                  <p className="text-xs font-semibold text-[#07265F]/85 leading-relaxed">{act.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ───────────────── */}
      <section className="py-12 bg-white rounded-[32px] max-w-7xl mx-auto my-12 px-6 sm:px-8 lg:px-12 shadow-sm border border-gray-100">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-[#07A363]/10 text-[#07A363] rounded-full mb-3">
            <MessageSquare size={20} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">Apa Kata Orang Tua?</h2>
          <p className="text-sm text-gray-500 font-semibold mt-1">Ulasan jujur dari orang tua wali murid KB &amp; TK Istiqamah</p>
        </div>

        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div key={test.id} className="bg-[#F9F4ED] rounded-[24px] p-6 shadow-sm border border-gray-100 relative min-h-[160px] flex flex-col justify-between">
                <Quote size={28} className="absolute top-4 right-4 text-[#07A363]/10 z-0" />
                <p className="text-xs sm:text-sm font-semibold text-[#07265F]/80 leading-relaxed mb-6 z-10">
                  &ldquo;{test.content}&rdquo;
                </p>
                <div className="flex items-center gap-3 z-10">
                  {test.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={test.photo}
                      alt={test.name}
                      className="w-10 h-10 rounded-full border-2 border-[#07A363] object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-[#07A363] bg-[#07A363]/10 text-[#07A363] flex items-center justify-center font-black text-sm flex-shrink-0">
                      {test.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-extrabold text-[#07265F] text-xs">{test.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{test.job}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm font-semibold text-gray-400">Belum ada testimoni terbit.</p>
          </div>
        )}
      </section>
    </div>
  )
}
