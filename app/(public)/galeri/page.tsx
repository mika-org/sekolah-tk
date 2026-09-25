'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useModalBackHandler } from '@/lib/modal-history'

// Foto galeri autentik dokumentasi kegiatan KB & TK Istiqamah
const GALLERY_ITEMS = [
  {
    id: 'g-wisuda-1',
    src: '/images/gallery/galeri/DSC00536.webp',
    title: 'Wisudawan Cilik Tahfidz Al-Qur\'an',
    desc: 'Kebanggaan dan rasa syukur santri cilik meraih sertifikat capaian hafalan Al-Qur\'an Juz 30.'
  },
  {
    id: 'g-lomba-tari',
    src: '/images/gallery/galeri/99190870-c2d5-477d-98df-2a8db67151b5.webp',
    title: 'Prestasi Juara Lomba Tari Kreasi PAUD/TK',
    desc: 'Penampilan gemilang tim tari cilik Istiqamah dalam ajang Lomba Tari Kreasi Peserta Didik BBGTK Jawa Barat.'
  },
  {
    id: 'g-quran-camp-1',
    src: '/images/gallery/galeri/IMG_8916_11.webp',
    title: 'Qur\'an Camp: Dari Qur\'an Aku Belajar Mandiri',
    desc: 'Kebersamaan dan kemandirian santri dalam agenda tahunan Qur\'an Camp KB & TK Istiqamah.'
  },
  {
    id: 'g-outing-kereta',
    src: '/images/gallery/galeri/0e5f36e8-e974-492f-8584-23ee4ef3eef3_1.webp',
    title: 'Field Trip Edukatif Naik Kereta Api',
    desc: 'Pengalaman seru dan edukatif anak-anak menjelajahi transportasi publik bersama teman-teman.'
  },
  {
    id: 'g-masinis',
    src: '/images/gallery/galeri/2d4578ca-b1d2-422c-879a-a7a7caa15439_2.webp',
    title: 'Mengenal Profesi Bersama Masinis KAI',
    desc: 'Interaksi langsung dengan kru kereta api untuk menumbuhkan cita-cita dan wawasan profesi sejak dini.'
  },
  {
    id: 'g-stasiun',
    src: '/images/gallery/galeri/c75c267a-c04f-44bd-981d-f00b6fd6c639.webp',
    title: 'Tertib & Disiplin di Peron Stasiun Kereta',
    desc: 'Pembiasaan antre rapi, disiplin keselamatan, dan kemandirian saat berada di ruang publik.'
  },
  {
    id: 'g-science-center',
    src: '/images/gallery/galeri/9a40f375-8544-462f-bb0c-e6faeeb1f0e7_4.webp',
    title: 'Eksplorasi Sains di Science Center Ocean World',
    desc: 'Mengenal keajaiban biota laut dan fenomena sains modern melalui instalasi edukasi interaktif.'
  },
  {
    id: 'g-jendela-alam-1',
    src: '/images/gallery/galeri/fa2093cb-7375-4119-86dc-21d904c2b663.webp',
    title: 'Kunjungan Edukasi Alam di Jendela Alam',
    desc: 'Mengenal keanekaragaman flora fauna dan menumbuhkan rasa syukur atas ciptaan Allah SWT.'
  },
  {
    id: 'g-flying-fox',
    src: '/images/gallery/galeri/6bd691a0-eb0d-4951-bb91-d1b22d5b6145.webp',
    title: 'Ketangkasan & Keberanian Outbound Flying Fox',
    desc: 'Melatih motorik kasar, keberanian, dan rasa percaya diri menghadapi tantangan ketinggian yang aman.'
  },
  {
    id: 'g-tenda-camp',
    src: '/images/gallery/galeri/25d4958f-3543-4d72-9e87-908ce770afe2.webp',
    title: 'Keceriaan Berkemah di Qur\'an Camp',
    desc: 'Membangun kebersamaan, adab berbagi makanan, dan kemandirian di dalam tenda perkemahan.'
  },
  {
    id: 'g-api-unggun',
    src: '/images/gallery/galeri/IMG_1196_10.webp',
    title: 'Malam Api Unggun & Tasyakuran Ceria',
    desc: 'Suasana hangat penuh keceriaan santri menyanyikan lagu gembira di sekitar api unggun sekolah.'
  },
  {
    id: 'g-eksplorasi-air',
    src: '/images/gallery/galeri/7de9d875-2a05-4a1b-92d7-11eb2386abc1_3.webp',
    title: 'Petualangan Bermain Air & Kerjasama Tim',
    desc: 'Stimulasi sensorik motorik dan kekompakan anak menyusuri aliran air dangkal yang menyegarkan.'
  },
  {
    id: 'g-pelepasan',
    src: '/images/gallery/galeri/IMG_3646.webp',
    title: 'Pelepasan & Wisuda Tahfizh Siswa Berprestasi',
    desc: 'Momen sakral penuh haru dan bangga wisuda kelulusan siswa KB-TK Istiqamah Bandung.'
  },
  {
    id: 'g-wisuda-mahkota',
    src: '/images/gallery/galeri/DSC00402.webp',
    title: 'Wisuda Putri Tahfidz Al-Qur\'an',
    desc: 'Santriwati cilik mengenakan selempang dan mahkota kehormatan penghafal Al-Qur\'an.'
  },
  {
    id: 'g-paduan-suara',
    src: '/images/gallery/galeri/DSC01556.webp',
    title: 'Gema Shalawat & Nasyid di Panggung Utama',
    desc: 'Penampilan kompak santri melantunkan shalawat merdu dan puji-pujian kepada Nabi Muhammad SAW.'
  },
  {
    id: 'g-asmaul-husna',
    src: '/images/gallery/galeri/DSC01557.webp',
    title: 'Lantunan Asmaul Husna Santriwati',
    desc: 'Melafalkan nama-nama indah Allah SWT dengan khusyuk, melatih artikulasi dan kepercayaan diri tampil.'
  },
  {
    id: 'g-penyerahan-plakat',
    src: '/images/gallery/galeri/DSC05496.webp',
    title: 'Penyerahan Plakat Apresiasi Siswa',
    desc: 'Pemberian plakat penghargaan kepada para santri berprestasi oleh kepala sekolah dan dewan guru.'
  },
  {
    id: 'g-sertifikat-tilawati',
    src: '/images/gallery/galeri/630f908a-4f6f-49fa-9494-ce33a4a34ea8_5.webp',
    title: 'Kelulusan Kenaikan Jilid Tilawati',
    desc: 'Ekspresi bangga anak-anak memegang sertifikat pencapaian membaca Al-Qur\'an metode Tilawati.'
  },
  {
    id: 'g-tilawati-kelas',
    src: '/images/gallery/galeri/db00711f-5a6f-44e5-96da-90025f51e7dd.webp',
    title: 'Pembelajaran Tilawati Klasikal di Kelas',
    desc: 'Guru mengenalkan makharijul huruf hijaiyah berirama Rost yang interaktif dan menyenangkan.'
  },
  {
    id: 'g-shalat-berjamaah',
    src: '/images/gallery/galeri/IMG_5191.webp',
    title: 'Praktik Gerakan Shalat Berjamaah',
    desc: 'Pembiasaan ibadah praktis shalat dhuha dengan adab tertib di ruang kelas Umar bin Khattab.'
  },
  {
    id: 'g-life-skill-beras',
    src: '/images/gallery/galeri/IMG_5178.webp',
    title: 'Aktivitas Sensorik & Life Skill Mandiri',
    desc: 'Melatih konsentrasi, koordinasi mata-tangan, dan kesabaran melalui stimulasi sensori motorik halus.'
  },
  {
    id: 'g-mewarnai-kolaboratif',
    src: '/images/gallery/galeri/IMG_0912_8.webp',
    title: 'Karya Kreativitas Mewarnai Kolaboratif',
    desc: 'Kerja sama harmonis mewarnai poster figur islami berukuran besar melatih empati dan motorik.'
  },
  {
    id: 'g-kelas-ceria',
    src: '/images/gallery/galeri/IMG_4891.webp',
    title: 'Suasana Belajar Aktif & Berpusat Pada Anak',
    desc: 'Ruang kelas ceria dengan meja belajar warna-warni yang merangsang antusiasme belajar setiap hari.'
  },
  {
    id: 'g-senam-irama',
    src: '/images/gallery/galeri/6f3a79a8-d071-4025-9ca9-3f30f5668eea.webp',
    title: 'Gerak Irama & Lagu Ceria Dalam Kelas',
    desc: 'Aktivitas pembuka kelas yang riang untuk meningkatkan konsentrasi dan stamina belajar anak.'
  },
  {
    id: 'g-angklung',
    src: '/images/gallery/galeri/IMG-20260909-WA0025.jpg.webp',
    title: 'Ekstrakurikuler Seni Musik Angklung Sunda',
    desc: 'Melatih kepekaan nada, harmoni musikal, dan kecintaan pada warisan budaya daerah sejak dini.'
  },
  {
    id: 'g-studio-rekaman',
    src: '/images/gallery/galeri/b9984032-e597-49e9-b273-bd9b2f6d5c44.webp',
    title: 'Eksplorasi Suara di Studio Podcast Sekolah',
    desc: 'Mencoba mikrofon dan headphone profesional untuk melatih keberanian berbicara dan berekspresi.'
  },
  {
    id: 'g-senam-lapangan',
    src: '/images/gallery/galeri/3e41d139-1d9f-43e8-81a6-1608646b4ded.webp',
    title: 'Olahraga Peregangan & Senam Sehat Pagi',
    desc: 'Kegiatan fisik rutin di lapangan terbuka yang teduh untuk membangun daya tahan tubuh prima.'
  },
  {
    id: 'g-futsal-tanding',
    src: '/images/gallery/galeri/c36b51a1-d106-4bdf-a348-083f266b0106.webp',
    title: 'Pertandingan Futsal Mini Anak',
    desc: 'Aktivitas ekstrakurikuler futsal yang memupuk sportivitas, kelincahan, dan kerja sama tim.'
  },
  {
    id: 'g-futsal-briefing',
    src: '/images/gallery/galeri/cd40c543-e0a4-4d7c-8ef3-39cc5960a025.webp',
    title: 'Briefing Strategi Tim Futsal Bersama Pelatih',
    desc: 'Anak-anak mendengarkan arahan pelatih dengan penuh perhatian sebelum memulai pertandingan.'
  },
  {
    id: 'g-tari-merah-kuning',
    src: '/images/gallery/galeri/WhatsApp Image 2026-09-09 at 14.26.03.webp',
    title: 'Pentas Seni Tari Kreasi Nusantara',
    desc: 'Kostum gemerlap dan mahkota anggun menghiasi penampilan panggung para penari cilik Istiqamah.'
  },
  {
    id: 'g-tari-saman',
    src: '/images/gallery/galeri/e7777a50-bd66-4a1f-8fcf-65186e447c02.webp',
    title: 'Tari Saman Cilik Penuh Kekompakan',
    desc: 'Formasi rapi berbusana adat serasi, melatih keselarasan gerak dan kekompakan tim.'
  },
  {
    id: 'g-tari-merak',
    src: '/images/gallery/galeri/f17b6a33-20f2-4487-b5c0-bbbb1afec095.webp',
    title: 'Tari Tradisional Merak Berbusana Batik',
    desc: 'Keceriaan siswi menampilkan tarian khas daerah Jawa Barat dengan sayap merak dan mahkota indah.'
  },
  {
    id: 'g-tari-kumbang-1',
    src: '/images/gallery/galeri/IMG_1958.webp',
    title: 'Pentas Gerak & Tari Kumbang Cilik',
    desc: 'Tingkah lucu dan menggemaskan anak-anak mengenakan kostum kumbang bermain peran di panggung teater.'
  },
  {
    id: 'g-tari-lebah',
    src: '/images/gallery/galeri/IMG_1959.webp',
    title: 'Tari Lebah Imut Penuh Percaya Diri',
    desc: 'Melatih keluwesan gerak tubuh dan keberanian tampil di depan ratusan pasang mata orang tua.'
  },
  {
    id: 'g-backstage',
    src: '/images/gallery/galeri/IMG_1963.webp',
    title: 'Kesiapan di Balik Panggung Pentas Seni',
    desc: 'Pendampingan penuh kasih sayang dari guru mempersiapkan anak-anak sebelum giliran tampil panggung.'
  },
  {
    id: 'g-drama-pendekar',
    src: '/images/gallery/galeri/IMG_1966_7.webp',
    title: 'Drama Teater Pendekar Cilik Berkarakter',
    desc: 'Aksi panggung teatrikal sarat pesan moral keberanian membela kebaikan dan persahabatan.'
  }
]


export default function GaleriPage() {
  const [activePhoto, setActivePhoto] = useState<typeof GALLERY_ITEMS[0] | null>(null)

  useModalBackHandler(Boolean(activePhoto), () => setActivePhoto(null))

  return (
    <div className="w-full pt-20 sm:pt-24 pb-16">
      {/* ─── HEADER SECTION ─────────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="bg-[#0B7347] rounded-[24px] sm:rounded-[32px] py-10 sm:py-14 px-6 sm:px-10 text-center text-white shadow-xl">
          <span className="inline-block bg-white/15 text-emerald-100 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            Dokumentasi Sekolah
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-black tracking-tight">
            Galeri Kegiatan &amp; Prestasi
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
            Merekam setiap langkah kecil penuh makna, keceriaan bermain, eksplorasi belajar, dan pencapaian membanggakan putra-putri KB &amp; TK Istiqamah Bandung.
          </p>
        </div>
      </section>

      {/* ─── GALLERY PHOTO GRID (No Category Tabs) ─── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              onClick={() => setActivePhoto(item)}
              className="group relative rounded-[22px] overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-emerald-50 cursor-pointer flex flex-col"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-emerald-50/50">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-[#0B7347] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn size={20} />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-black/45 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wide">
                  {idx + 1} / {GALLERY_ITEMS.length}
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-[15px] text-[#1B3B6F] group-hover:text-[#0B7347] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#4A607A] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── LIGHTBOX MODAL ─────────────────────── */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActivePhoto(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              aria-label="Tutup foto"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-emerald-300 transition-colors p-2.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer z-20"
            >
              <X size={22} />
            </button>

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-[#102A4E] rounded-[24px] sm:rounded-[30px] overflow-hidden shadow-2xl border border-white/15 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[50vh] sm:h-[65vh] bg-black/50">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </div>
              <div className="p-4 sm:p-6 text-white text-left">
                <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                  {activePhoto.title}
                </h3>
                <p className="text-xs sm:text-sm text-blue-100/80 mt-1 font-medium">
                  {activePhoto.desc}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
