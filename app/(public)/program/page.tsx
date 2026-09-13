'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  Target,
  Award,
  BookOpen,
  HeartHandshake,
  Atom,
  Music,
  Palette,
  Dumbbell,
  Languages,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  ArrowRight
} from 'lucide-react'

const CORE_PROGRAMS = [
  {
    id: 'islamic-learning',
    title: 'Islamic Learning',
    category: 'Nilai Agama & Ibadah Praktis',
    icon: BookOpen,
    desc: 'Menanamkan nilai-nilai Islam dan kecintaan kepada Allah SWT melalui pembelajaran AlQur’an, ibadah, doa, dan pembiasaan sehari-hari',
    longDesc: 'Program Islamic Learning dirancang untuk menanamkan pondasi akidah dan ibadah praktis anak melalui pendekatan yang menyenangkan. Anak dibimbing melafalkan huruf hijaiyah berharakat menggunakan metode Tilawati berlagu Rost, menghafal surat-surat pendek dalam Juz 30, doa-doa harian, serta simulasi wudhu dan shalat berjamaah.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Hafal 15 surat pendek Juz 30, 10 doa harian, tartil melafalkan Tilawati jilid dasar, dan terbiasa wudhu serta shalat.',
    activities: 'Membaca Tilawati klasikal, setoran hafalan ceria, praktik shalat dhuha berjamaah, dan dongeng kisah teladan Nabi.',
    image: '/images/fasilitas/7.webp'
  },
  {
    id: 'moslem-character',
    title: 'Moslem Character Building',
    category: 'Karakter & Budi Pekerti',
    icon: HeartHandshake,
    desc: 'Membangun karakter Islami melalui pembiasaan adab, akhlakul karimah, karakter SMART dan kepedulian terhadap sesama',
    longDesc: 'Pendidikan karakter Islami berfokus pada pembiasaan adab dan akhlakul karimah. Melalui pembiasaan karakter SMART dan kepedulian sesama, anak diajarkan bertutur kata santun, tertib mengantre, berbagi dengan teman, serta berpartisipasi dalam agenda kepedulian sosial.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Terbentuknya adab pergaulan islami, empati sosial, kemandirian emosi, dan kejujuran dalam berinteraksi.',
    activities: 'Jumat Berbagi (infaq cilik), bermain peran adab bertamu, lingkaran apresiasi kawan, dan pembiasaan antre tertib.',
    image: '/images/fasilitas/11.webp'
  },
  {
    id: 'life-skill',
    title: 'Life Skill',
    category: 'Kemandirian & Keterampilan Hidup',
    icon: Sparkles,
    desc: 'Melatih kemandirian dan keterampilan hidup anak melalui aktivitas nyata sesuai usia dan tahap perkembangannya',
    longDesc: 'Kecakapan hidup (life skill) melatih kemandirian dan keterampilan hidup anak melalui aktivitas nyata sesuai usia dan tahap perkembangannya. Meliputi toilet training yang tuntas, mencuci tangan pakai sabun, memakai dan melepas sepatu sendiri, makan secara mandiri dengan adab makan Islami, serta merapikan barang pribadi.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Anak mandiri melakukan toilet training, makan sendiri dengan tertib, serta mampu merapikan barang pribadi.',
    activities: 'Praktik mencuci tangan 6 langkah, mengancing baju dan memakai sepatu, merapikan mainan mandiri, dan cooking class mini.',
    image: '/images/fasilitas/1.webp'
  },
  {
    id: 'stem-pbl',
    title: 'Project Based Learning & STEM',
    category: 'Kreativitas & Eksplorasi Sains',
    icon: Atom,
    desc: 'Mengembangkan rasa ingin tahu, kreativitas, kemampuan berpikir kritis dan pemecahan masalah melalui eksplorasi serta proyek sederhana yang menyenangkan',
    longDesc: 'Melalui pendekatan Project Based Learning dan STEM, anak-anak mengembangkan rasa ingin tahu, kreativitas, kemampuan berpikir kritis dan pemecahan masalah melalui eksplorasi serta proyek sederhana yang menyenangkan.',
    age: 'Usia 4 - 6 Tahun',
    target: 'Kemampuan berpikir logis dasar, mengenal konsep angka dan pola alam, serta rasa takjub terhadap ciptaan Allah SWT.',
    activities: 'Eksperimen sains seru (gunung meletus mini, terapung-tenggelam), menanam benih sayur, dan proyek seni kriya ramah lingkungan.',
    image: '/images/fasilitas/6.webp'
  }
]

const FLAGSHIP_PROGRAMS = [
  {
    title: "Al-Qur'an Metode Tilawati",
    desc: "Mengenalkan dan menumbuhkan kecintaan anak terhadap Al-Qur'an melalui pembelajaran yang menyenangkan dan sesuai tahap perkembangan.",
    image: '/images/fasilitas/7.webp',
  },
  {
    title: "Qur'an Camp",
    desc: "Pengalaman belajar Islami yang memadukan kegiatan Al-Qur'an, ibadah, kemandirian, kebersamaan, dan aktivitas menyenangkan.",
    image: '/images/fasilitas/11.webp',
  },
  {
    title: "Outbound",
    desc: "Aktivitas luar ruang yang melatih keberanian, kemandirian, kerja sama, serta kemampuan motorik anak melalui berbagai tantangan yang menyenangkan.",
    image: '/images/gallery/7.jpg',
  },
  {
    title: "Outing Class",
    desc: "Menghadirkan pengalaman belajar langsung melalui eksplorasi lingkungan dan kunjungan edukatif yang sesuai dengan tema pembelajaran.",
    image: '/images/activity_fieldtrip.png',
  },
  {
    title: "Pentas Seni & Mini Asembly",
    desc: "Wadah bagi anak untuk mengekspresikan diri, mengembangkan kreativitas, kepercayaan diri, serta keberanian tampil di depan publik.",
    image: '/images/activity_artshow.png',
  },
  {
    title: "Family Day",
    desc: "Membangun kebersamaan dan kolaborasi sekolah dengan keluarga melalui pengalaman bermain dan belajar yang melibatkan anak bersama orang tua.",
    image: '/images/fasilitas/1.webp',
  },
  {
    title: "Takhosus",
    desc: "Program pendampingan khusus Hapalan Al -Qur’an untuk mengoptimalkan capaian perkembangan dan kompetensi anak melalui kegiatan yang lebih terarah dan berkelanjutan.",
    image: '/images/gallery/8.jpg',
  },
  {
    title: "Wisuda Tahfidz",
    desc: "Momen apresiasi atas perjalanan anak dalam menghafal Al-Qur'an sekaligus menumbuhkan rasa cinta dan bangga terhadap proses belajarnya.",
    image: '/images/gallery/3.jpg',
  },
  {
    title: "PPMB – Program Pengembangan Minat & Bakat",
    desc: "Memberikan kesempatan kepada anak untuk mengenali, mengeksplorasi, dan mengembangkan minat serta potensi melalui berbagai pilihan kegiatan.",
    image: '/images/fasilitas/12.webp',
  },
]

const EXTRACURRICULARS = [
  {
    title: 'Tahfidz & Tilawati Cilik',
    desc: 'Bimbingan hafalan Al-Qur\'an intensif dan lagu Rost Tilawati.',
    icon: BookOpen,
    schedule: 'Selasa & Kamis (13.00 - 14.00 WIB)',
    target: 'Penguatan makharijul huruf & hafalan juz 30'
  },
  {
    title: 'Seni Lukis & Kriya Anak',
    desc: 'Eksplorasi media warna, melukis kanvas, dan kerajinan tangan kreatif.',
    icon: Palette,
    schedule: 'Rabu (13.00 - 14.00 WIB)',
    target: 'Pengembangan estetika visual & motorik halus'
  },
  {
    title: 'Gerak & Lagu Islami',
    desc: 'Tari kreasi anak islami, irama gerak beradab, dan percaya diri tampil di panggung.',
    icon: Music,
    schedule: 'Senin (13.00 - 14.00 WIB)',
    target: 'Koordinasi gerak motorik kasar & kelenturan tubuh'
  },
  {
    title: 'Drumband Cilik (Marching Kids)',
    desc: 'Melatih konsentrasi nada perkusi, disiplin tempo, dan keselarasan tim.',
    icon: Sparkles,
    schedule: 'Jumat (08.00 - 09.30 WIB)',
    target: 'Kecerdasan musikal & kerjasama kelompok'
  },
  {
    title: 'English for Early Learners',
    desc: 'Kosakata bahasa Inggris dasar melalui nyanyian gembira dan cerita interaktif.',
    icon: Languages,
    schedule: 'Rabu (13.00 - 14.00 WIB)',
    target: 'Keberanian berkomunikasi & wawasan bahasa'
  },
  {
    title: 'Futsal & Olahraga Ceria',
    desc: 'Permainan bola mini, melompat rintangan, dan melatih stamina kebugaran.',
    icon: Dumbbell,
    schedule: 'Sabtu Pagi (08.00 - 09.30 WIB)',
    target: 'Kebugaran fisik, ketangkasan, dan sportivitas'
  }
]

export default function ProgramPage() {
  return (
    <div className="w-full pt-24">
      {/* ─── HEADER SECTION (Point 7) ────────────── */}
      <section className="relative py-16 bg-[#07265F] text-white rounded-[32px] max-w-7xl mx-auto px-6 sm:px-8 text-center overflow-hidden shadow-lg mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#07A363]/20 rounded-full pointer-events-none translate-y-12 -translate-x-12" />
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
          <Sparkles size={14} /> Kurikulum Merdeka PAUD Terintegrasi
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Pendekatan Pembelajaran &amp; Program Unggulan</h1>
        <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto opacity-95 relative z-10 leading-relaxed">
          Beragam pengalaman belajar bermakna untuk menumbuhkan iman, karakter, kemandirian, kreativitas, dan potensi terbaik setiap anak.
        </p>
      </section>

      {/* ─── DETAIL 4 CORE LEARNING PROGRAMS (Point 9) ── */}
      <section className="py-8 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        {CORE_PROGRAMS.map((prog, idx) => {
          const isEven = idx % 2 === 0
          const IconComp = prog.icon
          return (
            <div
              key={prog.id}
              className={`bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Image Column */}
              <div className={`lg:col-span-5 relative w-full h-[260px] sm:h-[340px] rounded-[24px] overflow-hidden shadow-inner order-first ${
                isEven ? 'lg:order-first' : 'lg:order-last'
              }`}>
                <Image
                  src={prog.image}
                  alt={prog.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs text-primary-blue text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <IconComp size={15} className="text-[#07A363]" />
                  <span>{prog.title}</span>
                </div>
              </div>

              {/* Description Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#07A363]/10 text-[#07A363] px-3.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                    <IconComp size={13} /> {prog.category}
                  </span>
                  <span className="text-xs font-bold text-gray-400">Pilar {idx + 1}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-primary-blue">{prog.title}</h2>

                <p className="text-sm font-semibold text-[#07A363] leading-relaxed italic">
                  &ldquo;{prog.desc}&rdquo;
                </p>

                <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
                  {prog.longDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="bg-[#F9F4ED] rounded-xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#07A363] font-bold text-xs mb-1">
                      <Calendar size={14} /> Tahap Usia
                    </div>
                    <p className="text-xs font-extrabold text-[#07265F]">{prog.age}</p>
                  </div>
                  <div className="bg-[#F9F4ED] rounded-xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#07A363] font-bold text-xs mb-1">
                      <Target size={14} /> Target Capaian
                    </div>
                    <p className="text-[11px] font-semibold text-[#07265F] leading-tight">{prog.target}</p>
                  </div>
                  <div className="bg-[#F9F4ED] rounded-xl p-3.5 border border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#07A363] font-bold text-xs mb-1">
                      <Award size={14} /> Kegiatan Utama
                    </div>
                    <p className="text-[11px] font-semibold text-[#07265F] leading-tight">{prog.activities}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ─── 9 PROGRAM UNGGULAN (FLAGSHIP PROGRAMS) ─── */}
      <section className="py-12 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#07A363]/10 text-[#07A363] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Award size={14} /> Pengalaman Belajar Bermakna
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#07265F]">Program Unggulan</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Beragam pengalaman belajar bermakna untuk menumbuhkan iman, karakter, kemandirian, kreativitas, dan potensi terbaik setiap anak.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {FLAGSHIP_PROGRAMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#07265F] group-hover:text-[#07A363] transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SECTION KHUSUS EKSTRAKURIKULER (Point 11) ─── */}
      <section className="py-16 bg-[#F9F4ED] my-12 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#07A363]/10 text-[#07A363] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} /> Minat, Bakat &amp; Seni
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary-blue">Kegiatan Ekstrakurikuler</h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Pilihan aktivitas ekstrakurikuler setelah jam pembelajaran formal untuk mengasah potensi majemuk, keberanian berekspresi, dan kebugaran anak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXTRACURRICULARS.map((ekskul, idx) => {
              const IconComp = ekskul.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary-green flex items-center justify-center">
                        <IconComp size={24} />
                      </div>
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#F8F6F2] text-primary-blue border border-gray-200">
                        {ekskul.schedule}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-primary-blue leading-snug">{ekskul.title}</h3>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{ekskul.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 size={13} className="text-[#07A363]" />
                    <span>{ekskul.target}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── NARAHUBUNG & SPMB BANNER ──── */}
      <section className="bg-[#07A363] text-white py-14 rounded-[32px] max-w-7xl mx-auto my-12 px-6 sm:px-8 lg:px-12 text-center shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black">Tertarik Dengan Program Belajar Kami?</h2>
          <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-95">
            Dapatkan pengalaman bermain dan belajar Islami terbaik bagi buah hati Anda dengan mendaftar di SPMB Online KB &amp; TK Istiqamah Bandung.
          </p>

          {/* Quick Contact Buttons */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/ppdb"
              className="bg-[#07265F] hover:bg-[#07265F]/90 text-white font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-full transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Daftar SPMB Sekarang</span>
              <ArrowRight size={14} />
            </Link>
            <a
              href="https://wa.me/628112198853?text=Halo%20Admin%20SPMB%20TK%20Istiqamah,%20saya%20ingin%20berkonsultasi%20mengenai%20program%20sekolah."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-white/90 text-[#07265F] font-extrabold text-xs tracking-wider uppercase px-8 py-3.5 rounded-full transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle size={15} className="text-[#07A363]" />
              <span>Hubungi Narahubung SPMB (0811 2198 853)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
