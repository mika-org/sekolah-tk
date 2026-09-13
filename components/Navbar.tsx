'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { name: 'Beranda', href: '/' },
  { name: 'Tentang Kami', href: '/tentang-kami' },
  { name: 'Program', href: '/program' },
  { name: 'Galeri', href: '/galeri' },
  { name: 'Kontak', href: '/kontak' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className="fixed top-2.5 sm:top-5 left-0 w-full z-[100] px-2.5 sm:px-6 pointer-events-none transition-all duration-300">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center pointer-events-auto">
        
        {/* Floating Pill Container */}
        <nav
          className={`w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-white/80 py-2 sm:py-2.5 px-3.5 sm:px-8 flex items-center justify-between transition-all duration-300 pointer-events-auto ${
            scrolled ? 'shadow-[0_8px_30px_rgba(0,0,0,0.12)] bg-white/98 py-2' : ''
          }`}
        >
          {/* Logo (shown on non-home pages, or when scrolled on home) */}
          {(!isHome || scrolled) && (
            <Link
              href="/"
              className="hidden md:flex items-center gap-2.5 transition-all duration-300 flex-shrink-0 mr-4"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                <Image src="/images/hero_gsap/logo.png" alt="Logo KB & TK Istiqamah" fill className="object-contain" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-xs sm:text-sm text-[#16325C] tracking-tight leading-tight hidden lg:inline">
                  KB &amp; TK Istiqamah
                </span>
                <span className="text-[10px] text-gray-500 font-semibold tracking-wider hidden lg:inline">
                  NPSN: 20255241
                </span>
              </div>
            </Link>
          )}

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-7 lg:gap-9">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href && !isHome
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs sm:text-sm font-semibold transition-colors py-1 ${
                    active
                      ? 'text-[#07A363] font-bold'
                      : 'text-[#1B3B6F] hover:text-[#07A363]'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Right Action Button: Amber Yellow 'Daftar Sekarang' */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-auto pointer-events-auto">
            <Link
              href="/ppdb"
              className="relative z-10 pointer-events-auto cursor-pointer bg-[#F5B744] hover:bg-[#F59E0B] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile Bar: Logo on left, CTA + Hamburger on right */}
          <div className="flex md:hidden items-center justify-between w-full gap-2">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image src="/images/hero_gsap/logo.png" alt="Logo KB & TK Istiqamah" fill className="object-contain" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-black text-xs text-[#16325C] truncate leading-tight">KB &amp; TK Istiqamah</span>
                <span className="text-[9px] text-gray-500 font-semibold truncate">NPSN: 20255241</span>
              </div>
            </Link>

            <div className="flex items-center gap-2 flex-shrink-0 pointer-events-auto">
              <Link
                href="/ppdb"
                className="relative z-10 pointer-events-auto cursor-pointer bg-[#F5B744] hover:bg-[#F59E0B] text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap transition-transform active:scale-95"
              >
                Daftar Sekarang
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-[#16325C] hover:text-[#07A363] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto max-w-sm mx-auto mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 space-y-2 transition-all">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? 'bg-[#07A363]/10 text-[#07A363]'
                    : 'text-[#16325C] hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full text-center py-2 font-bold text-xs text-[#16325C] border border-gray-200 rounded-full hover:bg-gray-50"
            >
              Portal Akun
            </Link>
            <Link
              href="/ppdb"
              className="w-full text-center py-2.5 bg-[#F5B744] hover:bg-[#F59E0B] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-sm"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

