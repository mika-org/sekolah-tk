'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/database/client'
import { Image as ImageIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FALLBACK_GALLERY = [
  { id: 'f1', title: 'Belajar Berhitung & Menulis di Kelas Ceria', image: '/images/gallery/1.jpg' },
  { id: 'f2', title: 'Pentas Seni Tari Tradisional Anak', image: '/images/gallery/2.jpg' },
  { id: 'f3', title: 'Prestasi Juara Lomba Siswa & Apresiasi', image: '/images/gallery/3.jpg' },
  { id: 'f4', title: 'Keceriaan Drama & Pentas Seni Budaya Daerah', image: '/images/gallery/4.jpg' },
  { id: 'f5', title: 'Cooking Day & Kreasi Masak Cilik', image: '/images/gallery/5.jpg' },
  { id: 'f6', title: 'Sarana Bermain Keseimbangan Outdoor', image: '/images/gallery/6.jpg' },
  { id: 'f7', title: 'Ketangkasan Memanjat Jaring Outbound', image: '/images/gallery/7.jpg' },
  { id: 'f8', title: 'Lomba Adzan & Iqomah Pentas PAI', image: '/images/gallery/8.jpg' },
  { id: 'f9', title: 'Petualangan Naik Rakit Air Outbound', image: '/images/gallery/9.jpg' },
  { id: 'f10', title: 'Edukasi Mengenal & Menyayangi Hewan Kelinci', image: '/images/gallery/10.jpg' },
]

export default function GaleriPage() {
  const [galleryItems, setGalleryItems] = useState<any[]>(FALLBACK_GALLERY)
  const [activePhoto, setActivePhoto] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadGallery() {
      setLoading(true)
      const { data, error } = await supabase
        .from('galleries_tk')
        .select('id, title, image')
        .neq('category', 'Hero Banner')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setGalleryItems(data)
      }
      setLoading(false)
    }
    loadGallery()
  }, [])

  return (
    <div className="w-full pt-24">
      {/* ─── HEADER SECTION ─────────────────────── */}
      <section className="relative py-16 bg-[#07265F] text-white rounded-[32px] max-w-7xl mx-auto px-6 sm:px-8 text-center overflow-hidden shadow-lg mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#07A363]/20 rounded-full pointer-events-none translate-y-12 -translate-x-12" />
        <h1 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Galeri Foto</h1>
        <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto opacity-95 relative z-10 leading-relaxed">
          Mengabadikan keceriaan, kreativitas, dan pencapaian membanggakan putra-putri kami selama beraktivitas di sekolah.
        </p>
      </section>

      {/* ─── GALLERY SHOWCASE ─────────── */}
      <section className="py-6 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#07A363]" />
          </div>
        ) : galleryItems.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {galleryItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActivePhoto(item)}
                  className="relative rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-all aspect-square group bg-[#07265F]/20 cursor-pointer border border-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-left">
                    <p className="text-white font-extrabold text-xs sm:text-sm leading-snug mt-2 line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[28px] border border-gray-100">
            <div className="inline-flex p-3 bg-gray-100 rounded-full text-gray-400 mb-2">
              <ImageIcon size={28} />
            </div>
            <p className="text-sm font-semibold text-gray-400">Tidak ada foto galeri.</p>
          </div>
        )}
      </section>

      {/* ─── LIGHTBOX MODAL ─────────────────────── */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActivePhoto(null)}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-6 right-6 text-white hover:text-[#07A363] transition-colors p-2 bg-white/10 rounded-full cursor-pointer z-60"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center bg-[#07265F] rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[60vh] md:h-[70vh] bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto.image}
                  alt={activePhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-full p-6 text-white text-left space-y-1.5">
                <h3 className="font-extrabold text-sm sm:text-base leading-snug">{activePhoto.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
