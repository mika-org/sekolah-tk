'use client'

import React from 'react'
import Image from 'next/image'
import { Star, CheckCircle } from 'lucide-react'

export default function TentangKamiPage() {
  return (
    <div className="w-full pt-24">
      {/* ─── HEADER SECTION ─────────────────────── */}
      <section className="relative py-16 bg-[#07265F] text-white rounded-[32px] max-w-7xl mx-auto px-6 sm:px-8 text-center overflow-hidden shadow-lg mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#07A363]/20 rounded-full pointer-events-none translate-y-12 -translate-x-12" />
        <h1 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Tentang Kami</h1>
        <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto opacity-95 relative z-10 leading-relaxed">
          Mengenal lebih dekat KB &amp; TK Istiqamah Bandung. Sekolah ramah anak yang berfokus pada bermain kreatif, akhlak mulia, dan kurikulum Islami terarah.
        </p>
      </section>

      {/* ─── HISTORY & PROFILE SECTION ──────────── */}
      <section className="py-12 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-[300px] sm:h-[400px] rounded-[28px] overflow-hidden shadow-md">
            <Image
              src="/images/Cover.png"
              alt="Gedung KB & TK Istiqamah Bandung"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">Profil Sekolah</h2>
            <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
              KB &amp; TK Istiqamah Bandung didirikan dengan komitmen untuk memberikan pondasi pendidikan terbaik bagi generasi masa depan Islam sejak usia dini. Kami percaya bahwa tahun-tahun awal adalah periode emas (*golden age*) yang sangat berharga bagi tumbuh kembang karakter, intelektual, dan kreativitas buah hati Anda.
            </p>
            <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
              Dengan mengintegrasikan nilai-nilai luhur keislaman dengan metode pembelajaran modern yang menyenangkan (*active and fun learning*), kami bertekad menciptakan lingkungan belajar yang aman, suportif, dan merangsang rasa ingin tahu anak-anak.
            </p>
          </div>
        </div>
      </section>

      {/* ─── VISION & MISSION SECTION ───────────── */}
      <section className="py-12 bg-white rounded-[32px] max-w-7xl mx-auto my-12 px-6 sm:px-8 lg:px-12 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Visi */}
          <div className="bg-[#F9F4ED] rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-xl font-black text-[#07265F] mb-4 flex items-center gap-2">
              <Star fill="#07A363" color="#07A363" size={20} /> Visi Kami
            </h3>
            <p className="text-sm sm:text-base font-extrabold text-[#07265F]/90 leading-relaxed">
              &ldquo;Menjadi lembaga pendidikan anak usia dini Islami yang unggul dalam membentuk generasi bertauhid, berakhlak mulia, cerdas, kreatif, dan mandiri.&rdquo;
            </p>
          </div>

          {/* Misi */}
          <div className="flex flex-col justify-center space-y-4">
            <h3 className="text-xl font-black text-[#07265F] mb-2 flex items-center gap-2">
              <Star fill="#07A363" color="#07A363" size={20} /> Misi Kami
            </h3>
            <ul className="space-y-3.5">
              {[
                'Menanamkan nilai-nilai keislaman sejak dini melalui pembiasaan ibadah sehari-hari dan akhlak mulia.',
                'Menyelenggarakan kegiatan pembelajaran aktif, kreatif, dan menyenangkan melalui metode bermain terarah.',
                'Mengembangkan potensi kecerdasan majemuk (multiple intelligence) anak secara optimal sesuai keunikan individu.',
                'Menjalin kolaborasi harmonis dengan orang tua wali murid untuk mendukung tumbuh kembang anak di rumah.',
              ].map((misi, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-[#07A363] mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold text-[#07265F]/85 leading-snug">{misi}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US (Asset 3 background) ── */}
      <section
        className="relative bg-cover bg-top pt-[15%] py-20 z-20 w-[101vw] right-[10px] bg-transparent"
        style={{ backgroundImage: "url('/images/Asset 3.png')" }}
      >
        <div className="absolute left-[4%] top-[14%] w-16 h-10 pointer-events-none opacity-90">
          <Image src="/images/Asset 13.png" alt="Cloud" fill className="object-contain" />
        </div>
        <div className="absolute right-[4%] top-[20%] w-16 h-10 pointer-events-none opacity-90">
          <Image src="/images/Asset 14.png" alt="Cloud" fill className="object-contain" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-[8rem] lg:px-12 relative z-10">
          <div className="text-center mb-14 relative inline-block w-full">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">Keunggulan Istiqamah</h2>
            <div className="absolute -top-5 right-[25%] text-amber-400">
              <Star fill="currentColor" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            {[
              { icon: '/images/Asset 6.png', alt: 'Bermain Kreatif', title: 'Bermain Kreatif', desc: 'Mengasah imajinasi melalui aktivitas bermain yang kreatif.' },
              { icon: '/images/Asset 5.png', alt: 'Berakhlak Sejak Dini', title: 'Berakhlak Sejak Dini', desc: 'Pembiasaan sikap baik setiap hari di sekolah maupun rumah.' },
              { icon: '/images/Asset 4.png', alt: 'Kurikulum Islami Terarah', title: 'Kurikulum Islami Terarah', desc: 'Pembelajaran Islami sesuai tahap usia anak secara menyenangkan.' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-[28px] p-8 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center gap-4">
                <div className="relative w-16 h-16">
                  <Image src={card.icon} alt={card.alt} fill className="object-contain" />
                </div>
                <h3 className="font-extrabold text-[#07265F] text-base">{card.title}</h3>
                <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
