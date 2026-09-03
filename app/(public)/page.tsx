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
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Sparkles,
  Atom,
  Music,
  Palette,
  Dumbbell,
  Languages,
  CheckCircle2,
  X,
  Building2,
  PhoneCall,
  MessageCircle,
  Clock,
  ShieldCheck
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

// 4 Program Pembelajaran Inti (Point 9)
const LEARNING_PROGRAMS = [
  {
    id: 'islamic-learning',
    title: 'Islamic Learning',
    category: 'Nilai Agama & Moral',
    icon: BookOpen,
    color: 'emerald',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-500 text-white',
    desc: 'Pengenalan nilai Tauhid, adab Islami, hafalan surat-surat pendek, doa praktis harian, serta bimbingan membaca Al-Qur\'an metode Tilawati dengan lagu Rost.',
    features: ['Tilawati & Tahfidz Juz 30', 'Praktik Wudhu & Shalat Cilik', 'Doa & Kalimat Thayyibah Harian'],
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (3).png'
  },
  {
    id: 'muslimic-character',
    title: 'Muslimic Character Building',
    category: 'Karakter & Budi Pekerti',
    icon: HeartHandshake,
    color: 'blue',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-600 text-white',
    desc: 'Membentuk pondasi kepribadian muslim sejak dini melalui pembiasaan 5S (Salam, Senyum, Sapa, Sopan, Santun), empati berbagi, dan kejujuran bergaul.',
    features: ['Infaq & Jumat Berbagi', 'Pembiasaan Adab & Kedisiplinan', 'Kisah Teladan Rasulullah & Sahabat'],
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_44 PM (2).png'
  },
  {
    id: 'life-skill',
    title: 'Life Skill',
    category: 'Kemandirian & Motorik',
    icon: Sparkles,
    color: 'amber',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-500 text-white',
    desc: 'Melatih kemandirian dan kecakapan motorik fungsional anak: toilet training, merapikan mainan dan perlengkapan sendiri, serta kebiasaan makan sehat beradab.',
    features: ['Kemandirian Diri (Self-Help)', 'Keterampilan Motorik Halus & Kasar', 'Pola Hidup Bersih & Sehat (PHBS)'],
    image: '/images/Cover.png'
  },
  {
    id: 'stem-pbl',
    title: 'Project Based Learning / STEM',
    category: 'Sains & Eksplorasi Kreatif',
    icon: Atom,
    color: 'purple',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-600 text-white',
    desc: 'Mendorong rasa ingin tahu alami anak melalui eksplorasi ilmiah sederhana, pengenalan logika berhitung sensorik, percobaan sains warna, dan karya proyek seru.',
    features: ['Eksperimen Sains Ceria', 'Logika Berhitung & Sensori Bentuk', 'Proyek Karya Kolaboratif Tematik'],
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_48 PM (5).png'
  }
]

// Section Ekstrakurikuler (Point 11)
const EXTRACURRICULARS = [
  {
    title: 'Tahfidz & Tilawati Cilik',
    desc: 'Bimbingan intensif hafalan Al-Qur\'an juz 30 dan pengenalan makhraj huruf dengan lagu Rost.',
    icon: BookOpen,
    schedule: 'Selasa & Kamis',
    instructor: 'Ustadzah Khadijah',
    color: 'emerald'
  },
  {
    title: 'Seni Lukis & Kriya Anak',
    desc: 'Eksplorasi warna, kanvas finger painting, kriya kertas, dan merangsang kreativitas imajinasi bebas.',
    icon: Palette,
    schedule: 'Rabu',
    instructor: 'Kak Salma Art',
    color: 'pink'
  },
  {
    title: 'Gerak & Lagu Islami',
    desc: 'Melatih ritme musikalitas, kelenturan koordinasi tubuh, serta kepercayaan diri unjuk ekspresi.',
    icon: Music,
    schedule: 'Senin',
    instructor: 'Bunda Fitri',
    color: 'amber'
  },
  {
    title: 'Drumband Cilik (Marching Kids)',
    desc: 'Melatih konsentrasi tempo musik, kerjasama kelompok, kepemimpinan, dan rasa kebersamaan.',
    icon: Sparkles,
    schedule: 'Jumat',
    instructor: 'Coach Rian',
    color: 'blue'
  },
  {
    title: 'English for Early Learners',
    desc: 'Pengenalan kosakata bahasa Inggris dasar secara interaktif melalui dongeng, flashcard, dan lagu riang.',
    icon: Languages,
    schedule: 'Rabu',
    instructor: 'Miss Sarah',
    color: 'violet'
  },
  {
    title: 'Futsal & Olahraga Ceria',
    desc: 'Pengembangan ketangkasan fisik motorik kasar, stamina tubuh, serta sportivitas bermain bersama kawan.',
    icon: Dumbbell,
    schedule: 'Sabtu Pagi',
    instructor: 'Coach Deni',
    color: 'orange'
  }
]

// Fasilitas Sekolah dengan Multi-Foto Swipe & Popup Detail (Point 10)
const SCHOOL_FACILITIES = [
  {
    id: 'fac-1',
    title: 'Ruang Kelas Ber-AC & Ramah Anak',
    category: 'Ruang Belajar',
    badge: 'Kapasitas 15 Siswa / Kelas',
    shortDesc: 'Ruang belajar berpendingin udara dengan pencahayaan alami, karpet bermain edukatif, dan meja-kursi ergonomis aman tanpa sudut tajam.',
    fullDesc: 'Setiap ruang kelas di KB & TK Istiqamah dirancang untuk kenyamanan maksimal anak usia dini. Dilengkapi dengan pendingin ruangan (AC), sirkulasi udara alami yang segar, proyektor interaktif, pojok sensory play, serta loker pribadi untuk menumbuhkan rasa tanggung jawab merapikan perlengkapan sendiri.',
    specs: [
      'Dilengkapi AC & Exhaust Air Filter',
      'Lantai beralas karpet lembut anti-alergi',
      'Meja & kursi ergonomis ramah balita',
      'Pojok alat peraga edukasi mandiri'
    ],
    images: [
      '/images/gallery_1.png',
      '/images/ChatGPT Image Jun 17, 2026, 10_17_44 PM (2).png',
      '/images/Cover.png'
    ]
  },
  {
    id: 'fac-2',
    title: 'Playground & Area Bermain Outdoor',
    category: 'Sarana Bermain',
    badge: 'Standar Keamanan Tinggi',
    shortDesc: 'Wahana perosotan terowongan, ayunan, monkey bar mini dengan rumput sintetis higienis untuk melatih motorik kasar anak.',
    fullDesc: 'Area bermain luar ruangan (*playground*) menyediakan stimulasi fisik yang menyenangkan. Dikelilingi pagar pengaman, dilapisi rumput sintetis empuk bersertifikasi aman jika anak terjatuh, serta dilengkapi beragam wahana ketangkasan motorik kasar yang diawasi langsung oleh guru pendamping.',
    specs: [
      'Rumput sintetis empuk dengan shock-pad',
      'Wahana perosotan terowongan & ayunan tertutup',
      'Peralatan permainan dibersihkan berkala',
      'Pengawasan penuh guru dan CCTV 24 jam'
    ],
    images: [
      '/images/gallery_2.png',
      '/images/gallery_4.png',
      '/images/Asset 9.png'
    ]
  },
  {
    id: 'fac-3',
    title: 'Pojok Baca & Perpustakaan Cilik',
    category: 'Literasi & Dongeng',
    badge: 'Ratusan Buku Bergambar',
    shortDesc: 'Ruang membaca nyaman dengan bantal empuk (*bean bag*), koleksi dongeng Islam, buku pop-up, dan ensiklopedia anak bergambar.',
    fullDesc: 'Pojok Baca kami menumbuhkan kecintaan terhadap buku sejak usia emas. Anak-anak dibimbing dalam sesi *storytelling* (mendongeng interaktif) mingguan yang melatih imajinasi, perbendaharaan kosakata bahasa, serta pesan-pesan moral akhlak karimah.',
    specs: [
      'Koleksi buku dongeng Islami & sains cilik',
      'Area lesehan dengan beanbag warna-warni',
      'Alat peraga boneka tangan untuk mendongeng',
      'Peminjaman buku mingguan untuk di rumah'
    ],
    images: [
      '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (4).png',
      '/images/Cover.png'
    ]
  },
  {
    id: 'fac-4',
    title: 'Musholla Cilik & Tempat Wudhu Anak',
    category: 'Spiritual & Ibadah',
    badge: 'Kran Wudhu Khusus Balita',
    shortDesc: 'Musholla bersih dan tempat wudhu dengan tinggi kran khusus anak untuk pembiasaan shalat berjamaah dan praktik berwudhu mandiri.',
    fullDesc: 'Sarana ibadah yang dirancang khusus sesuai tinggi badan anak-anak. Menjadi laboratorium spiritual harian untuk pembiasaan antre saat berwudhu, adab masuk tempat ibadah, serta praktik shalat dhuha dan dhuhur berjamaah dengan bimbingan ustadzah.',
    specs: [
      'Kran air dengan ketinggian ergonomis anak',
      'Lantai antiselip aman dari bahaya terpeleset',
      'Mukena dan sajadah cilik higienis',
      'Suasana tenang, sejuk, dan wangi'
    ],
    images: [
      '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (3).png',
      '/images/gallery_1.png'
    ]
  },
  {
    id: 'fac-5',
    title: 'UKS Cilik & Ruang Tumbuh Kembang',
    category: 'Kesehatan & Gizi',
    badge: 'Pemeriksaan Rutin Berkala',
    shortDesc: 'Ruang penanganan medis darurat pertama, tempat istirahat anak sakit, serta pemantauan tinggi dan berat badan secara berkala.',
    fullDesc: 'Kesehatan dan keselamatan anak adalah prioritas utama kami. UKS Cilik dilengkapi kotak P3K lengkap, tempat tidur istirahat yang nyaman, alat ukur tinggi badan dan timbangan digital untuk mencatat kurva tumbuh kembang siswa setiap bulan.',
    specs: [
      'Tempat tidur istirahat bersih & nyaman',
      'Kelengkapan obat-obatan P3K standar PAUD',
      'Timbangan digital & mikrotoise pengukur tinggi',
      'Bekerjasama dengan Puskesmas / dokter anak'
    ],
    images: [
      '/images/gallery_3.png',
      '/images/Cover.png'
    ]
  },
  {
    id: 'fac-6',
    title: 'Area Sensori & Kebun Eksplorasi Sains',
    category: 'Alam & Sensori',
    badge: 'Belajar Bersama Alam',
    shortDesc: 'Lahan mini bercocok tanam, pengenalan tanaman herbal/sayur, serta wadah sensori pasir dan air untuk melatih sensomotorik.',
    fullDesc: 'Anak diajak berinteraksi langsung dengan alam sekitarnya. Melalui kegiatan menanam bibit sayur, menyiram tanaman setiap pagi, serta bermain pasir dan air terarah, anak mengembangkan kepekaan sensori, empati pada makhluk hidup, dan rasa syukur atas ciptaan Allah SWT.',
    specs: [
      'Media tanam pot vertikal & hidroponik mini',
      'Bak sensory play pasir kinetik & air bersih',
      'Alat berkebun anak plastik anti-cedera',
      'Mengenalkan siklus hidup tanaman'
    ],
    images: [
      '/images/ChatGPT Image Jun 17, 2026, 10_17_48 PM (5).png',
      '/images/gallery_2.png'
    ]
  }
]

// Kontak Narahubung Resmi (Point 12)
const CONTACT_PERSONS = [
  {
    role: 'Narahubung PPDB & Pendaftaran',
    name: 'Ustadzah Admin PPDB',
    phone: '0811 2198 853',
    waLink: 'https://wa.me/628112198853?text=Halo%20Admin%20PPDB%20TK%20Istiqamah,%20saya%20ingin%20bertanya%20informasi%20pendaftaran%20murid%20baru.',
    hours: 'Senin - Jumat (07.30 - 15.00 WIB)'
  },
  {
    role: 'Narahubung Tata Usaha & Akademik',
    name: 'Kantor Tata Usaha Sekolah',
    phone: '022 - 4241799 / 0812 2345 6789',
    waLink: 'https://wa.me/6281223456789?text=Halo%20Tata%20Usaha%20TK%20Istiqamah,%20saya%20ingin%20berkonsultasi%20tentang%20program%20akademik.',
    hours: 'Senin - Jumat (07.30 - 14.00 WIB)'
  },
  {
    role: 'Narahubung Konfirmasi Pembayaran',
    name: 'Bagian Keuangan & Administrasi',
    phone: '0811 2198 853',
    waLink: 'https://wa.me/628112198853?text=Halo%20Bagian%20Keuangan%20TK%20Istiqamah,%20saya%20ingin%20mengonfirmasi%20bukti%20pembayaran%20pendaftaran.',
    hours: 'Senin - Jumat (08.00 - 14.00 WIB)'
  }
]

const FALLBACK_GALLERY = [
  { id: 'f1', title: 'Kegiatan Pembelajaran di Kelas', image: '/images/gallery_1.png', category: 'Kegiatan Pembelajaran' },
  { id: 'f2', title: 'Sarana & Fasilitas Bermain', image: '/images/gallery_2.png', category: 'Sarana' },
  { id: 'f3', title: 'Prestasi dan Apresiasi Murid', image: '/images/gallery_3.png', category: 'Prestasi' },
  { id: 'f4', title: 'Kegiatan Pembelajaran Luar Kelas', image: '/images/gallery_4.png', category: 'Kegiatan Pembelajaran' },
]

export default function HomePage() {
  const [galleryItems, setGalleryItems] = useState<any[]>(FALLBACK_GALLERY)
  const [[galleryPage, galleryDirection], setGalleryPage] = useState([0, 0])
  const [visibleItems, setVisibleItems] = useState(5)

  const [testimonials, setTestimonials] = useState<any[]>([])
  const [heroBanners, setHeroBanners] = useState<any[]>([])
  const [currentHero, setCurrentHero] = useState(0)

  // Facility Popup Modal State
  const [selectedFacility, setSelectedFacility] = useState<typeof SCHOOL_FACILITIES[0] | null>(null)
  const [facilityPhotoIndex, setFacilityPhotoIndex] = useState(0)

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
        // Map category if 'Kegiatan' to 'Kegiatan Pembelajaran'
        const mapped = data.map(item => ({
          ...item,
          category: item.category === 'Kegiatan' ? 'Kegiatan Pembelajaran' : item.category
        }))
        setGalleryItems(mapped)
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
  }, [supabase])

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

  // Open facility popup modal
  const handleOpenFacility = (facility: typeof SCHOOL_FACILITIES[0]) => {
    setSelectedFacility(facility)
    setFacilityPhotoIndex(0)
  }

  // Facility slide navigation
  const nextFacilityPhoto = () => {
    if (!selectedFacility) return
    setFacilityPhotoIndex(prev => (prev + 1) % selectedFacility.images.length)
  }

  const prevFacilityPhoto = () => {
    if (!selectedFacility) return
    setFacilityPhotoIndex(prev => (prev - 1 + selectedFacility.images.length) % selectedFacility.images.length)
  }

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
              aria-label="Previous Slide"
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all cursor-pointer shadow-md z-30 opacity-0 group-hover:opacity-100 duration-300"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextHero}
              aria-label="Next Slide"
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
                aria-label={`Slide ${idx + 1}`}
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
              { icon: '/images/Asset 6.png', alt: 'Bermain Kreatif', title: 'Bermain Kreatif', desc: 'Mengasah imajinasi melalui aktivitas bermain yang menyenangkan dan bermakna.' },
              { icon: '/images/Asset 5.png', alt: 'Berakhlak Sejak Dini', title: 'Berakhlak Sejak Dini', desc: 'Pembiasaan sikap terpuji dan keteladanan harian di sekolah maupun di rumah.' },
              { icon: '/images/Asset 4.png', alt: 'Kurikulum Islami Terarah', title: 'Kurikulum Islami Terarah', desc: 'Pembelajaran terintegrasi nilai keislaman dan sains modern sesuai tahap usia emas anak.' },
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

      {/* ─── PROGRAM UNGGULAN (Point 7 & 9) ───────── */}
      <section className="py-20 bg-[#F9F4ED] relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#07A363]/10 text-[#07A363] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Star size={14} className="fill-current" /> Kurikulum Pembelajaran PAUD
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-blue">Program Unggulan</h2>
            <p className="text-sm text-[#07265F]/75 max-w-2xl mx-auto font-medium leading-relaxed">
              Empat pilar utama program pembelajaran yang dirancang untuk mengoptimalkan potensi spiritual, sosial, kemandirian, dan kognitif buah hati Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {LEARNING_PROGRAMS.map((prog) => {
              const IconComp = prog.icon
              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-[30px] p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 duration-300"
                >
                  <div className="space-y-4">
                    {/* Header: Icon & Category */}
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl ${prog.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComp size={28} />
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${prog.badgeColor}`}>
                        {prog.category}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <div className="space-y-2 pt-2">
                      <h3 className="font-black text-lg text-primary-blue leading-snug group-hover:text-primary-green transition-colors">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {prog.desc}
                      </p>
                    </div>

                    {/* Key Features */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Ragam Pembelajaran:</p>
                      {prog.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-primary-blue">
                          <CheckCircle2 size={13} className="text-[#07A363] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href="/program"
                      className="flex items-center justify-between text-xs font-bold text-[#07A363] group-hover:text-primary-blue transition-colors"
                    >
                      <span>Lihat Rincian Program</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/program" className="bg-primary-blue hover:bg-primary-blue/90 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-3.5 rounded-full transition-all shadow-md inline-flex items-center gap-2">
              Katalog Lengkap Kurikulum &amp; Jadwal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION KHUSUS EKSTRAKURIKULER (Point 11) ─── */}
      <section className="py-20 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-purple-200">
              <Sparkles size={14} /> Minat &amp; Bakat Anak
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-blue">Kegiatan Ekstrakurikuler</h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Mewadahi eksplorasi minat, kecerdasan majemuk (*multiple intelligences*), dan bakat anak melalui kegiatan ekstrakurikuler yang seru dan dipandu pelatih profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXTRACURRICULARS.map((ekskul, idx) => {
              const IconComp = ekskul.icon
              return (
                <div
                  key={idx}
                  className="bg-[#F9F4ED]/60 rounded-3xl p-6 border border-gray-100 hover:border-primary-green/40 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white text-primary-green flex items-center justify-center shadow-sm border border-gray-100">
                        <IconComp size={22} />
                      </div>
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white text-gray-600 border border-gray-200 font-mono">
                        {ekskul.schedule}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-primary-blue leading-snug">{ekskul.title}</h3>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{ekskul.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-bold text-gray-500">
                    <span>Pelatih: {ekskul.instructor}</span>
                    <span className="text-[#07A363]">Tersedia</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION FASILITAS SEKOLAH & POP UP SWIPE (Point 10) ─── */}
      <section className="py-20 bg-[#F9F4ED]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-blue-200">
              <Building2 size={14} /> Sarana &amp; Prasarana
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-blue">Fasilitas Sekolah Unggulan</h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Lingkungan belajar yang bersih, aman, dan nyaman berstandar ramah anak. Klik salah satu fasilitas untuk melihat foto dan detail lengkap.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {SCHOOL_FACILITIES.map((facility) => (
              <div
                key={facility.id}
                onClick={() => handleOpenFacility(facility)}
                className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 cursor-pointer group flex flex-col"
              >
                {/* Image Box */}
                <div className="relative w-full h-52 overflow-hidden bg-gray-100">
                  <Image
                    src={facility.images[0]}
                    alt={facility.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="bg-[#07A363] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {facility.category}
                    </span>
                  </div>
                  {facility.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      +{facility.images.length} Foto
                    </div>
                  )}
                </div>

                {/* Content Box */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-primary-blue group-hover:text-primary-green transition-colors leading-snug">
                      {facility.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                      {facility.shortDesc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-extrabold text-[#07A363]">
                    <span>Lihat Detail Fasilitas</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODAL POP UP FASILITAS (Point 10: Foto > 1 dengan Gaya Geser / Swipe) ─── */}
      <AnimatePresence>
        {selectedFacility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedFacility(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedFacility(null)}
                aria-label="Tutup"
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>

              {/* Photo Slider (Gaya Geser / Swipe) */}
              <div className="relative w-full h-64 sm:h-80 bg-gray-950 overflow-hidden shrink-0 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={facilityPhotoIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={selectedFacility.images[facilityPhotoIndex]}
                      alt={selectedFacility.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Slider Controls (if photos > 1) */}
                {selectedFacility.images.length > 1 && (
                  <>
                    <button
                      onClick={prevFacilityPhoto}
                      aria-label="Foto Sebelumnya"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-xs shadow-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextFacilityPhoto}
                      aria-label="Foto Selanjutnya"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-xs shadow-md"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Dots / Page Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {selectedFacility.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setFacilityPhotoIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            idx === facilityPhotoIndex ? 'bg-white scale-125' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="absolute bottom-3.5 left-4 bg-black/60 text-white text-[10px] font-mono px-2.5 py-1 rounded-md">
                      {facilityPhotoIndex + 1} / {selectedFacility.images.length} Foto
                    </div>
                  </>
                )}
              </div>

              {/* Detail Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#07A363]/10 text-[#07A363] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedFacility.category}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      • {selectedFacility.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-primary-blue">
                    {selectedFacility.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  {selectedFacility.fullDesc}
                </p>

                {/* Specs List */}
                <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary-blue flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#07A363]" /> Spesifikasi &amp; Fasilitas:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedFacility.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                        <CheckCircle2 size={14} className="text-[#07A363] shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="px-6 py-2.5 bg-primary-blue hover:bg-primary-blue/90 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Tutup Detail
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── INFORMASI NARAHUBUNG RESMI (Point 12) ─── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-gradient-to-br from-primary-blue via-[#0c367d] to-[#07265F] text-white rounded-[32px] p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#07A363]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  <PhoneCall size={14} /> Layanan Bantuan &amp; Konsultasi
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">Nomor Narahubung Resmi</h2>
                <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
                  Punya pertanyaan seputar kurikulum, pendaftaran PPDB, atau konfirmasi administrasi? Hubungi narahubung kami melalui WhatsApp resmi berikut:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CONTACT_PERSONS.map((person, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col justify-between space-y-4 hover:bg-white/15 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 font-mono">
                        {person.role}
                      </div>
                      <h3 className="font-extrabold text-base text-white">{person.name}</h3>
                      <p className="text-sm font-black text-white font-mono">{person.phone}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium pt-1">
                        <Clock size={12} /> {person.hours}
                      </div>
                    </div>

                    <a
                      href={person.waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} />
                      <span>Chat WhatsApp</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GALLERY SLIDER (Kegiatan Pembelajaran - Point 8) ─── */}
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
            <h2 className="text-2xl sm:text-3xl font-black text-white">Galeri Kegiatan Pembelajaran</h2>
            <p className="text-white/70 text-sm font-semibold mt-2">Momen berharga kegiatan belajar dan bermain di KB &amp; TK Istiqamah</p>
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
                  aria-label="Galeri Sebelumnya"
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#07A363] hover:bg-[#07A363]/90 text-white p-2.5 rounded-full transition-all cursor-pointer shadow-md z-20"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextGallery}
                  aria-label="Galeri Selanjutnya"
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
                      <Image src="/images/parent_agus.png" alt="Pa Agus" fill className="object-cover" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
                        &ldquo;Anak saya menjadi sangat mandiri, senang membaca Al-Qur&apos;an dengan nada Tilawati, dan selalu antusias berangkat sekolah setiap pagi. Lingkungan guru sangat penuh kasih sayang!&rdquo;
                      </p>
                      <p className="font-extrabold text-[#07265F] text-sm">Pak Agus &amp; Ibu Fitri</p>
                      <p className="text-[11px] text-gray-400 font-semibold">Orang Tua Murid Kelas TK-A</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-start">
                <Link href="/aktivitas" className="flex items-center gap-2 font-extrabold text-sm text-[#07A363] hover:text-[#07A363]/80 transition-colors">
                  Lihat Kegiatan Pembelajaran &amp; Aktivitas Sekolah <ArrowRight size={16} />
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
          Daftar SPMB Sekarang
        </Link>
      </section>
    </div>
  )
}
