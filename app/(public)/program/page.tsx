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
    desc: 'Membimbing kecintaan anak terhadap Al-Qur\'an dan pembiasaan ibadah sejak usia dini.',
    longDesc: 'Program Islamic Learning dirancang untuk menanamkan pondasi akidah dan ibadah praktis anak melalui pendekatan yang menyenangkan. Anak dibimbing melafalkan huruf hijaiyah berharakat menggunakan metode Tilawati berlagu Rost, menghafal surat-surat pendek dalam Juz 30, doa-doa harian, serta simulasi wudhu dan shalat berjamaah.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Hafal 15 surat pendek Juz 30, 10 doa harian, tartil melafalkan Tilawati jilid dasar, dan terbiasa wudhu serta shalat.',
    activities: 'Membaca Tilawati klasikal, setoran hafalan ceria, praktik shalat dhuha berjamaah, dan dongeng kisah teladan Nabi.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (3).png'
  },
  {
    id: 'muslimic-character',
    title: 'Muslimic Character Building',
    category: 'Karakter & Budi Pekerti',
    icon: HeartHandshake,
    desc: 'Menanamkan adab, kesopanan, kejujuran, dan empati sosial dalam keseharian.',
    longDesc: 'Pendidikan karakter Islami berfokus pada pembiasaan sikap baik (akhlakul karimah). Melalui budaya 5S (Senyum, Salam, Sapa, Sopan, Santun), anak diajarkan bertutur kata santun (mengucap tolong, maaf, terima kasih), tertib mengantre, berbagi dengan teman, serta berpartisipasi dalam agenda sosial Jumat Berbagi.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Terbentuknya adab pergaulan islami, empati sosial, kemandirian emosi, dan kejujuran dalam berinteraksi.',
    activities: 'Jumat Berbagi (infaq cilik), bermain peran adab bertamu, lingkaran apresiasi kawan, dan pembiasaan antre tertib.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_44 PM (2).png'
  },
  {
    id: 'life-skill',
    title: 'Life Skill',
    category: 'Kemandirian & Keterampilan Praktis',
    icon: Sparkles,
    desc: 'Melatih kemandirian fungsional sehari-hari dan tanggung jawab pribadi anak.',
    longDesc: 'Kecakapan hidup (life skill) membekali anak dengan kemandirian merawat diri sendiri sesuai tahap usianya. Meliputi toilet training yang tuntas, mencuci tangan pakai sabun, memakai dan melepas sepatu sendiri, makan secara mandiri dengan adab makan Islami, serta merapikan mainan ke tempatnya.',
    age: 'Usia 3 - 6 Tahun',
    target: 'Anak mandiri melakukan toilet training, makan sendiri dengan tertib, serta mampu merapikan barang pribadi.',
    activities: 'Praktik mencuci tangan 6 langkah, mengancing baju dan memakai sepatu, merapikan mainan mandiri, dan cooking class mini.',
    image: '/images/Cover.png'
  },
  {
    id: 'stem-pbl',
    title: 'Project Based Learning / STEM',
    category: 'Sains, Teknologi & Eksplorasi Kreatif',
    icon: Atom,
    desc: 'Merangsang rasa ingin tahu ilmiah, berpikir kritis, dan kreativitas bereksperimen.',
    longDesc: 'Melalui pendekatan Project Based Learning dan STEM (Science, Technology, Engineering, Mathematics), anak-anak diajak mengeksplorasi fenomena alam di sekitar mereka. Mulai dari eksperimen pencampuran warna, mengenali sifat air dan udara, menghitung menggunakan balok sensorik, hingga merawat tanaman di kebun mini sekolah.',
    age: 'Usia 4 - 6 Tahun',
    target: 'Kemampuan berpikir logis dasar, mengenal konsep angka dan pola alam, serta rasa takjub terhadap ciptaan Allah SWT.',
    activities: 'Eksperimen sains seru (gunung meletus mini, terapung-tenggelam), menanam benih sayur, dan proyek seni kriya ramah lingkungan.',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_48 PM (5).png'
  }
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
        <h1 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">Program Unggulan</h1>
        <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto opacity-95 relative z-10 leading-relaxed">
          Kurikulum yang dirancang khusus untuk memenuhi kebutuhan motorik, kognitif, spiritual, dan sosial-emosional anak usia dini dalam balutan nilai-nilai Islami.
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
