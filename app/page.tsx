'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Star,
  Menu,
  X,
  Quote
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

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            title: JSON.stringify({ buttonText: 'Lihat Program', buttonLink: '#program' })
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


  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="h-screen bg-[#F9F4ED] font-sans antialiased text-[#07265F] overflow-x-hidden">

      {/* ─── NAVBAR ─────────────────────────────── */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-gray-100'
        : 'bg-[#F8F6F2]/60 py-4'
        }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('beranda')}>
              <div className="relative w-11 h-11">
                <Image src="/images/school_logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <div className="relative h-9 w-44">
                <Image src="/images/Asset 12.png" alt="KB & TK ISTIQAMAH" fill className="object-contain object-left" />
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {['Beranda', 'Tentang Kami', 'Program', 'Aktivitas', 'Galeri', 'Kontak'].map((item) => {
                const active = item === 'Beranda'
                return (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                    className={`font-bold text-sm cursor-pointer relative py-1 transition-colors ${active ? 'text-[#07A363]' : 'text-[#07265F] hover:text-[#07A363]'}`}
                  >
                    {item}
                    {active && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#07A363] rounded-full" />}
                  </button>
                )
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/login" className="font-bold text-sm text-[#07265F] hover:text-[#07A363] transition-colors">
                Portal Akun
              </Link>
              <Link href="/ppdb" className="bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs tracking-wider uppercase px-7 py-3.5 rounded-full transition-all shadow-md">
                Daftar Sekarang
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-[#07265F] hover:text-[#07A363] transition-colors cursor-pointer">
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl py-4 px-6 space-y-3">
            {['Beranda', 'Tentang Kami', 'Program', 'Aktivitas', 'Galeri', 'Kontak'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                className="block w-full text-left py-2 font-bold text-[#07265F] hover:text-[#07A363] transition-colors">
                {item}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link href="/login" className="w-full text-center py-2.5 font-bold text-sm text-[#07265F] border border-gray-200 rounded-xl hover:bg-gray-50">Portal Akun</Link>
              <Link href="/ppdb" className="w-full text-center py-3 bg-[#07A363] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl">Daftar Sekarang</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SLIDER ───────────────────────── */}
      <section id="beranda" className="relative w-full h-[65vh] sm:h-[75vh] lg:h-[90vh] min-h-[500px] overflow-hidden bg-primary-blue group">

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

          const isAnchor = btnLink.startsWith('#')
          const btnClass = "px-10 py-4 bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-full transition-all cursor-pointer shadow-xl hover:scale-105 z-20"

          return (
            <div className="absolute inset-0 flex flex-col justify-end items-center pb-16 sm:pb-24 lg:pb-32 z-20">
              {isAnchor ? (
                <button
                  onClick={() => scrollToSection(btnLink.replace('#', ''))}
                  className={btnClass}
                >
                  {btnText}
                </button>
              ) : (
                <Link href={btnLink || '/ppdb'} className={btnClass}>
                  {btnText}
                </Link>
              )}
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

      {/* ─── WHY CHOOSE US (Asset 3 background) ── */}
      {/*
        Asset 3.png is a cream/warm background with a cloud-wave border at bottom.
        We use it as a full-cover section bg so the wave naturally separates from the hero.
      */}
      <section
        id="tentang-kami"
        className="relative bottom-[22%] bg-cover bg-top pt-[20%] py-24 z-20 w-[101vw] right-[10px] bg-transparent"
        style={{ backgroundImage: "url('/images/Asset 3.png')" }}
      >
        {/* Small cloud decorations */}
        <div className="absolute left-[4%] top-[14%] w-16 h-10 pointer-events-none opacity-90">
          <Image src="/images/Asset 13.png" alt="Cloud" fill className="object-contain" />
        </div>
        <div className="absolute right-[4%] top-[20%] w-16 h-10 pointer-events-none opacity-90">
          <Image src="/images/Asset 14.png" alt="Cloud" fill className="object-contain" />
        </div>
        {/* Small stars */}
        <div className="absolute left-[12%] bottom-[22%] text-amber-400"><Star fill="currentColor" size={14} /></div>
        <div className="absolute right-[18%] bottom-[30%] text-amber-400"><Star fill="currentColor" size={12} /></div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-[10rem] lg:px-12 relative z-10">
          <div className="text-center mb-14 relative inline-block w-full">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">Mengapa Memilih Istiqamah</h2>
            <div className="absolute -top-5 right-[22%] text-amber-400"><Star fill="currentColor" size={18} /></div>
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
                <h3 className="font-extrabold text-[#07265F] text-base">
                  {card.title}
                </h3>
                <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROGRAM UNGGULAN ───────────────────── */}
      <section id="program" className="pb-20 bg-[#F9F4ED] relative bottom-[15%]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">Program Unggulan Kami</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {PROGRAMS.map((prog, idx) => (
              <div key={idx} className="bg-white rounded-[28px] shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center p-5 pt-14 relative mt-10 group">
                {/* Circular program image overlapping card top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-4 border-[#07A363] overflow-hidden bg-white shadow-md">
                  <div className="relative w-full h-full">
                    <Image src={prog.image} alt={prog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex flex-col flex-grow space-y-2 mt-2">
                  <h3 className="font-extrabold text-[#07265F] text-sm group-hover:text-[#07A363] transition-colors">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-[#07265F]/75 font-semibold leading-relaxed">
                    {prog.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GALLERY SLIDER ─── */}
      <section id="galeri" className="relative overflow-hidden">
        {/* Top wave */}
        <div className="absolute top-0 left-0 w-full -translate-y-[99%] pointer-events-none">
          <svg viewBox="0 0 1440 80" className="w-full h-10 sm:h-16 fill-[#07A363]" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1440,40 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>

        {/* Asset 10: full background */}
        <div className="absolute inset-0 z-0">
          <Image src="/images/Asset 10.png" alt="" fill className="object-cover" />
        </div>

        <div className="max-w-10xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 pt-[10%] relative z-10 lg:h-[140vh]">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Galeri Kami</h2>
            <p className="text-white/70 text-sm font-semibold mt-2">Momen berharga KB &amp; TK Istiqamah</p>
          </div>

          {/* Main Slider showing 5 images horizontally */}
          <div className="relative w-full overflow-hidden max-w-7xl mx-auto px-10">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${galleryPage * (100 / visibleItems)}%)` }}
            >
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="w-full md:w-1/3 lg:w-1/5 p-2 shrink-0"
                >
                  <div className="relative rounded-[20px] overflow-hidden shadow-lg aspect-square group bg-[#07265F]/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                    {/* Category + Title */}
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

            {/* Nav arrows */}
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

          {/* Dot indicators */}
          {galleryItems.length > visibleItems && (
            <div className="flex justify-center items-center gap-2 mt-6 z-20 relative">
              {Array.from({ length: Math.max(0, galleryItems.length - visibleItems + 1) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryPage([i, i > galleryPage ? 1 : -1])}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${galleryPage === i ? 'w-7 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/60'
                    }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/*
        ─── TESTIMONIAL + CONTACT ────────────────────────────────────────
        Two-column layout:
          Left  (lg:col-span-7): Testimonial card + green Contact card (cream bg)
          Right (lg:col-span-5): Asset 10 blob (fills full height) + Asset 9 boy on top
        The right column is a self-contained relative container — no cross-section hacks.
      */}
      <section id="aktivitas" className="bg-transparent pt-[2rem] pb-0 relative lg:bottom-120 h-[60%]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-25 items-stretch">

            {/* ── LEFT COLUMN: Testimonial + Contact ── */}
            <div className="lg:col-span-6 flex flex-col gap-8 py-4">

              {/* Testimonial heading + slider */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#07265F] mb-8">
                  Testimoni Orang Tua
                </h2>

                {testimonials.length > 0 ? (
                  <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden min-h-[160px] flex items-center">
                    <Quote size={36} className="absolute top-5 right-6 text-[#07A363]/10 z-0" />
                    <div className="flex flex-row gap-5 items-start z-10 w-full text-left">
                      {/* Avatar */}
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
                  /* Static fallback */
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
              </div>

              {/* Green Contact card */}
              <div id="kontak">
                <div className="bg-[#07A363] text-white rounded-[24px] p-7 sm:p-9 shadow-lg">
                  <h3 className="text-lg font-black mb-6">Hubungi Kami</h3>
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-semibold leading-snug">Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-semibold">022 - 4241799 / 0811 2198 853</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-semibold">info@tkistiqamah.sch.id</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                      <p className="text-sm font-semibold">@kbtkistiqamah</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <p className="text-sm font-semibold">TK Istiqamah Bandung</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Asset 10 blob as background + Asset 9 boy on top ── */}
            <div className="hidden lg:block lg:col-span-5 relative left-[40%]" style={{ minHeight: '560px' }}>
              {/* Asset 9: standing boy anchored bottom-right, on top of blob */}
              <div className="absolute bottom-0 right-0 w-[360px] h-[620px] z-10">
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

      {/* ─── FOOTER ─────────────────────────────── */}
      <footer className="bg-[#07265F] text-white py-10 mt-[25%] lg:mt-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <p className="text-xs font-bold text-white/70 tracking-wide">
            &copy; 2026 KB &amp; TK Istiqamah. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

    </div>
  )
}
