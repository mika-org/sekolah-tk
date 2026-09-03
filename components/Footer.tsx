import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#07265F] text-white pt-14 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-white rounded-full p-1">
                <Image src="/images/school_logo.png" alt="Logo" fill className="object-contain p-1" />
              </div>
              <div className="relative h-8 w-40">
                <Image src="/images/Asset 12.png" alt="KB & TK ISTIQAMAH" fill className="object-contain object-left" />
              </div>
            </div>
            <p className="text-xs text-white/75 leading-relaxed">
              Membangun generasi cerdas, mandiri, dan berakhlakul karimah sejak usia dini melalui kurikulum pembelajaran Islami terpadu dan bermain kreatif.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/kbtkistiqamah"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Resmi"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#07A363] flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/TK-Istiqamah-Bandung"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Resmi"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#07A363] flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              <a
                href="https://wa.me/628112198853"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Narahubung"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#07A363] flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Navigasi Sekolah</h4>
            <ul className="space-y-2 text-xs font-semibold text-white/80">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Beranda</Link></li>
              <li><Link href="/tentang-kami" className="hover:text-emerald-400 transition-colors">Tentang Kami</Link></li>
              <li><Link href="/program" className="hover:text-emerald-400 transition-colors">Program Unggulan</Link></li>
              <li><Link href="/aktivitas" className="hover:text-emerald-400 transition-colors">Kegiatan Pembelajaran</Link></li>
              <li><Link href="/galeri" className="hover:text-emerald-400 transition-colors">Galeri Foto</Link></li>
              <li><Link href="/ppdb" className="hover:text-emerald-400 transition-colors">SPMB Online</Link></li>
            </ul>
          </div>

          {/* Col 3: Narahubung & Kontak */}
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">Narahubung &amp; Kontak Resmi</h4>
            <div className="space-y-2.5 text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block font-bold">Narahubung SPMB:</span>
                  <a href="https://wa.me/628112198853" target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-300 font-mono">
                    0811 2198 853 (WhatsApp Admin)
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block font-bold">Telepon Kantor Tata Usaha:</span>
                  <span className="font-mono">022 - 4241799</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <a href="mailto:info@tkistiqamah.sch.id" className="hover:underline">
                  info@tkistiqamah.sch.id
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/60">
          <p>&copy; {new Date().getFullYear()} KB &amp; TK Istiqamah Bandung. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Terakreditasi A (Unggul)</span>
            <span>•</span>
            <Link href="/login" className="text-emerald-400 hover:underline">Portal Akun</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
