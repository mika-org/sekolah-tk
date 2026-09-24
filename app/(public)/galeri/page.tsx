'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useModalBackHandler } from '@/lib/modal-history'

// Gambar dan deskripsi diambil langsung dari Galeri Beranda (Home Gallery)
const GALLERY_ITEMS = [
  {
    id: 'g3',
    src: '/images/gallery/3.jpg',
    title: 'Prestasi Juara Lomba & Siswa Berprestasi',
    desc: 'Momen apresiasi dan kebanggaan atas capaian serta prestasi putra-putri TK Istiqamah.'
  },
  {
    id: 'g1',
    src: '/images/gallery/1.jpg',
    title: 'Aktivitas Belajar Berhitung di Kelas',
    desc: 'Pembelajaran literasi dan numerasi awal yang interaktif dan menyenangkan.'
  },
  {
    id: 'g2',
    src: '/images/gallery/2.jpg',
    title: 'Pentas Tari Tradisional Anak Istiqamah',
    desc: 'Mengenal kekayaan budaya nusantara serta melatih rasa percaya diri tampil di panggung.'
  },
  {
    id: 'g4',
    src: '/images/gallery/4.jpg',
    title: 'Pentas Seni Budaya & Teater Cilik',
    desc: 'Wadah berekspresi, berimajinasi, dan menumbuhkan kreativitas seni anak.'
  },
  {
    id: 'g5',
    src: '/images/gallery/5.jpg',
    title: 'Cooking Day & Kreasi Masak Ceria',
    desc: 'Melatih motorik halus, kemandirian, dan kerja sama melalui aktivitas memasak sederhana.'
  },
  {
    id: 'g6',
    src: '/images/gallery/6.jpg',
    title: 'Bermain Ayunan & Keseimbangan Outdoor',
    desc: 'Stimulasi motorik kasar dan kegembiraan bergerak bebas di playground sekolah.'
  },
  {
    id: 'g7',
    src: '/images/gallery/7.jpg',
    title: 'Ketangkasan Outbound Jaring Tali',
    desc: 'Melatih keberanian, kelenturan tubuh, dan ketangkasan melalui wahana outbound aman.'
  },
  {
    id: 'g8',
    src: '/images/gallery/8.jpg',
    title: 'Lomba Adzan & Iqomah Pentas PAI',
    desc: 'Menumbuhkan kecintaan terhadap syiar Islam dan adab ibadah sejak usia dini.'
  },
  {
    id: 'g9',
    src: '/images/gallery/9.jpg',
    title: 'Petualangan Air Naik Rakit Edukasi',
    desc: 'Pengalaman eksplorasi alam luar ruang yang seru, edukatif, dan memupuk kerja sama.'
  },
  {
    id: 'g10',
    src: '/images/gallery/10.jpg',
    title: 'Mengenal & Menyayangi Satwa Kelinci',
    desc: 'Membangun empati, rasa kasih sayang, dan kepedulian anak terhadap makhluk ciptaan Allah.'
  },
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
