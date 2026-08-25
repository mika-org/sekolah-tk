'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/database/client'
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Star,
  Quote,
  ArrowRight
} from 'lucide-react'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
}

const heroVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 }
}

const PROGRAMS = [
  {
    title: 'Calistung Dasar',
    desc: 'Membantu anak siap membaca, menulis, dan berhitung.',
    image: '/images/Cover.png'
  },
  {
    title: 'Akhlak Islami',
    desc: 'Membentuk kebiasaan baik sejak usia dini.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_44 PM (2).png'
  },
  {
    title: 'Metode Tilawati',
    desc: 'Mengenalkan Al-Qur\'an bertahap dengan lagu Rost agar mudah dihafal.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (3).png'
  },
  {
    title: 'Seni & Kreativitas',
    desc: 'Meningkatkan kebebasan berekspresi dan berani berkarya.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (4).png'
  },
  {
    title: 'Eksplorasi Dunia',
    desc: 'Melatih rasa ingin tahu melalui berbagai kegiatan.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_48 PM (5).png'
  }
]

const FALLBACK_GALLERY = [
  { id: 'f1', title: 'Kegiatan Belajar', image: '/images/gallery_1.png', category: 'Kegiatan' },
  { id: 'f2', title: 'Sarana Sekolah', image: '/images/gallery_2.png', category: 'Sarana' },
  { id: 'f3', title: 'Prestasi Murid', image: '/images/gallery_3.png', category: 'Prestasi' },
  { id: 'f4', title: 'Aktivitas Sekolah', image: '/images/gallery_4.png', category: 'Kegiatan' },
]

export default function HomePage() {
  const [galleryItems, setGalleryItems] = useState<any[]>(FALLBACK_GALLERY)
  const [[galleryPage, galleryDirection], setGalleryPage] = useState([0, 0])
  const [visibleItems, setVisibleItems] = useState(5)

  const [testimonials, setTestimonials] = useState<any[]>([])
  const [heroBanners, setHeroBanners] = useState<any[]>([])
  const [currentHero, setCurrentHero] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleItems(5)
      } else if (window.innerWidth >= 768) {
        setVisibleItems(3)
      } else {
        setVisibleItems(1)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const nextGallery = useCallback(() => {
    const maxIndex = galleryItems.length - visibleItems
    if (maxIndex <= 0) return
    setGalleryPage(prev => {
      const nextIndex = prev[0] >= maxIndex ? 0 : prev[0] + 1
      return [nextIndex, 1]
    })
  }, [galleryItems.length, visibleItems])

  const prevGallery = useCallback(() => {
    const maxIndex = galleryItems.length - visibleItems
    if (maxIndex <= 0) return
    setGalleryPage(prev => {
      const prevIndex = prev[0] <= 0 ? maxIndex : prev[0] - 1
      return [prevIndex, -1]
    })
  }, [galleryItems.length, visibleItems])

  const nextHero = useCallback(() => {
    if (heroBanners.length <= 1) return
    setCurrentHero(prev => (prev + 1) % heroBanners.length)
  }, [heroBanners.length])

  const prevHero = useCallback(() => {
    if (heroBanners.length <= 1) return
    setCurrentHero(prev => (prev - 1 + heroBanners.length) % heroBanners.length)
  }, [heroBanners.length])

  useEffect(() => {
    async function loadGallery() {
      const { data, error } = await supabase
        .from('galleries_tk')
        .select('id, title, image, category')
        .neq('category', 'Hero Banner')
        .order('created_at', { ascending: false })
        .limit(10)
      if (!error && data && data.length > 0) {
        setGalleryItems(data)
      }
    }
    async function loadHeroBanners() {
      const { data, error } = await supabase
        .from('galleries_tk')
        .select('id, title, image, category')
        .eq('category', 'Hero Banner')
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        setHeroBanners(data)
      } else {
        setHeroBanners([
          {
            id: 'default-1',
            image: '/images/Cover.png',
            title: JSON.stringify({ buttonText: 'Daftar PPDB Sekarang', buttonLink: '/ppdb' })
          },
          {
            id: 'default-2',
            image: '/images/ChatGPT Image Jun 17, 2026, 10_17_44 PM (2).png',
            title: JSON.stringify({ buttonText: 'Lihat Program', buttonLink: '/program' })
          }
        ])
      }
    }
    async function loadTestimonials() {
      const { data, error } = await supabase
        .from('testimonials_tk')
        .select('id, name, job, content, photo')
        .eq('published', true)
        .order('id', { ascending: false })
        .limit(10)
      if (!error && data) setTestimonials(data)
    }
    loadGallery()
    loadHeroBanners()
    loadTestimonials()
  }, [])

  // Auto-advance gallery slider
  useEffect(() => {
    if (galleryItems.length <= visibleItems) return
    const t = setInterval(() => nextGallery(), 4000)
    return () => clearInterval(t)
  }, [galleryItems, visibleItems, nextGallery])

  // Auto-advance hero banner slider
  useEffect(() => {
    if (heroBanners.length <= 1) return
    const t = setInterval(() => nextHero(), 6000)
    return () => clearInterval(t)
  }, [heroBanners, nextHero])

  return (
    <div className="w-full">
      {/* JSON-LD Structured Data for Local Business / School */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "School",
            "name": "KB & TK Istiqamah Bandung",
            "url": "https://tkistiqamah.sch.id",
            "logo": "https://tkistiqamah.sch.id/images/school_logo.png",
            "image": "https://tkistiqamah.sch.id/images/Cover.png",
            "description": "Website Resmi KB & TK Istiqamah Bandung. Mengembangkan potensi buah hati melalui bermain kreatif, pengenalan akhlak mulia sejak dini, dan kurikulum Islami terarah.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Jl. Taman Citarum, Kec. Bandung Wetan",
              "addressLocality": "Bandung",
              "addressRegion": "Jawa Barat",
              "postalCode": "40115",
              "addressCountry": "ID"
            },
            "telephone": "022-4241799",
            "email": "info@tkistiqamah.sch.id",
            "sameAs": [
              "https://www.instagram.com/kbtkistiqamah",
              "https://www.facebook.com/TK-Istiqamah-Bandung"
            ]
          })
        }}
      />

      {/* ─── HERO SLIDER ───────────────────────── */}
      <section className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[90vh] min-h-[500px] overflow-hidden group">
        {/* Banner Images Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {heroBanners.length > 0 && (
              <motion.div
                key={currentHero}
                variants={heroVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={heroBanners[currentHero]?.image}
                  alt="Banner Hero"
                  fill
                  priority
                  className="object-cover w-full h-full"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-black/35 z-10" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons Overlay */}
        {heroBanners.length > 0 && (() => {
          const banner = heroBanners[currentHero]
          let btnText = ''
          let btnLink = ''
          try {
            const parsed = JSON.parse(banner.title)
            btnText = parsed.buttonText || ''
            btnLink = parsed.buttonLink || ''
          } catch {
            btnText = banner.title || ''
            btnLink = '/ppdb'
          }

          if (!btnText) return null

          const btnClass = "px-10 py-4 bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-full transition-all cursor-pointer shadow-xl hover:scale-105 z-20"

          return (
            <div className="absolute inset-0 flex flex-col justify-end items-center pb-16 sm:pb-24 lg:pb-28 z-20">
              <Link href={btnLink || '/ppdb'} className={btnClass}>
                {btnText}
              </Link>
            </div>
          )
        })()}

        {/* Navigation Arrows */}
        {heroBanners.length > 1 && (
          <>
            <button
              onClick={prevHero}
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all cursor-pointer shadow-md z-30 opacity-0 group-hover:opacity-100 duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextHero}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all cursor-pointer shadow-md z-30 opacity-0 group-hover:opacity-100 duration-300"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {heroBanners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHero(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === currentHero ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── WHY CHOOSE US ── */}
      <section
        className="relative bg-cover bg-top pt-[10%] py-20 z-20 w-[101vw] right-[10px] bg-transparent -mt-28 sm:-mt-44 lg:-mt-56"
        style={{ backgroundImage: "url('/images/Asset 3.png')" }}
      >
        <div className="absolute left-[4%] top-[14%] w-16 h-10 pointer-events-none opacity-90">
          <Image src="/images/Asset 13.png" alt="Cloud" fill className="object-contain" />
        </div>
        <div className="absolute right-[4%] top-[20%] w-16 h-10 pointer-events-none opacity-90">
          <Image src="/images/Asset 14.png" alt="Cloud" fill className="object-contain" />
        </div>
        <div className="absolute left-[12%] bottom-[22%] text-amber-400">
          <Star fill="currentColor" size={14} />
        </div>
        <div className="absolute right-[18%] bottom-[30%] text-amber-400">
          <Star fill="currentColor" size={12} />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-[8rem] lg:px-12 relative z-10">
          <div className="text-center mb-14 relative inline-block w-full">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">Mengapa Memilih Istiqamah</h2>
            <div className="absolute -top-5 right-[22%] text-amber-400">
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

          <div className="flex justify-center mt-12">
            <Link href="/tentang-kami" className="flex items-center gap-2 font-extrabold text-sm text-[#07A363] hover:text-[#07A363]/80 transition-colors">
              Pelajari Visi &amp; Misi Kami <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROGRAM UNGGULAN ───────────────────── */}
      <section className="pb-16 bg-[#F9F4ED] relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-primary-blue">Program Unggulan Kami</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {PROGRAMS.map((prog, idx) => (
              <div key={idx} className="bg-white rounded-[28px] shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center p-5 pt-14 relative mt-10 group">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-4 border-[#07A363] overflow-hidden bg-white shadow-md">
                  <div className="relative w-full h-full">
                    <Image src={prog.image} alt={prog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex flex-col grow space-y-2 mt-2">
                  <h3 className="font-extrabold text-primary-blue text-sm group-hover:text-primary-green transition-colors">{prog.title}</h3>
                  <p className="text-xs text-primary-blue/75 font-semibold leading-relaxed">{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/program" className="flex items-center gap-2 font-extrabold text-sm text-primary-green hover:text-primary-green/80 transition-colors">
              Lihat Detail Kurikulum <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── GALLERY SLIDER ─── */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:h-[140vh] flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-full translate-y-[-99%] pointer-events-none">
          <svg viewBox="0 0 1440 80" className="w-full h-10 sm:h-16 fill-primary-green" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1440,40 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>

        <div className="absolute inset-0 z-0">
          <Image src="/images/Asset 10.png" alt="" fill className="object-cover" />
        </div>

        <div className="max-w-10xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 pt-[-10%] relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Galeri Kami</h2>
            <p className="text-white/70 text-sm font-semibold mt-2">Momen berharga KB &amp; TK Istiqamah</p>
          </div>

          <div className="relative w-full overflow-hidden max-w-7xl mx-auto px-10">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${galleryPage * (100 / visibleItems)}%)` }}
            >
              {galleryItems.map((item) => (
                <div key={item.id} className="w-full md:w-1/3 lg:w-1/5 p-2 shrink-0">
                  <div className="relative rounded-[20px] overflow-hidden shadow-lg aspect-square group bg-[#07265F]/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-left">
                      <span className="text-[9px] text-white bg-[#07A363] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {item.category}
                      </span>
                      <p className="text-white font-extrabold text-xs sm:text-sm leading-snug mt-1.5 line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {galleryItems.length > visibleItems && (
              <>
                <button
                  onClick={prevGallery}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#07A363] hover:bg-[#07A363]/90 text-white p-2.5 rounded-full transition-all cursor-pointer shadow-md z-20"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextGallery}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#07A363] hover:bg-[#07A363]/90 text-white p-2.5 rounded-full transition-all cursor-pointer shadow-md z-20"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/galeri" className="bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-full transition-all shadow-md z-20">
              Lihat Seluruh Galeri
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section className="bg-transparent py-16 relative -mt-44 sm:-mt-50 lg:-mt-112">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Testimonials */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-2xl sm:text-3xl font-black text-primary-blue">Testimoni Orang Tua</h2>

              {testimonials.length > 0 ? (
                <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden min-h-[160px] flex items-center">
                  <Quote size={36} className="absolute top-5 right-6 text-primary-green/10 z-0" />
                  <div className="flex flex-row gap-5 items-start z-10 w-full text-left">
                    {testimonials[0]?.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testimonials[0].photo}
                        alt={testimonials[0].name}
                        className="w-14 h-14 rounded-full border-4 border-[#07A363] object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full border-4 border-[#07A363] bg-[#07A363]/10 text-[#07A363] flex items-center justify-center font-black text-2xl flex-shrink-0">
                        {testimonials[0]?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
                        &ldquo;{testimonials[0]?.content}&rdquo;
                      </p>
                      <p className="font-extrabold text-[#07265F] text-sm">{testimonials[0]?.name}</p>
                      <p className="text-[11px] text-gray-400 font-semibold">{testimonials[0]?.job}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100">
                  <div className="flex flex-row gap-5 items-start">
                    <div className="relative w-14 h-14 rounded-full border-4 border-[#07A363] overflow-hidden flex-shrink-0">
                      <Image src="/images/parent_agus.png" alt="Pa Agus Botak" fill className="object-cover" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
                      </p>
                      <p className="font-extrabold text-[#07265F] text-sm">Pa Agus Botak</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-start">
                <Link href="/aktivitas" className="flex items-center gap-2 font-extrabold text-sm text-[#07A363] hover:text-[#07A363]/80 transition-colors">
                  Lihat Testimoni Lainnya &amp; Aktivitas Sekolah <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Column: Graphic Decor */}
            <div className="hidden lg:block lg:col-span-5 relative h-[520px]">
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src="/images/Asset 9.png"
                  alt="Student drawing"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA REGISTRATION ─── */}
      <section className="bg-[#07A363] text-white py-14 rounded-[32px] max-w-7xl mx-auto my-8 px-8 sm:px-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <h2 className="text-2xl sm:text-3xl font-black mb-4">Mari Bergabung Bersama Kami!</h2>
        <p className="text-sm font-semibold max-w-2xl mx-auto mb-8 opacity-90 leading-relaxed">
          Kembangkan potensi emas putra-putri Anda melalui program bermain kreatif, pembiasaan akhlak mulia sejak dini, dan kurikulum Islami yang terarah.
        </p>
        <Link href="/ppdb" className="bg-[#07265F] hover:bg-[#07265F]/90 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-10 py-4 rounded-full transition-all shadow-md inline-block hover:scale-105">
          Daftar PPDB Sekarang
        </Link>
      </section>
    </div>
  )
}
