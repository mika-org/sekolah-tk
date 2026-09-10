'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createClient } from '@/lib/database/client'
import GsapHeroBanner from '@/components/GsapHeroBanner'
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Star,
  Quote,
  ArrowRight,
  Clock
} from 'lucide-react'

const FEATURED_PROGRAMS = [
  {
    title: "Al-Qur'an Metode Tilawati",
    desc: "Mengenalkan dan menumbuhkan kecintaan anak terhadap Al-Qur'an melalui pembelajaran yang menyenangkan dan sesuai tahap perkembangan.",
    image: '/images/fasilitas/7.webp',
    layout: 'text-top' as const
  },
  {
    title: "Qur'an Camp",
    desc: "Pengalaman belajar Islami yang memadukan kegiatan Al-Qur'an, ibadah, kemandirian, kebersamaan, dan aktivitas menyenangkan.",
    image: '/images/fasilitas/11.webp',
    layout: 'image-top' as const
  },
  {
    title: "Outbound",
    desc: "Aktivitas luar ruangan yang melatih keberanian, kemandirian, kerja sama, serta kemampuan motorik anak melalui berbagai tantangan yang menyenangkan.",
    image: '/images/fasilitas/5.webp',
    layout: 'text-top' as const
  },
  {
    title: "Calistung & Literasi Ceria",
    desc: "Pondasi literasi membaca, menulis, dan berhitung melalui pendekatan bermain interaktif tanpa membebani anak.",
    image: '/images/fasilitas/1.webp',
    layout: 'image-top' as const
  },
  {
    title: "Seni & Kreativitas Anak",
    desc: "Mengeksplorasi bakat seni, melukis, kriya, dan pertunjukan islami untuk mengasah imajinasi serta rasa percaya diri.",
    image: '/images/fasilitas/12.webp',
    layout: 'text-top' as const
  },
  {
    title: "Eksplorasi Sains & Lingkungan",
    desc: "Mengenal keagungan ciptaan Allah melalui eksperimen sains sederhana, berkebun, dan pembiasaan peduli lingkungan.",
    image: '/images/fasilitas/3.webp',
    layout: 'image-top' as const
  }
]

const FALLBACK_GALLERY = [
  { id: 'f1', title: 'Kegiatan Belajar', image: '/images/gallery_1.png', category: 'Kegiatan' },
  { id: 'f2', title: 'Sarana Sekolah', image: '/images/gallery_2.png', category: 'Sarana' },
  { id: 'f3', title: 'Prestasi Murid', image: '/images/gallery_3.png', category: 'Prestasi' },
  { id: 'f4', title: 'Aktivitas Sekolah', image: '/images/gallery_4.png', category: 'Kegiatan' },
]

const DEVELOPMENT_PILLARS = [
  {
    id: 'kreativitas',
    title: 'Kreativitas & Eksplorasi',
    shortTitle: 'Kreativitas',
    desc: 'Memberikan kesempatan anak untuk bereksperimen, berkarya, berimajinasi, dan menemukan berbagai cara dalam menyelesaikan tantangan.',
    image: '/images/perkembangan_anak/2.png',
  },
  {
    id: 'sosial',
    title: 'Sosial & Emosional',
    shortTitle: 'Sosial',
    desc: 'Membangun rasa empati, kemampuan bersosialisasi, kerja sama, dan kecerdasan emosional dalam kebersamaan yang hangat.',
    image: '/images/perkembangan_anak/1.png',
  },
  {
    id: 'motorik',
    title: 'Fisik & Motorik',
    shortTitle: 'Fisik & Motorik',
    desc: 'Mengoptimalkan pertumbuhan motorik kasar dan halus anak melalui aktivitas gerak fisik, olahraga terarah, dan permainan aktif.',
    image: '/images/perkembangan_anak/3.png',
  },
  {
    id: 'kemandirian',
    title: 'Kemandirian & Kebiasaan',
    shortTitle: 'Kemandirian',
    desc: 'Melatih kemandirian sejak dini, menjaga kebersihan diri, kerapian, serta tanggung jawab dalam setiap rutinitas sehari-hari.',
    image: '/images/perkembangan_anak/4.png',
  },
  {
    id: 'ibadah',
    title: 'Ibadah & Nilai Agama',
    shortTitle: 'Ibadah & Nilai Agama',
    desc: 'Membimbing pembiasaan sholat, hafalan doa harian, adab Islami, dan akhlak mulia dalam keseharian anak.',
    image: '/images/perkembangan_anak/5.png',
  },
]

const LEARNING_APPROACHES = [
  {
    id: 'islamic-learning',
    title: 'Islamic Learning',
    desc: 'Menanamkan nilai-nilai Islam dan kecintaan kepada Allah SWT melalui pembelajaran Al-Qur\'an, ibadah, doa harian, dan pembiasaan sejak dini.',
    iconType: 'quran'
  },
  {
    id: 'character-building',
    title: 'Moslem Character Building',
    desc: 'Membangun karakter Islami melalui pembiasaan adab mulia, akhlakul karimah, pilar SMART dan kepedulian terhadap sesama.',
    iconType: 'character'
  },
  {
    id: 'life-skill',
    title: 'Life Skill & Kemandirian',
    desc: 'Melatih kemandirian, tanggung jawab, kerapian, dan keterampilan hidup praktis melalui aktivitas nyata sesuai usia anak.',
    iconType: 'lifeskill'
  },
  {
    id: 'bilingual-literacy',
    title: 'Bilingual & Smart Literacy',
    desc: 'Mengenalkan dasar literasi, bahasa Arab dan Inggris sederhana melalui dongeng islami, bernyanyi ceria, dan komunikasi interaktif.',
    iconType: 'literacy'
  },
  {
    id: 'creative-science',
    title: 'Creative & Science Exploration',
    desc: 'Membuka wawasan rasa ingin tahu dan daya cipta anak melalui percobaan sains seru, melukis kreatif, dan bermain terarah.',
    iconType: 'science'
  },
  {
    id: 'motoric-development',
    title: 'Physical & Motoric Fun',
    desc: 'Mengoptimalkan pertumbuhan motorik kasar dan halus melalui senam ceria, permainan fisik ketangkasan, dan olahraga ramah anak.',
    iconType: 'motoric'
  },
]

const FACILITIES = [
  {
    title: 'Ruang Belajar Tematik',
    desc: 'Ruang kelas ber-AC yang ceria, nyaman, dan mendukung aktivitas belajar aktif serta menyenangkan.',
    image: '/images/fasilitas/1.webp',
  },
  {
    title: 'Ruang Bermain Indoor',
    desc: 'Area bermain indoor dengan mandi bola, perosotan, dan aneka rintangan aman untuk motorik anak.',
    image: '/images/fasilitas/6.webp',
  },
  {
    title: 'Perpustakaan & Reading Corner',
    desc: 'Ruang literasi yang nyaman untuk menumbuhkan kecintaan anak terhadap buku dan kegiatan membaca.',
    image: '/images/fasilitas/7.webp',
  },
  {
    title: 'Ruang Multimedia & Aktivitas',
    desc: 'Fasilitas pembelajaran interaktif dengan smart screen digital untuk memperkaya wawasan anak.',
    image: '/images/fasilitas/8.webp',
  },
  {
    title: 'Taman Bermain Outdoor',
    desc: 'Area bermain terbuka yang luas dan asri untuk melatih motorik kasar, ketangkasan, dan keberanian.',
    image: '/images/fasilitas/5.webp',
  },
  {
    title: 'Playground Rumput Sintetis',
    desc: 'Area bermain mini outdoor berlapis rumput sintetis higienis yang aman untuk anak beraktivitas.',
    image: '/images/fasilitas/3.webp',
  },
]

const GALLERY_SHOWCASE = [
  { id: 'g3', src: '/images/gallery/3.jpg', alt: 'Prestasi Juara Lomba & Siswa Berprestasi', category: 'program' },
  { id: 'g1', src: '/images/gallery/1.jpg', alt: 'Aktivitas Belajar Berhitung di Kelas', category: 'kegiatan' },
  { id: 'g2', src: '/images/gallery/2.jpg', alt: 'Pentas Tari Tradisional Anak Istiqamah', category: 'program' },
  { id: 'g4', src: '/images/gallery/4.jpg', alt: 'Pentas Seni Budaya & Teater Cilik', category: 'program' },
  { id: 'g5', src: '/images/gallery/5.jpg', alt: 'Cooking Day & Kreasi Masak Ceria', category: 'kegiatan' },
  { id: 'g6', src: '/images/gallery/6.jpg', alt: 'Bermain Ayunan & Keseimbangan Outdoor', category: 'kegiatan' },
  { id: 'g7', src: '/images/gallery/7.jpg', alt: 'Ketangkasan Outbound Jaring Tali', category: 'kegiatan' },
  { id: 'g8', src: '/images/gallery/8.jpg', alt: 'Lomba Adzan & Iqomah Pentas PAI', category: 'program' },
  { id: 'g9', src: '/images/gallery/9.jpg', alt: 'Petualangan Air Naik Rakit Edukasi', category: 'kegiatan' },
  { id: 'g10', src: '/images/gallery/10.jpg', alt: 'Mengenal & Menyayangi Satwa Kelinci', category: 'kegiatan' },
]

const TESTIMONIALS_DATA = [
  {
    name: 'Bunda Mila',
    role: 'Orang Tua Murid',
    content: 'Alhamdulillah anak kami sangat senang bersekolah di KB TK Istiqamah. Guru-gurunya penuh perhatian, sabar, dan menanamkan nilai-nilai Islami dengan cara yang menyenangkan.',
    avatar: '/images/parent_bunda_mila.png',
  },
  {
    name: 'Ayah Rizki',
    role: 'Orang Tua Murid',
    content: 'Perkembangan kemandirian dan adab anak kami sangat terasa setelah bergabung di sini. Program Tilawati dan pembiasaan sholatnya luar biasa.',
    avatar: '/images/parent_ayah_rizki.png',
  },
  {
    name: 'Papah Adit',
    role: 'Orang Tua Murid',
    content: 'Fasilitas lengkap, lingkungan belajar aman dan asri. Anak menjadi lebih aktif bereksplorasi dan percaya diri setiap hari.',
    avatar: '/images/parent_papah_adit.png',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Berapa usia anak yang dapat mendaftar',
    a: 'Kelompok Bermain (KB) melayani usia 2 - 4 tahun, sedangkan Taman Kanak-kanak (TK) melayani usia 4 - 6 tahun per bulan Juli pada tahun ajaran baru.',
  },
  {
    q: 'Bagaimana proses pendaftarannya',
    a: 'Pendaftaran dapat dilakukan secara online melalui website ini pada menu PPDB, atau datang langsung ke ruang administrasi KB TK Istiqamah Bandung untuk pengisian formulir dan observasi ramah anak.',
  },
  {
    q: 'Apa saja syarat pendaftarannya',
    a: 'Syarat administrasi meliputi: formulir pendaftaran yang telah diisi, fotokopi Akta Kelahiran anak, fotokopi Kartu Keluarga (KK), fotokopi KTP kedua orang tua, serta pas foto calon peserta didik.',
  },
  {
    q: 'Berapa biaya pendidikan di TK Istiqamah',
    a: 'Rincian biaya pendaftaran, dana pengembangan, uang seragam, dan SPP bulanan dapat dilihat pada brosur resmi PPDB atau langsung menghubungi layanan informasi WhatsApp kami.',
  },
  {
    q: 'Kapan tahun ajaran dimulai',
    a: 'Tahun ajaran baru dimulai pada pertengahan bulan Juli setiap tahunnya, diawali dengan Masa Pengenalan Lingkungan Sekolah (MPLS) yang ramah anak dan menyenangkan.',
  },
]

export default function HomePage() {
  const [activePillar, setActivePillar] = useState(0)
  const [galleryCategory, setGalleryCategory] = useState<'all' | 'kegiatan' | 'program'>('all')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Pendekatan Pembelajaran horizontal carousel state & ref
  const [activePendekatanIndex, setActivePendekatanIndex] = useState(0)
  const pendekatanScrollRef = useRef<HTMLDivElement>(null)

  const scrollToPendekatan = useCallback((index: number) => {
    if (!pendekatanScrollRef.current) return
    const container = pendekatanScrollRef.current
    const cards = container.querySelectorAll<HTMLElement>('.pendekatan-card')
    if (cards[index]) {
      const card = cards[index]
      const cardRect = card.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const currentScrollLeft = container.scrollLeft
      const targetScroll = currentScrollLeft + (cardRect.left - containerRect.left) - (containerRect.width - cardRect.width) / 2
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      })
    }
    setActivePendekatanIndex(index)
  }, [])

  const handlePendekatanScroll = useCallback(() => {
    if (!pendekatanScrollRef.current) return
    const container = pendekatanScrollRef.current
    const cards = container.querySelectorAll<HTMLElement>('.pendekatan-card')
    if (cards.length === 0) return

    const containerRect = container.getBoundingClientRect()
    const containerCenter = containerRect.left + containerRect.width / 2

    let closestIdx = 0
    let minDiff = Infinity

    cards.forEach((card, idx) => {
      const cardRect = card.getBoundingClientRect()
      const cardCenter = cardRect.left + cardRect.width / 2
      const diff = Math.abs(cardCenter - containerCenter)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = idx
      }
    })

    setActivePendekatanIndex(closestIdx)
  }, [])

  const scrollPendekatanDir = useCallback((direction: 'left' | 'right') => {
    const nextIdx = direction === 'left'
      ? Math.max(0, activePendekatanIndex - 1)
      : Math.min(LEARNING_APPROACHES.length - 1, activePendekatanIndex + 1)
    scrollToPendekatan(nextIdx)
  }, [activePendekatanIndex, scrollToPendekatan])

  // Program Unggulan horizontal carousel state & ref
  const [activeProgramIndex, setActiveProgramIndex] = useState(0)
  const programScrollRef = useRef<HTMLDivElement>(null)

  const scrollToProgram = useCallback((index: number) => {
    if (!programScrollRef.current) return
    const container = programScrollRef.current
    const cards = container.querySelectorAll<HTMLElement>('.program-card')
    if (cards[index]) {
      const card = cards[index]
      const cardRect = card.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const currentScrollLeft = container.scrollLeft
      const targetScroll = currentScrollLeft + (cardRect.left - containerRect.left) - (containerRect.width - cardRect.width) / 2
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      })
    }
    setActiveProgramIndex(index)
  }, [])

  const handleProgramScroll = useCallback(() => {
    if (!programScrollRef.current) return
    const container = programScrollRef.current
    const cards = container.querySelectorAll<HTMLElement>('.program-card')
    if (cards.length === 0) return

    const containerRect = container.getBoundingClientRect()
    const containerCenter = containerRect.left + containerRect.width / 2

    let closestIdx = 0
    let minDiff = Infinity

    cards.forEach((card, idx) => {
      const cardRect = card.getBoundingClientRect()
      const cardCenter = cardRect.left + cardRect.width / 2
      const diff = Math.abs(cardCenter - containerCenter)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = idx
      }
    })

    setActiveProgramIndex(closestIdx)
  }, [])

  // Register GSAP ScrollTrigger for standard smooth entrance animations on all sections
  useEffect(() => {
    if (typeof window === 'undefined') return
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const sections = document.querySelectorAll('.gsap-reveal')
      sections.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    })

    return () => ctx.revert()
  }, [])

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
            "image": "https://tkistiqamah.sch.id/images/hero_bg_2x.png",
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

      {/* ─── HERO SECTION (GSAP ANIMATED WITH LAYERS) ─── */}
      <GsapHeroBanner />

      {/* ─── SECTION 1: TEMPAT TUMBUHNYA GENERASI SMART ─── */}
      <section className="gsap-reveal relative w-full bg-[#0A7043] pt-6 sm:pt-10 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden z-20">
        {/* Floating Decorative Stars matching reference */}
        <div className="absolute left-6 sm:left-12 top-6 text-white/80 pointer-events-none animate-pulse">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>
        <div className="absolute right-8 sm:right-16 top-6 text-[#F5B744] pointer-events-none drop-shadow-sm">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-9 sm:h-9">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>
        <div className="absolute right-6 sm:right-14 top-28 text-white/70 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
          </svg>
        </div>

        {/* White Card: SMART Generation */}
        <div className="max-w-6xl xl:max-w-7xl mx-auto bg-white rounded-[26px] sm:rounded-[34px] p-5 sm:p-8 lg:p-10 shadow-[0_16px_50px_rgba(0,0,0,0.12)] border border-white relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column: Heading & Description */}
            <div className="lg:col-span-6 flex flex-col justify-center text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-[1.18]">
                <span className="block text-[#1B3B6F]">Tempat Tumbuhnya</span>
                <span className="block text-[#07A363] font-black mt-1">Generasi SMART</span>
              </h2>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm lg:text-[14px] text-[#2C4A6F]/90 font-medium leading-[1.75]">
                Setiap anak tumbuh dengan cara dan waktunya sendiri. Guru hadir untuk mendampingi, memberi teladan, menstimulasi, dan membuka ruang bagi anak untuk bereksplorasi sehingga tumbuh menjadi pribadi yang Santun, Mandiri, Aktif, Religius dan Terampil ( SMART)
              </p>
            </div>

            {/* Right Column: School Building Photo */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[16/10] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border-2 border-emerald-50">
                <Image
                  src="/images/1.jpg"
                  alt="Tempat Tumbuhnya Generasi SMART - KB & TK Istiqamah Bandung"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative lush foliage curves */}
        <div className="w-full flex justify-center -mb-8 sm:-mb-12 mt-6 sm:mt-8 pointer-events-none opacity-90">
          <div className="relative w-full max-w-7xl h-10 sm:h-14">
            <svg viewBox="0 0 1200 80" fill="none" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0,80 C150,20 300,50 450,20 C600,-10 750,50 900,15 C1050,45 1150,25 1200,80 Z" fill="#075E38" opacity="0.6"/>
              <path d="M0,80 C200,30 400,60 600,20 C800,50 1000,10 1200,80 Z" fill="#054A2C" opacity="0.8"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: PENDEKATAN PEMBELAJARAN (SCROLLABLE MULTI-CARD CAROUSEL) ─── */}
      <section className="gsap-reveal relative w-full bg-[#054A2C] pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 z-20">
        <div className="max-w-6xl xl:max-w-7xl mx-auto bg-[#102A4E] rounded-[26px] sm:rounded-[34px] p-5 sm:p-8 lg:p-10 shadow-2xl border border-white/10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold mb-3 uppercase tracking-wider">
              <span>Kurikulum &amp; Metode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight">
              Pendekatan Pembelajaran
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-blue-100/80 font-medium leading-relaxed">
              Pembelajaran yang dirancang untuk menumbuhkan iman, karakter, kemandirian, kreativitas dan keterampilan anak secara utuh
            </p>
          </div>

          {/* Carousel Track with Left/Right Buttons and Native Smooth Scroll */}
          <div className="relative">
            {/* Prev Button (Desktop & Tablet) */}
            <button
              type="button"
              onClick={() => scrollPendekatanDir('left')}
              disabled={activePendekatanIndex === 0}
              aria-label="Pendekatan Sebelumnya"
              className="hidden sm:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 items-center justify-center rounded-full bg-white text-[#102A4E] shadow-xl hover:bg-amber-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button (Desktop & Tablet) */}
            <button
              type="button"
              onClick={() => scrollPendekatanDir('right')}
              disabled={activePendekatanIndex === LEARNING_APPROACHES.length - 1}
              aria-label="Pendekatan Berikutnya"
              className="hidden sm:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-11 lg:h-11 items-center justify-center rounded-full bg-white text-[#102A4E] shadow-xl hover:bg-amber-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-slate-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Track */}
            <div
              ref={pendekatanScrollRef}
              onScroll={handlePendekatanScroll}
              className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-2 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {LEARNING_APPROACHES.map((item, idx) => (
                <div
                  key={item.id}
                  className="pendekatan-card w-[270px] sm:w-[300px] md:w-[330px] flex-shrink-0 snap-center bg-white rounded-[22px] p-5 sm:p-6 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-white/50 group cursor-default"
                >
                  {/* Icon Circle */}
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#DCE8FA] flex items-center justify-center text-[#1B3B6F] mb-3.5 shadow-inner group-hover:scale-110 transition-transform">
                    {item.iconType === 'quran' && (
                      <svg viewBox="0 0 40 40" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-[#1B3B6F]">
                        <rect x="8" y="8" width="24" height="24" rx="4" fill="#1B3B6F"/>
                        <rect x="11" y="27" width="18" height="3" rx="1.5" fill="#DCE8FA"/>
                        <path d="M21.5 14C19.5 14 18 15.5 18 17.5C18 19.5 19.5 21 21.5 21C22.2 21 22.8 20.8 23.3 20.5C22.5 21.2 21.5 21.7 20.3 21.7C17.9 21.7 16 19.8 16 17.4C16 15 17.9 13.1 20.3 13.1C20.7 13.1 21.1 13.2 21.5 13.3V14Z" fill="#FFFFFF"/>
                        <polygon points="22.5,16.5 23.2,17.7 24.5,17.8 23.5,18.7 23.8,20 22.5,19.3 21.2,20 21.5,18.7 20.5,17.8 21.8,17.7" fill="#FFFFFF"/>
                      </svg>
                    )}
                    {item.iconType === 'character' && (
                      <svg viewBox="0 0 40 40" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8 text-[#1B3B6F]">
                        <path d="M20 9C15.5 9 13 12.5 13 17C13 22 14.5 27 15.5 30H24.5C25.5 27 27 22 27 17C27 12.5 24.5 9 20 9Z" fill="#1B3B6F"/>
                        <ellipse cx="20" cy="18" rx="4.5" ry="5.5" fill="#DCE8FA"/>
                        <path d="M20 15L21 17.5H23.5L21.5 19L22.2 21.5L20 20L17.8 21.5L18.5 19L16.5 17.5H19L20 15Z" fill="#1B3B6F"/>
                      </svg>
                    )}
                    {item.iconType === 'lifeskill' && (
                      <svg viewBox="0 0 40 40" fill="none" stroke="#1B3B6F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
                        <path d="M19 14.5C17.5 12.5 14.5 12.5 13 14C11.5 15.5 11.5 18.5 13.5 20.5L19 26L24.5 20.5C26.5 18.5 26.5 15.5 25 14C23.5 12.5 20.5 12.5 19 14.5Z" />
                        <ellipse cx="23" cy="20" rx="5.5" ry="7" transform="rotate(30 23 20)" stroke="#1B3B6F" strokeWidth="2" fill="none"/>
                      </svg>
                    )}
                    {item.iconType === 'literacy' && (
                      <svg viewBox="0 0 40 40" fill="none" stroke="#1B3B6F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
                        <path d="M10 12C10 12 14 10 20 12C26 10 30 12 30 12V28C30 28 26 26 20 28C14 26 10 28 10 28V12Z" fill="#DCE8FA" />
                        <path d="M20 12V28" />
                        <path d="M14 17H17M14 21H18" stroke="#1B3B6F" strokeWidth="2" />
                        <circle cx="25" cy="18" r="1.5" fill="#1B3B6F" />
                        <path d="M23 23L27 19" stroke="#1B3B6F" strokeWidth="1.8" />
                      </svg>
                    )}
                    {item.iconType === 'science' && (
                      <svg viewBox="0 0 40 40" fill="none" stroke="#1B3B6F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
                        <path d="M17 10H23M18 10V16L12 28C11 30 12.5 32 15 32H25C27.5 32 29 30 28 28L22 16V10" />
                        <path d="M14 24H26" strokeDasharray="1.5 2" />
                        <circle cx="18" cy="27" r="1" fill="#1B3B6F" />
                        <circle cx="22" cy="25" r="1.5" fill="#1B3B6F" />
                        <path d="M25 8L27 11L29 9" stroke="#F5B744" strokeWidth="2" />
                      </svg>
                    )}
                    {item.iconType === 'motoric' && (
                      <svg viewBox="0 0 40 40" fill="none" stroke="#1B3B6F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 sm:w-8 sm:h-8">
                        <circle cx="20" cy="12" r="3.5" fill="#DCE8FA" />
                        <path d="M15 20L20 17L25 19L28 24" />
                        <path d="M20 17V24L16 31" />
                        <path d="M20 24L24 31" />
                        <circle cx="29" cy="15" r="2" fill="#F5B744" stroke="none" />
                      </svg>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-[#1B3B6F] text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs sm:text-[13px] text-[#4A607A] font-medium leading-[1.65]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Clickable Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
              {LEARNING_APPROACHES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToPendekatan(idx)}
                  aria-label={`Lihat pendekatan ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    activePendekatanIndex === idx
                      ? 'w-7 h-2.5 bg-[#F5B744] shadow-[0_2px_8px_rgba(245,183,68,0.5)]'
                      : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: PENGEMBANGAN ANAK (COMPACT & SPACE-EFFICIENT) ─── */}
      <section id="pengembangan-anak" className="gsap-reveal relative w-full bg-[#054A2C] pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 z-20">
        <div className="max-w-6xl xl:max-w-7xl mx-auto bg-[#0B7347] rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 shadow-2xl border border-white/10">
          {/* Section Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-[30px] font-black text-white tracking-tight">
              Pengembangan Anak
            </h2>
          </div>

          {/* Compact Space-Efficient Layout matching reference */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-7 lg:gap-8 max-w-4xl mx-auto">
            {/* Left: Active Enlarged Pillar Card */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-[24px] sm:rounded-[30px] bg-white p-3 sm:p-4 shadow-xl flex items-center justify-center flex-shrink-0 border-2 border-white/80 group">
              <div className="relative w-full h-full">
                <Image
                  src={DEVELOPMENT_PILLARS[activePillar].image}
                  alt={DEVELOPMENT_PILLARS[activePillar].title}
                  fill
                  className="object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Right: Active Text & Other Pillar Buttons Row */}
            <div className="flex-1 flex flex-col justify-center text-center md:text-left min-w-0">
              {/* Text Description */}
              <div className="min-h-[70px] sm:min-h-[80px] flex flex-col justify-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight">
                  {DEVELOPMENT_PILLARS[activePillar].title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-[13px] lg:text-sm text-emerald-100/95 font-medium leading-relaxed max-w-xl">
                  {DEVELOPMENT_PILLARS[activePillar].desc}
                </p>
              </div>

              {/* Small Pillar Icon Cards Row */}
              <div className="flex items-center justify-center md:justify-start gap-2.5 sm:gap-3.5 mt-3 sm:mt-4">
                {DEVELOPMENT_PILLARS.map((pillar, idx) => {
                  const isActive = activePillar === idx
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => setActivePillar(idx)}
                      aria-label={`Pilar: ${pillar.title}`}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 cursor-pointer transition-all duration-300 shadow-md ${
                        isActive
                          ? 'bg-white ring-3 ring-amber-300 scale-105 opacity-100 shadow-lg'
                          : 'bg-white/90 hover:bg-white hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={pillar.image}
                          alt={pillar.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 48px, 64px"
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WAVE TRANSITION FROM PENGEMBANGAN ANAK TO WHITE SECTIONS ─── */}
      <div className="w-full overflow-hidden leading-none bg-[#054A2C] -mt-1">
        <svg viewBox="0 0 1200 45" fill="none" className="w-full h-7 sm:h-10" preserveAspectRatio="none">
          <path d="M0,0 C300,40 600,0 900,35 C1050,48 1150,22 1200,40 L1200,45 L0,45 Z" fill="#FDFBF7" />
        </svg>
      </div>

      <div className="bg-[#FDFBF7] pt-4 sm:pt-6 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* ─── SECTION 4: PROGRAM UNGGULAN (HORIZONTAL SCROLL + CLICKABLE DOTS) ─── */}
        <section id="program-unggulan" className="gsap-reveal max-w-6xl xl:max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#1B3B6F] tracking-tight">
              Program Unggulan
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#4A607A] font-medium leading-relaxed">
              Beragam pengalaman belajar bermakna untuk menumbuhkan iman, karakter, kemandirian, kreativitas, dan potensi terbaik setiap anak
            </p>
          </div>

          {/* Scrollable Container with Smooth Native Right-Scroll */}
          <div className="relative">
            <div
              ref={programScrollRef}
              onScroll={handleProgramScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-4 sm:gap-6 pb-3 pt-1 px-2"
            >
              {FEATURED_PROGRAMS.map((prog, idx) => (
                <div
                  key={idx}
                  className="program-card w-[270px] sm:w-[310px] md:w-[340px] lg:w-[360px] flex-shrink-0 snap-start flex flex-col justify-between group bg-white/50 hover:bg-white rounded-2xl p-2 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-lg border border-transparent hover:border-gray-100"
                >
                  {prog.layout === 'text-top' ? (
                    <>
                      <div className="text-left mb-2.5 px-1 min-h-[72px]">
                        <h3 className="font-extrabold text-[#1B3B6F] text-sm sm:text-base group-hover:text-[#07A363] transition-colors">
                          {prog.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#4A607A] font-medium leading-[1.65]">
                          {prog.desc}
                        </p>
                      </div>
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                        <Image
                          src={prog.image}
                          alt={prog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 mb-2.5">
                        <Image
                          src={prog.image}
                          alt={prog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-left px-1 min-h-[72px]">
                        <h3 className="font-extrabold text-[#1B3B6F] text-sm sm:text-base group-hover:text-[#07A363] transition-colors">
                          {prog.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#4A607A] font-medium leading-[1.65]">
                          {prog.desc}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Indicator Dots & Next/Prev Controls */}
          <div className="flex items-center justify-center gap-3 mt-6 sm:mt-7">
            <button
              type="button"
              onClick={() => scrollToProgram((activeProgramIndex - 1 + FEATURED_PROGRAMS.length) % FEATURED_PROGRAMS.length)}
              aria-label="Program Sebelumnya"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-[#1B3B6F] hover:bg-[#1B3B6F] hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Clickable Indicator Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {FEATURED_PROGRAMS.map((_, idx) => {
                const isActive = activeProgramIndex === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        scrollToProgram((idx + 1) % FEATURED_PROGRAMS.length)
                      } else {
                        scrollToProgram(idx)
                      }
                    }}
                    aria-label={`Program ${idx + 1}${isActive ? ' (Klik untuk ke program selanjutnya)' : ''}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? 'w-6 sm:w-7 h-2 bg-[#1B3B6F] shadow-sm'
                        : 'w-2 h-2 bg-[#1B3B6F]/30 hover:bg-[#1B3B6F]/70'
                    }`}
                  />
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollToProgram((activeProgramIndex + 1) % FEATURED_PROGRAMS.length)}
              aria-label="Program Selanjutnya"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-[#1B3B6F] hover:bg-[#1B3B6F] hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ─── SECTION 5: FASILITAS KB TK ISTIQAMAH ─── */}
        <section className="gsap-reveal max-w-6xl xl:max-w-7xl mx-auto mt-8 sm:mt-10">
          <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-5">
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#1B3B6F] tracking-tight">
              Fasilitas KB TK Istiqamah
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#4A607A] font-medium">
              Ruang Nyaman untuk Tumbuh dan Bereksplorasi
            </p>
          </div>

          {/* Green Facility Container */}
          <div className="bg-[#0B7347] rounded-[26px] sm:rounded-[34px] p-4 sm:p-6 lg:p-7 shadow-xl border border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {FACILITIES.map((facility, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[20px] overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <Image
                      src={facility.image}
                      alt={facility.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between text-center">
                    <h3 className="font-extrabold text-[#1B3B6F] text-xs sm:text-[13px] leading-tight">
                      {facility.title}
                    </h3>
                    <p className="text-[#4A607A] text-[10px] sm:text-[11px] leading-snug mt-1 font-medium line-clamp-3">
                      {facility.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-emerald-100/90 text-xs sm:text-sm text-center font-medium mt-4 sm:mt-6 max-w-2xl mx-auto leading-relaxed">
              Lingkungan belajar yang aman, nyaman dan menyenangkan untuk mendukung anak belajar, bermain, bergerak serta mengeksplorasi berbagai pengalaman baru!
            </p>
          </div>
        </section>

        {/* ─── SECTION 6: CERITA DARI ORANG TUA ─── */}
        <section className="gsap-reveal max-w-6xl xl:max-w-7xl mx-auto mt-8 sm:mt-10">
          <div className="bg-[#102A4E] rounded-[26px] sm:rounded-[34px] p-5 sm:p-8 shadow-2xl border border-white/10">
            <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight">
                Cerita dari Orang Tua
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-blue-100/80 font-medium">
                Kepercayaan yang Tumbuh Bersama
              </p>
            </div>

            {/* 3 Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {TESTIMONIALS_DATA.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-4 sm:p-4.5 flex items-start gap-3.5 shadow-md border border-white/80 hover:shadow-lg transition-all"
                >
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-100 bg-[#DCE8FA]">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[#1B3B6F] text-xs sm:text-sm truncate">
                      {t.name}
                    </h3>
                    <p className="text-[#4A607A] text-[11px] sm:text-xs leading-relaxed mt-1 font-medium line-clamp-3">
                      {t.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-blue-100/75 text-xs sm:text-[13px] text-center font-medium mt-5 sm:mt-6 max-w-2xl mx-auto leading-relaxed">
              Cerita dan pengalaman orang tua menjadi bagian berharga dalam perjalanan kami mendampingi tumbuh kembang setiap anak.
            </p>
          </div>
        </section>

        {/* ─── SECTION 7: JEJAK KECIL, CERITA BERMAKNA (GALERI) ─── */}
        <section className="gsap-reveal max-w-6xl xl:max-w-7xl mx-auto mt-8 sm:mt-10">
          <div className="bg-[#0B7347] rounded-[26px] sm:rounded-[34px] p-5 sm:p-8 shadow-2xl border border-white/10">
            <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight">
                Jejak Kecil, Cerita Bermakna
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/85 font-medium leading-relaxed">
                Lihat bagaimana anak-anak belajar, bermain, bereksplorasi dan menciptakan pengalaman bermakna di KB TK Istiqamah
              </p>

              {/* Category Filter Pills */}
              <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 mt-4">
                <button
                  onClick={() => setGalleryCategory('all')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    galleryCategory === 'all'
                      ? 'bg-[#054A2C] text-white shadow-inner'
                      : 'bg-white text-[#0B7347] hover:bg-emerald-50'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setGalleryCategory('kegiatan')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    galleryCategory === 'kegiatan'
                      ? 'bg-[#054A2C] text-white shadow-inner'
                      : 'bg-white text-[#0B7347] hover:bg-emerald-50'
                  }`}
                >
                  Kegiatan Pembelajaran
                </button>
                <button
                  onClick={() => setGalleryCategory('program')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    galleryCategory === 'program'
                      ? 'bg-[#054A2C] text-white shadow-inner'
                      : 'bg-white text-[#0B7347] hover:bg-emerald-50'
                  }`}
                >
                  Program Unggulan
                </button>
              </div>
            </div>

            {/* Gallery Grid matching reference (Left portrait + Right 2x3 grid) */}
            {galleryCategory === 'all' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 mt-5">
                {/* Left Tall Portrait Card */}
                <div className="md:col-span-4 relative rounded-2xl overflow-hidden shadow-md aspect-[3/4] md:aspect-auto min-h-[250px] md:min-h-full border border-white/20 group">
                  <Image
                    src={GALLERY_SHOWCASE[0].src}
                    alt={GALLERY_SHOWCASE[0].alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Right 2x3 Grid */}
                <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {GALLERY_SHOWCASE.slice(1).map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-2xl overflow-hidden shadow-md aspect-[4/3] border border-white/20 group"
                    >
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-5">
                {GALLERY_SHOWCASE.filter((item) => item.category === galleryCategory).map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-2xl overflow-hidden shadow-md aspect-[4/3] border border-white/20 group"
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Button Lihat Semua Galeri */}
            <div className="flex justify-center mt-6 sm:mt-8">
              <Link
                href="/galeri"
                className="bg-white hover:bg-emerald-50 text-[#075E38] font-bold text-xs sm:text-sm px-7 py-2.5 rounded-full shadow-lg transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Lihat Semua Galeri <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── SECTION 8: PENERIMAAN PESERTA DIDIK BARU (PPDB BANNER) ─── */}
        <section className="gsap-reveal max-w-6xl xl:max-w-7xl mx-auto mt-8 sm:mt-10">
          <div className="bg-[#FFFDF4] rounded-[26px] sm:rounded-[34px] p-5 sm:p-8 lg:p-10 shadow-md border border-amber-200/60 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              {/* Left Column: Information & Action */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                <h3 className="text-base sm:text-lg font-bold text-[#1B3B6F]">
                  Penerimaan Peserta Didik Baru
                </h3>
                <h2 className="text-xl sm:text-2xl lg:text-[30px] font-black text-[#1B3B6F] tracking-tight leading-tight mt-1">
                  Tahun Ajaran 2026/2027 Telah Dibuka
                </h2>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3.5 text-xs sm:text-sm text-[#4A607A] font-semibold">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#F5B744]" />
                    <span>Usia 2 - 6 Tahun</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#F5B744]" />
                    <span>Jl. Taman Citarum, Kota Bandung</span>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    href="/ppdb"
                    className="bg-[#F5B744] hover:bg-[#F59E0B] text-white font-bold text-xs sm:text-sm px-8 py-2.5 sm:py-3 rounded-full shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Daftar Sekarang <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Right Column: 3D Kids Illustration with rolling hills & stars */}
              <div className="lg:col-span-5 relative h-40 sm:h-48 lg:h-52 w-full">
                <Image
                  src="/images/ppdb_banner_kids.png"
                  alt="Siswa KB TK Istiqamah"
                  fill
                  className="object-contain object-right-bottom"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 9: PERTANYAAN YANG SERING DIAJUKAN (FAQ) ─── */}
        <section className="gsap-reveal max-w-6xl xl:max-w-7xl mx-auto mt-8 sm:mt-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#1B3B6F] tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          {/* 2-Column FAQ Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Left Column: 5 Accordion Questions */}
            <div className="lg:col-span-7 flex flex-col gap-2.5 sm:gap-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div
                    key={idx}
                    className="border border-[#48A97A]/40 rounded-2xl bg-white overflow-hidden transition-all shadow-sm hover:border-[#0B7347]/60"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#1B3B6F]">
                        {item.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-[#0B7347] transition-transform duration-300 flex-shrink-0 ml-2 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs sm:text-[13px] text-[#4A607A] leading-relaxed font-medium">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column: Contact Card & Map Location */}
            <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4">
              {/* Card 1: Masih ada Pertanyaan? */}
              <div className="border border-[#48A97A]/40 rounded-2xl bg-[#F5FBF8] p-4 sm:p-5 shadow-sm flex items-center gap-4">
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0">
                  <Image
                    src="/images/faq_girl.png"
                    alt="Bantuan Informasi"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#1B3B6F]">
                    Masih ada Pertanyaan?
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#4A607A] font-medium mt-1 leading-snug">
                    Yuk hubungi kami via Whatsapp. Kami siap membantu!
                  </p>
                  <a
                    href="https://wa.me/6281222248622?text=Halo%20KB%20TK%20Istiqamah%20Bandung,%20saya%20ingin%20bertanya%20mengenai%20pendaftaran%20sekolah..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 bg-[#0B7347] hover:bg-[#075E38] text-white font-bold text-xs px-5 py-2 rounded-full shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Hubungi Kami
                  </a>
                </div>
              </div>

              {/* Card 2: Interactive Location Map Card */}
              <a
                href="https://maps.google.com/?q=KB+TK+Istiqamah+Bandung+Jl+Taman+Citarum"
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-[#48A97A]/40 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all group relative h-28 sm:h-32"
                title="Buka Lokasi di Google Maps"
              >
                {/* Visual Map graphic background */}
                <div className="absolute inset-0 bg-[#E8F0F8] flex items-center justify-center">
                  <svg className="w-full h-full opacity-60" viewBox="0 0 400 150" fill="none">
                    <path d="M-20 40 Q80 30 180 60 T380 40" stroke="#CBDCEE" strokeWidth="18" fill="none" />
                    <path d="M120 -10 L140 160" stroke="#CBDCEE" strokeWidth="14" fill="none" />
                    <path d="M260 -10 L240 160" stroke="#CBDCEE" strokeWidth="12" fill="none" />
                    <circle cx="200" cy="75" r="28" fill="#D9E6F5" stroke="#CBDCEE" strokeWidth="8" />
                    <path d="M-20 110 Q100 130 200 90 T420 120" stroke="#E2ECF7" strokeWidth="10" fill="none" />
                  </svg>
                </div>
                {/* Red Pin & School Marker */}
                <div className="absolute inset-0 flex items-center justify-center p-3 z-10">
                  <div className="bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md border border-[#0B7347]/30 flex items-center gap-2 transform group-hover:scale-105 transition-transform">
                    <MapPin size={16} className="text-red-600 flex-shrink-0 fill-red-100" />
                    <div className="text-left">
                      <span className="text-[11px] sm:text-xs font-black text-[#1B3B6F] block leading-none">
                        KB TK Istiqamah Bandung
                      </span>
                      <span className="text-[9px] text-[#4A607A] font-semibold block mt-0.5 leading-none">
                        Jl. Taman Citarum No. 1, Kota Bandung
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
