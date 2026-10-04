'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  X,
  MessageCircle,
  MapPin,
  Building,
  Heart,
  Smile,
  Compass
} from 'lucide-react'
import { FACILITIES, FacilityItem } from '@/lib/facilities'

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Semua Fasilitas' },
  { key: 'kelas', label: 'Ruang Belajar' },
  { key: 'bermain', label: 'Bermain & Motorik' },
  { key: 'literasi', label: 'Literasi & Multimedia' },
  { key: 'ibadah', label: 'Ibadah & Karakter' },
  { key: 'lingkungan', label: 'Lingkungan & Outdoor' },
]

export default function FasilitasPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null)

  const filteredFacilities = activeCategory === 'all'
    ? FACILITIES
    : FACILITIES.filter((item) => item.category === activeCategory)

  return (
    <div className="w-full pt-20 sm:pt-24 pb-16">
      {/* ─── HEADER HERO SECTION ──────────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="bg-[#102A4E] rounded-[24px] sm:rounded-[32px] py-10 sm:py-14 px-6 sm:px-10 text-center text-white shadow-xl border border-white/10 relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 bg-white/15 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase mb-3 backdrop-blur-sm">
            <Sparkles size={14} className="text-emerald-300" />
            Sarana &amp; Prasarana Unggulan
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight leading-tight">
            Fasilitas KB &amp; TK Istiqamah
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-blue-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
            Menyediakan ruang nyaman, bersih, higienis, dan berstandar keamanan tinggi untuk mendukung eksplorasi belajar ceria dan stimulasi tumbuh kembang optimal ananda.
          </p>
        </div>
      </section>

      {/* ─── HIGHLIGHT KEY METRICS BANNER ─────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0B7347] shrink-0">
              <Building size={22} />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#1B3B6F]">9+</span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Fasilitas Lengkap</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0B7347] shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#1B3B6F]">100%</span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Aman &amp; Ramah Anak</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0B7347] shrink-0">
              <Smile size={22} />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#1B3B6F]">Ber-AC</span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Sejuk &amp; Higienis</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#0B7347] shrink-0">
              <Heart size={22} />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-[#1B3B6F]">Asri</span>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-500">Kawasan Sejuk Bandung</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY FILTER BUTTONS ──────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_FILTERS.map((cat) => {
            const active = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0B7347] text-white shadow-md shadow-[#0B7347]/20 scale-105'
                    : 'bg-white text-[#4A607A] hover:bg-gray-100 hover:text-[#1B3B6F] border border-gray-200/80'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* ─── FACILITIES GRID ──────────────────────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 sm:mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredFacilities.map((facility, index) => (
            <div
              key={facility.id}
              className="bg-white rounded-[26px] overflow-hidden border border-gray-150 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col group"
            >
              {/* Image Preview with Zoom Action */}
              <div
                className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setSelectedFacility(facility)}
              >
                <Image
                  src={facility.image}
                  alt={facility.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

                {/* Badge Category & Number */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-[#102A4E]/90 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {facility.categoryLabel}
                  </span>
                  {facility.badge && (
                    <span className="bg-[#F5B744] text-[#1B3B6F] text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                      {facility.badge}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  aria-label={`Perbesar foto ${facility.title}`}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1B3B6F] flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFacility(facility)
                  }}
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Facility Details */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-[#1B3B6F] leading-tight group-hover:text-[#0B7347] transition-colors">
                    {facility.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#4A607A] leading-relaxed font-medium">
                    {facility.desc}
                  </p>

                  {/* Feature Checkmarks */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                    {facility.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 font-semibold">
                        <CheckCircle2 size={13} className="text-[#0B7347] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFacility(facility)}
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-[#0B7347] text-[#0B7347] hover:text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Lihat Detail &amp; Foto Lengkap</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SCHOOL TOUR & VISITATION BANNER ──────────── */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 sm:mb-16">
        <div className="bg-gradient-to-br from-[#102A4E] to-[#1B3B6F] rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 lg:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                <Compass size={14} /> Kunjungan Langsung (School Tour)
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                Ayah &amp; Bunda Ingin Melihat Langsung Fasilitas Kami?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium max-w-2xl">
                Kami sangat senang menyambut kehadiran Ayah &amp; Bunda bersama ananda untuk merasakan langsung suasana kelas, area bermain, serta berdiskusi santai dengan kepala sekolah dan dewan guru kami.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} /> Jl. Taman Citarum, Kec. Bandung Wetan, Bandung
                </span>
                <span>•</span>
                <span>Senin - Jumat: 08.00 - 14.00 WIB</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href="https://wa.me/628112198853?text=Halo%20Admin%20KB-TK%20Istiqamah,%20saya%20ingin%20jadwal%20kunjungan%20school%20tour%20melihat%20fasilitas%20sekolah."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 text-center"
              >
                <MessageCircle size={18} />
                Jadwalkan Kunjungan (WA)
              </a>
              <Link
                href="/ppdb"
                className="bg-[#F5B744] hover:bg-[#F59E0B] text-[#16325C] font-black text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-center"
              >
                Daftar PPDB Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIGHTBOX MODAL DETAIL PREVIEW ────────────── */}
      {selectedFacility && (
        <div
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedFacility(null)}
        >
          <div
            className="bg-white rounded-[28px] max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="relative aspect-[16/10] w-full bg-black">
              <Image
                src={selectedFacility.image}
                alt={selectedFacility.title}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                aria-label="Tutup pratinjau"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#0B7347] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedFacility.categoryLabel}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-7 space-y-4 max-h-[50vh] overflow-y-auto">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#1B3B6F]">
                  {selectedFacility.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#4A607A] leading-relaxed font-medium">
                  {selectedFacility.fullDesc}
                </p>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                  Keunggulan &amp; Spesifikasi Fasilitas:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedFacility.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <CheckCircle2 size={14} className="text-[#0B7347] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <a
                  href={`https://wa.me/628112198853?text=Halo%20Admin%20KB-TK%20Istiqamah,%20saya%20tertarik%20dengan%20fasilitas%20${encodeURIComponent(selectedFacility.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B7347] hover:underline"
                >
                  <MessageCircle size={15} />
                  Tanyakan fasilitas ini ke admin
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedFacility(null)}
                  className="bg-[#102A4E] hover:bg-[#102A4E]/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
