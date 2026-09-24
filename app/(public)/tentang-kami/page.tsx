'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  CheckCircle2,
  Award,
  Sparkles,
  Heart,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react'

export default function TentangKamiPage() {
  return (
    <div className="w-full pt-20 sm:pt-24 pb-16">
      {/* ─── HEADER SECTION ─────────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="bg-[#102A4E] rounded-[24px] sm:rounded-[32px] py-10 sm:py-14 px-6 sm:px-10 text-center text-white shadow-xl border border-white/10">
          <span className="inline-block bg-white/15 text-emerald-200 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            Profil &amp; Nilai Sekolah
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-black tracking-tight">
            Tentang KB &amp; TK Istiqamah Bandung
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/85 font-medium max-w-2xl mx-auto leading-relaxed">
            Mengenal lebih dekat lembaga pendidikan anak usia dini yang berdedikasi mendidik dengan kasih sayang, menanamkan adab islami, serta memantik potensi kreatif ananda.
          </p>
        </div>
      </section>

      {/* ─── PROFIL & SEJARAH SINGKAT ──────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* School Image Column */}
          <div className="lg:col-span-5 relative w-full h-[280px] sm:h-[380px] rounded-[22px] overflow-hidden shadow-md border border-emerald-50">
            <Image
              src="/images/Cover.png"
              alt="Gedung KB & TK Istiqamah Bandung"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 450px"
              priority
            />
            {/* Accreditation Badge */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-emerald-100 flex items-center gap-2.5">
              <Award className="text-[#0B7347]" size={24} />
              <div>
                <p className="text-[11px] font-extrabold text-[#1B3B6F] leading-tight">
                  Terakreditasi A
                </p>
                <p className="text-[9.5px] font-semibold text-gray-500">
                  NPSN: 20255241
                </p>
              </div>
            </div>
          </div>

          {/* School Story Column */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0B7347] uppercase tracking-wider bg-[#0B7347]/10 px-3.5 py-1 rounded-full">
              <Compass size={13} /> Fondasi Emas Buah Hati
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1B3B6F] tracking-tight">
              Mendidik Karakter Sejak Dini dengan Cinta &amp; Nilai Islami
            </h2>

            <p className="text-xs sm:text-sm text-[#4A607A] leading-relaxed font-medium">
              KB &amp; TK Istiqamah Bandung berlokasi di kawasan asri Jl. Taman Citarum No. 1, Kota Bandung, bernaung di bawah naungan Yayasan Istiqamah Bandung yang memiliki reputasi panjang dan terpercaya dalam dunia pendidikan Islam.
            </p>

            <p className="text-xs sm:text-sm text-[#4A607A] leading-relaxed font-medium">
              Kami meyakini bahwa usia 2 hingga 6 tahun merupakan masa keemasan (*golden age*) yang sangat berharga. Melalui perpaduan Kurikulum Merdeka PAUD dan kurikulum khas keistiqamahan—seperti metode Al-Qur’an Tilawati berlagu Rost, pembiasaan adab ibadah, serta kegiatan bermain kreatif terarah—anak-anak didorong untuk tumbuh menjadi pribadi yang bertauhid kokoh, mandiri, cerdas, dan berakhlakul karimah.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#F9F4ED] rounded-xl p-3 border border-emerald-50">
                <p className="text-lg sm:text-xl font-black text-[#0B7347]">A</p>
                <p className="text-[11px] font-bold text-[#1B3B6F]">Akreditasi Unggul</p>
              </div>
              <div className="bg-[#F9F4ED] rounded-xl p-3 border border-emerald-50">
                <p className="text-lg sm:text-xl font-black text-[#0B7347]">1 : 8</p>
                <p className="text-[11px] font-bold text-[#1B3B6F]">Rasio Guru &amp; Murid</p>
              </div>
              <div className="bg-[#F9F4ED] rounded-xl p-3 border border-emerald-50 col-span-2 sm:col-span-1">
                <p className="text-lg sm:text-xl font-black text-[#0B7347]">100%</p>
                <p className="text-[11px] font-bold text-[#1B3B6F]">Guru PAUD Berdedikasi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VISI & MISI SECTION ─────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Visi Card */}
          <div className="lg:col-span-5 bg-[#0B7347] text-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 shadow-md flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-100 mb-4">
                <Star size={13} fill="currentColor" /> Visi Utama
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-4">
                Visi KB &amp; TK Istiqamah
              </h3>
              <blockquote className="text-sm sm:text-base font-semibold text-emerald-50 leading-relaxed italic bg-white/10 p-5 rounded-2xl border border-white/10">
                &ldquo;Menjadi lembaga pendidikan anak usia dini Islami yang unggul dalam membentuk generasi bertauhid, berakhlak mulia, cerdas, kreatif, dan mandiri.&rdquo;
              </blockquote>
            </div>

            <div className="pt-6 border-t border-white/20 mt-6 text-xs text-emerald-100/80 font-medium">
              Landasan kokoh mendampingi tumbuh kembang anak secara holistik dan seimbang.
            </div>
          </div>

          {/* Misi Card */}
          <div className="lg:col-span-7 bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0B7347]/10 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#0B7347] mb-4">
                <ShieldCheck size={14} /> Komitmen Nyata
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1B3B6F] mb-5">
                Misi Pembelajaran Kami
              </h3>

              <div className="space-y-3.5">
                {[
                  {
                    title: 'Penanaman Nilai-Nilai Islami',
                    desc: 'Membiasakan ibadah harian, adab sopan santun, hafalan surat-surat pendek, dan kecintaan membaca Al-Qur’an metode Tilawati sejak dini.'
                  },
                  {
                    title: 'Pembelajaran Aktif & Bermain Kreatif',
                    desc: 'Menyelenggarakan kegiatan bermain yang bermakna dan eksploratif untuk merangsang daya cipta serta rasa ingin tahu anak.'
                  },
                  {
                    title: 'Pengembangan Potensi Multitalenta',
                    desc: 'Menghargai keunikan tiap anak melalui pengenalan ragam minat, kecerdasan majemuk (multiple intelligence), serta kemandirian emosional.'
                  },
                  {
                    title: 'Sinergi Harmonis dengan Orang Tua',
                    desc: 'Membangun komunikasi aktif dan kolaborasi erat bersama orang tua demi keselarasan pola asuh di sekolah dan di rumah.'
                  }
                ].map((misi, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-[#F9F4ED]/60 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-[#0B7347]/15 text-[#0B7347] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-[#1B3B6F]">
                        {misi.title}
                      </h4>
                      <p className="text-[11.5px] sm:text-xs text-[#4A607A] leading-relaxed mt-0.5 font-medium">
                        {misi.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3 PILAR KEUNGGULAN (Clean Modern Cards) ─── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="inline-block bg-[#0B7347]/10 text-[#0B7347] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Keunggulan Utama
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1B3B6F] tracking-tight">
            Mengapa Memilih KB &amp; TK Istiqamah?
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#4A607A] font-medium">
            Tiga pilar utama yang menjadi nafas dalam setiap proses pendidikan buah hati Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {[
            {
              icon: Sparkles,
              title: 'Bermain Kreatif',
              subtitle: 'Active & Fun Learning',
              desc: 'Anak belajar dengan gembira melalui eksplorasi sains cilik, proyek seni, dan permainan motorik yang mengasah daya imajinasi serta pemecahan masalah.'
            },
            {
              icon: Heart,
              title: 'Berakhlak Sejak Dini',
              subtitle: 'Karakter SMART & Adab',
              desc: 'Pembiasaan bersikap santun, mandiri, peduli kawan, dan adab islami dalam keseharian yang dihidupkan lewat keteladanan para guru penyayang.'
            },
            {
              icon: BookOpen,
              title: 'Kurikulum Islami Terarah',
              subtitle: 'Tilawati & Praktik Ibadah',
              desc: 'Pembelajaran Al-Qur’an metode Tilawati berlagu Rost yang bertahap, dongeng teladan Nabi, dan pengenalan doa-doa harian sesuai tahapan usia anak.'
            }
          ].map((card, i) => {
            const IconComponent = card.icon
            return (
              <div
                key={i}
                className="bg-white rounded-[24px] p-6 sm:p-7 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0B7347] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <IconComponent size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-[#0B7347] tracking-wider uppercase">
                    {card.subtitle}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#1B3B6F] mt-1 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A607A] font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── SEKILAS FASILITAS UNGGULAN ─────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="bg-[#102A4E] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Lingkungan Ramah Anak
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white mt-1">
                Fasilitas Belajar &amp; Bermain
              </h2>
            </div>
            <Link
              href="/program"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full transition-all w-fit"
            >
              Lihat Program Belajar <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { src: '/images/fasilitas/1.webp', title: 'Ruang Belajar Tematik' },
              { src: '/images/fasilitas/6.webp', title: 'Ruang Bermain Indoor' },
              { src: '/images/fasilitas/7.webp', title: 'Perpustakaan & Pojok Baca' },
              { src: '/images/fasilitas/4.webp', title: 'Playground Semi-Outdoor' }
            ].map((f, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/15 group"
              >
                <Image
                  src={f.src}
                  alt={f.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                  <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                    {f.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNER AJAKAN KONSULTASI / PPDB ─────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B7347] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 text-center text-white shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl sm:text-3xl font-black text-white">
              Mari Menjadi Bagian dari Keluarga Besar Istiqamah
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
              Daftarkan putra-putri tercinta atau jadwalkan kunjungan sekolah (*school tour*) untuk melihat langsung lingkungan belajar kami di Jl. Taman Citarum Bandung.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/ppdb"
                className="bg-white hover:bg-emerald-50 text-[#075E38] font-extrabold text-xs sm:text-sm px-7 py-3 rounded-full shadow-md transition-all inline-flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Pendaftaran PPDB Online <ArrowRight size={15} />
              </Link>
              <Link
                href="/kontak"
                className="bg-[#102A4E] hover:bg-[#102A4E]/90 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-full shadow-md transition-all inline-flex items-center gap-2"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
