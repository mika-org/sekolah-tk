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
  ArrowRight,
  MessageCircle
} from 'lucide-react'

const CORE_PROGRAMS = [
  {
    id: 'islamic-learning',
    title: 'Islamic Learning',
    category: 'Nilai Agama & Ibadah Praktis',
    icon: BookOpen,
    desc: 'Menanamkan nilai-nilai Islam dan kecintaan kepada Allah SWT melalui pembelajaran Al-Qur’an, ibadah, doa, dan pembiasaan sehari-hari.',
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
    desc: 'Membangun karakter Islami melalui pembiasaan adab, akhlakul karimah, karakter SMART dan kepedulian terhadap sesama.',
    longDesc: 'Pendidikan karakter Islami berfokus pada pembiasaan adab dan akhlakul karimah. Melalui pembiasaan karakter SMART dan kepedulian sesama, anak diajarkan bertutur kata santun, tertib mengantre, berbagi dengan teman, serta berpartisipasi dalam agenda kepedulian sosial.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Terbentuknya adab pergaulan islami, empati sosial, kemandirian emosi, dan kejujuran dalam berinteraksi.',
    activities: 'Jumat Berbagi (infaq cilik), bermain peran adab bertamu, lingkaran apresiasi kawan, dan pembiasaan antre tertib.',
    image: '/images/fasilitas/11.webp'
  },
  {
    id: 'life-skill',
    title: 'Life Skill & Kemandirian',
    category: 'Kemandirian & Keterampilan Hidup',
    icon: Sparkles,
    desc: 'Melatih kemandirian dan keterampilan hidup anak melalui aktivitas nyata sesuai usia dan tahap perkembangannya.',
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
    desc: 'Mengembangkan rasa ingin tahu, kreativitas, kemampuan berpikir kritis dan pemecahan masalah melalui eksplorasi serta proyek sederhana.',
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
    desc: "Mengenalkan dan menumbuhkan kecintaan anak terhadap Al-Qur'an melalui pembelajaran bertahap dan berlagu Rost yang menyenangkan.",
    image: '/images/fasilitas/7.webp',
  },
  {
    title: "Qur'an Camp",
    desc: "Pengalaman belajar Islami yang memadukan kegiatan Al-Qur'an, ibadah, kemandirian, kebersamaan, dan aktivitas menyenangkan.",
    image: '/images/fasilitas/11.webp',
  },
  {
    title: "Outbound Ceria",
    desc: "Aktivitas luar ruang yang melatih keberanian, kemandirian, kerja sama, serta kemampuan motorik anak melalui berbagai tantangan aman.",
    image: '/images/gallery/7.jpg',
  },
  {
    title: "Outing Class Edukatif",
    desc: "Menghadirkan pengalaman belajar langsung melalui eksplorasi lingkungan dan kunjungan edukatif yang sesuai dengan tema pembelajaran.",
    image: '/images/activity_fieldtrip.png',
  },
  {
    title: "Pentas Seni & Mini Assembly",
    desc: "Wadah bagi anak untuk mengekspresikan diri, mengembangkan kreativitas, kepercayaan diri, serta keberanian tampil di depan publik.",
    image: '/images/activity_artshow.png',
  },
  {
    title: "Family Day",
    desc: "Membangun kebersamaan dan kolaborasi sekolah dengan keluarga melalui pengalaman bermain dan belajar yang melibatkan anak bersama orang tua.",
    image: '/images/fasilitas/1.webp',
  },
  {
    title: "Takhosus Tahfidz",
    desc: "Program pendampingan khusus hafalan Al-Qur’an untuk mengoptimalkan capaian perkembangan dan kompetensi anak secara terarah.",
    image: '/images/gallery/8.jpg',
  },
  {
    title: "Wisuda Tahfidz",
    desc: "Momen apresiasi atas perjalanan anak dalam menghafal Al-Qur'an sekaligus menumbuhkan rasa cinta dan bangga terhadap proses belajarnya.",
    image: '/images/gallery/3.jpg',
  },
  {
    title: "PPMB (Minat & Bakat)",
    desc: "Memberikan kesempatan kepada anak untuk mengenali, mengeksplorasi, dan mengembangkan minat serta potensi melalui pilihan kegiatan favorit.",
    image: '/images/fasilitas/12.webp',
  },
]

const EXTRACURRICULARS = [
  {
    title: 'Tahfidz & Tilawati Cilik',
    desc: 'Bimbingan hafalan Al-Qur\'an intensif dan pelafalan Tilawati bertingkat.',
    icon: BookOpen,
    schedule: 'Selasa & Kamis (13.00 - 14.00 WIB)',
    target: 'Penguatan makharijul huruf & hafalan Juz 30'
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
    target: 'Koordinasi gerak motorik kasar & kelenturan'
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
    <div className="w-full pt-20 sm:pt-24 pb-16">
      {/* ─── HEADER SECTION (Clean Header) ───────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="bg-[#102A4E] rounded-[24px] sm:rounded-[32px] py-10 sm:py-14 px-6 sm:px-10 text-center text-white shadow-xl border border-white/10">
          <span className="inline-block bg-white/15 text-emerald-200 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            Kurikulum Terpadu &amp; Tilawati
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-black tracking-tight">
            Pendekatan Pembelajaran &amp; Program Unggulan
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/85 font-medium max-w-2xl mx-auto leading-relaxed">
            Menyelenggarakan ragam pengalaman belajar bermakna untuk menumbuhkan iman, karakter mulia, kemandirian, kreativitas, dan potensi terbaik setiap anak.
          </p>
        </div>
      </section>

      {/* ─── 4 CORE LEARNING PROGRAMS ───────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 mb-12 sm:mb-16">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-block bg-[#0B7347]/10 text-[#0B7347] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Pilar Pembelajaran
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B3B6F] tracking-tight">
            4 Pendekatan Belajar Holistik
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#4A607A] font-medium">
            Membangun kecerdasan spiritual, emosional, kognitif, dan kemandirian secara utuh.
          </p>
        </div>

        {CORE_PROGRAMS.map((prog, idx) => {
          const isEven = idx % 2 === 0
          const IconComp = prog.icon
          return (
            <div
              key={prog.id}
              className={`bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Image Column */}
              <div
                className={`lg:col-span-5 relative w-full h-[240px] sm:h-[300px] rounded-[20px] overflow-hidden shadow-inner border border-emerald-50 ${
                  isEven ? 'lg:order-first' : 'lg:order-last'
                }`}
              >
                <Image
                  src={prog.image}
                  alt={prog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3.5 left-3.5 bg-white/95 backdrop-blur-xs text-[#1B3B6F] text-xs font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                  <IconComp size={15} className="text-[#0B7347]" />
                  <span>{prog.title}</span>
                </div>
              </div>

              {/* Description Column */}
              <div className="lg:col-span-7 space-y-3.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0B7347]/10 text-[#0B7347] px-3 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                    <IconComp size={13} /> {prog.category}
                  </span>
                  <span className="text-xs font-bold text-gray-400">Pilar {idx + 1}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#1B3B6F] leading-tight">
                  {prog.title}
                </h3>

                <p className="text-xs sm:text-sm font-semibold text-[#0B7347] leading-relaxed italic">
                  &ldquo;{prog.desc}&rdquo;
                </p>

                <p className="text-xs sm:text-sm text-[#4A607A] leading-relaxed font-medium">
                  {prog.longDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-[#F9F4ED] rounded-xl p-3 border border-emerald-50">
                    <div className="flex items-center gap-1.5 text-[#0B7347] font-bold text-[11px] mb-1">
                      <Calendar size={13} /> Tahap Usia
                    </div>
                    <p className="text-xs font-extrabold text-[#1B3B6F]">{prog.age}</p>
                  </div>
                  <div className="bg-[#F9F4ED] rounded-xl p-3 border border-emerald-50">
                    <div className="flex items-center gap-1.5 text-[#0B7347] font-bold text-[11px] mb-1">
                      <Target size={13} /> Target Capaian
                    </div>
                    <p className="text-[11px] font-semibold text-[#1B3B6F] leading-tight">{prog.target}</p>
                  </div>
                  <div className="bg-[#F9F4ED] rounded-xl p-3 border border-emerald-50">
                    <div className="flex items-center gap-1.5 text-[#0B7347] font-bold text-[11px] mb-1">
                      <Award size={13} /> Kegiatan Utama
                    </div>
                    <p className="text-[11px] font-semibold text-[#1B3B6F] leading-tight">{prog.activities}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ─── 9 PROGRAM UNGGULAN ─────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="inline-block bg-[#0B7347]/10 text-[#0B7347] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Pengalaman Belajar Bermakna
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B3B6F] tracking-tight">
            9 Program Unggulan Sekolah
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#4A607A] font-medium">
            Aktivitas tahunan yang dirancang khusus untuk memperkaya wawasan dan keceriaan buah hati.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {FLAGSHIP_PROGRAMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[22px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1B3B6F] group-hover:text-[#0B7347] transition-colors mb-1.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#4A607A] font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── EKSTRAKURIKULER ────────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="bg-[#102A4E] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 text-white shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="inline-block bg-white/15 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              Minat &amp; Bakat
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kegiatan Ekstrakurikuler
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-blue-100/85 font-medium">
              Pilihan aktivitas tambahan setelah jam sekolah untuk mengasah bakat seni, musikal, dan kebugaran anak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {EXTRACURRICULARS.map((ekskul, idx) => {
              const IconComp = ekskul.icon
              return (
                <div
                  key={idx}
                  className="bg-white text-[#1B3B6F] rounded-[20px] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0B7347] flex items-center justify-center">
                        <IconComp size={20} />
                      </div>
                      <span className="text-[9.5px] font-extrabold px-2.5 py-1 rounded-full bg-[#F9F4ED] text-[#1B3B6F] border border-gray-200">
                        {ekskul.schedule}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1B3B6F] leading-snug">
                      {ekskul.title}
                    </h3>
                    <p className="text-xs text-[#4A607A] font-medium leading-relaxed">
                      {ekskul.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#0B7347]">
                    <CheckCircle2 size={13} className="text-[#0B7347]" />
                    <span>{ekskul.target}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── BANNER SPMB & NARAHUBUNG ───────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B7347] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 text-center text-white shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl sm:text-3xl font-black text-white">
              Tertarik dengan Program Belajar Kami?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
              Dapatkan pengalaman bermain dan belajar Islami terbaik bagi buah hati Anda dengan bergabung di KB &amp; TK Istiqamah Bandung.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/ppdb"
                className="bg-white hover:bg-emerald-50 text-[#075E38] font-extrabold text-xs sm:text-sm px-7 py-3 rounded-full shadow-md transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Daftar SPMB Online <ArrowRight size={15} />
              </Link>
              <a
                href="https://wa.me/628112198853?text=Halo%20Admin%20SPMB%20TK%20Istiqamah,%20saya%20ingin%20berkonsultasi%20mengenai%20program%20sekolah."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#102A4E] hover:bg-[#102A4E]/90 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all inline-flex items-center gap-2"
              >
                <MessageCircle size={15} className="text-emerald-400" />
                <span>Konsultasi WhatsApp (0811 2198 853)</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
