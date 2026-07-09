'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Calendar, Target, Award } from 'lucide-react'

const PROGRAMS_DETAIL = [
  {
    title: 'Calistung Dasar',
    desc: 'Membantu anak siap membaca, menulis, dan berhitung tanpa paksaan.',
    longDesc: 'Program ini dirancang untuk melatih motorik halus dan kognitif anak agar siap membaca suku kata, memegang alat tulis dengan benar, serta memahami konsep angka dan logika berhitung dasar. Seluruh proses dilakukan melalui permainan sensorik dan visual yang menyenangkan.',
    age: 'Usia 4 - 6 Tahun',
    target: 'Kemampuan membaca lancar kalimat pendek dan menghitung angka 1-50 secara logika dasar.',
    activities: 'Menulis di atas pasir berwarna, mencocokkan kartu kata, berhitung menggunakan balok kayu warna-warni.',
    image: '/images/Cover.png'
  },
  {
    title: 'Akhlak Islami',
    desc: 'Membentuk kebiasaan baik dan sopan santun sejak usia dini.',
    longDesc: 'Pembentukan karakter mulia merupakan prioritas kami. Murid diajarkan tata krama makan, minum, menyapa, dan bekerja sama dengan teman sebaya. Pembiasaan ibadah praktis harian juga diintegrasikan ke dalam aktivitas sekolah setiap hari.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Terbentuknya kebiasaan mengucap salam, menggunakan kalimat sopan (maaf, tolong, terima kasih), dan kemandirian dasar.',
    activities: 'Dongeng interaktif kisah Nabi, simulasi antrean tertib, praktik berwudhu dan shalat berjamaah.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_44 PM (2).png'
  },
  {
    title: 'Metode Tilawati',
    desc: 'Mengenalkan Al-Qur\'an secara bertahap dengan irama lagu Rost yang mudah dihafal.',
    longDesc: 'Metode Tilawati menekankan pada pengucapan huruf hijaiyah yang benar (makhraj) dan menyenangkan secara klasikal. Murid dibimbing melantunkan ayat suci Al-Qur\'an dengan lagu Rost agar nyaman didengar dan mudah ditirukan.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Kelancaran membaca jilid Tilawati dasar, hafal Juz Amma pendek, dan doa-doa praktis harian.',
    activities: 'Mendengarkan bimbingan lagu Rost dari guru, membaca klasikal dengan peraga Tilawati besar, hafalan setoran harian.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (3).png'
  },
  {
    title: 'Seni & Kreativitas',
    desc: 'Meningkatkan kebebasan berekspresi dan berani berkarya seni rupa.',
    longDesc: 'Kami menyediakan ruang eksplorasi tanpa batas untuk merangsang otak kanan anak. Anak-anak bebas berkreasi menggunakan berbagai media warna, tekstur, dan bentuk untuk meningkatkan kepercayaan diri serta kecakapan seni motorik.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Mengembangkan kreativitas estetik, kelenturan koordinasi mata-tangan, dan apresiasi karya.',
    activities: 'Finger painting bebas di kanvas, kolase daun kering, meronce manik-manik, membuat lilin mainan (playdough).',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (4).png'
  },
  {
    title: 'Eksplorasi Dunia',
    desc: 'Melatih rasa ingin tahu melalui eksperimen sains sederhana dan lingkungan.',
    longDesc: 'Murid diajak melihat fenomena alam di sekitar mereka. Melalui pendekatan bertanya dan menyelidiki, program ini mendorong anak-anak menyukai proses belajar ilmiah, memahami lingkungan hidup, serta peduli pada tanaman dan hewan peliharaan.',
    age: 'Usia 4 - 6 Tahun',
    target: 'Kemampuan berpikir kritis-kreatif tingkat dasar, rasa ingin tahu ilmiah, dan peduli kebersihan alam.',
    activities: 'Eksperimen pencampuran warna, mengamati metamorfosis kupu-kupu di botol, menanam bibit sayur di kebun sekolah.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_48 PM (5).png'
  }
]

export default function ProgramPage() {
  return (
    <div className="w-full pt-24">
      {/* ─── HEADER SECTION ─────────────────────── */}
      <section className="relative py-16 bg-[#07265F] text-white rounded-[32px] max-w-7xl mx-auto px-6 sm:px-8 text-center overflow-hidden shadow-lg mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#07A363]/20 rounded-full pointer-events-none translate-y-12 -translate-x-12" />
        <h1 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Program Unggulan</h1>
        <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto opacity-95 relative z-10 leading-relaxed">
          Kurikulum yang dirancang khusus untuk memenuhi kebutuhan motorik, kognitif, spiritual, dan sosial-emosional anak usia dini.
        </p>
      </section>

      {/* ─── DETAIL PROGRAMS LIST ───────────────── */}
      <section className="py-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        {PROGRAMS_DETAIL.map((prog, idx) => {
          const isEven = idx % 2 === 0
          return (
            <div
              key={idx}
              className={`bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Image Column */}
              <div className={`lg:col-span-5 relative w-full h-[240px] sm:h-[300px] rounded-[24px] overflow-hidden shadow-inner order-first ${
                isEven ? 'lg:order-first' : 'lg:order-last'
              }`}>
                <Image
                  src={prog.image}
                  alt={prog.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Description Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#07A363]/10 text-[#07A363] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles size={12} /> Program {idx + 1}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#07265F]">{prog.title}</h2>
                <p className="text-sm font-semibold text-[#07265F] leading-relaxed italic">
                  &ldquo;{prog.desc}&rdquo;
                </p>
                <p className="text-sm font-semibold text-[#07265F]/75 leading-relaxed">
                  {prog.longDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#F9F4ED] rounded-xl p-3.5 border border-gray-50">
                    <div className="flex items-center gap-1.5 text-[#07A363] font-bold text-xs mb-1">
                      <Calendar size={14} /> Usia Murid
                    </div>
                    <p className="text-xs font-extrabold text-[#07265F]">{prog.age}</p>
                  </div>
                  <div className="bg-[#F9F4ED] rounded-xl p-3.5 border border-gray-50">
                    <div className="flex items-center gap-1.5 text-[#07A363] font-bold text-xs mb-1">
                      <Target size={14} /> Target Capaian
                    </div>
                    <p className="text-[10px] sm:text-xs font-semibold text-[#07265F] leading-tight">{prog.target}</p>
                  </div>
                  <div className="bg-[#F9F4ED] rounded-xl p-3.5 border border-gray-50">
                    <div className="flex items-center gap-1.5 text-[#07A363] font-bold text-xs mb-1">
                      <Award size={14} /> Ragam Kegiatan
                    </div>
                    <p className="text-[10px] sm:text-xs font-semibold text-[#07265F] leading-tight">{prog.activities}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ─── PPDB BANNER ────────────────────────── */}
      <section className="bg-[#07A363] text-white py-12 rounded-[32px] max-w-7xl mx-auto my-12 px-6 sm:px-8 lg:px-12 text-center shadow-lg relative overflow-hidden">
        <h2 className="text-xl sm:text-2xl font-black mb-4">Tertarik Dengan Program Belajar Kami?</h2>
        <p className="text-xs sm:text-sm font-semibold max-w-2xl mx-auto mb-6 opacity-90">
          Dapatkan pengalaman bermain dan belajar Islami terbaik bagi buah hati Anda dengan bergabung di pendaftaran PPDB online kami.
        </p>
        <Link href="/ppdb" className="bg-[#07265F] hover:bg-[#07265F]/90 text-white font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-full transition-all inline-block shadow-md">
          Daftar Sekarang
        </Link>
      </section>
    </div>
  )
}
