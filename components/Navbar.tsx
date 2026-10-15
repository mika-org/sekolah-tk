'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { name: 'Beranda', href: '/#' },
  { name: 'Tentang Kami', href: '/#tentang-kami' },
  { name: 'Program', href: '/#program' },
  { name: 'Fasilitas', href: '/#fasilitas' },
  { name: 'Galeri', href: '/#galeri' },
  { name: 'Kontak', href: '/#kontak' },
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && pathname === '/') {
      const id = href.replace('/#', '')
      if (!id) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const el = document.getElementById(id)
        if (el) {
          e.preventDefault()
          el.scrollIntoView({ behavior: 'smooth' })
          window.history.pushState(null, '', href)
        }
      }
    }
    setMobileMenuOpen(false)
  }

  const handleMobileNavClick = (e?: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (e && href) {
      handleNavClick(e, href)
    }
    setTimeout(() => {
      setMobileMenuOpen(false)
    }, 120)
  }

  return (
    <>
      {/* Mobile backdrop for easy tap-away dismissal */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-2 sm:top-3.5 left-0 w-full z-[100] px-2.5 sm:px-6 pointer-events-none transition-all duration-300">
        <div className="w-full max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-center pointer-events-auto">
          
          {/* Floating Pill Container */}
          <nav
            className={`transition-all duration-300 pointer-events-auto flex items-center rounded-full border border-white/80 ${
              scrolled
                ? 'w-full max-w-5xl xl:max-w-6xl bg-white/98 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] py-1.5 sm:py-2 px-3.5 sm:px-6 lg:px-8 justify-between'
                : 'w-full md:w-auto md:max-w-fit bg-white/92 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] py-1.5 px-3 sm:px-4 md:px-5 justify-between md:justify-center md:gap-3 lg:gap-5'
            }`}
          >
            {/* Logo (shown on scroll) */}
            {scrolled && (
              <Link
                href="/"
                className="hidden md:flex items-center gap-2 lg:gap-2.5 transition-all duration-300 flex-shrink-0 mr-2 lg:mr-4 outline-none focus:outline-none"
              >
                <div className="relative w-8 h-8 sm:w-8.5 sm:h-8.5 flex-shrink-0">
                  <Image src="/images/hero_gsap/logo.png" alt="Logo KB & TK Istiqamah" fill className="object-contain" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-xs sm:text-sm text-[#16325C] tracking-tight leading-tight hidden lg:inline whitespace-nowrap">
                    KB &amp; TK Istiqamah
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold tracking-wider hidden lg:inline whitespace-nowrap">
                    NPSN: 20255241
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Nav Items */}
            <div
              className={`hidden md:flex items-center ${
                scrolled
                  ? 'gap-2 lg:gap-4 xl:gap-6 flex-1 justify-center'
                  : 'gap-1 lg:gap-2.5 xl:gap-3.5 justify-center'
              }`}
            >
              {NAV_ITEMS.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="text-xs lg:text-[13px] font-semibold transition-all py-1 px-2.5 lg:px-3 rounded-full whitespace-nowrap outline-none focus:outline-none text-[#1B3B6F] hover:text-[#07A363] hover:bg-gray-100/60"
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Right Action Button: Amber Yellow 'Daftar Sekarang' */}
            <div className="hidden md:flex items-center flex-shrink-0 ml-1 lg:ml-2 pointer-events-auto">
              <Link
                href="/ppdb"
                className={`relative z-10 pointer-events-auto cursor-pointer bg-[#F5B744] hover:bg-[#F59E0B] text-white font-bold rounded-full shadow-xs hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-95 whitespace-nowrap outline-none focus:outline-none ${
                  scrolled
                    ? 'text-xs lg:text-sm px-4 lg:px-5 py-1.5 sm:py-2'
                    : 'text-xs px-3.5 lg:px-4 py-1.5'
                }`}
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

              <div className="flex items-center gap-1.5 flex-shrink-0 pointer-events-auto">
                <Link
                  href="/ppdb"
                  className="relative z-10 pointer-events-auto cursor-pointer bg-[#F5B744] hover:bg-[#F59E0B] text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm whitespace-nowrap transition-transform active:scale-95"
                >
                  Daftar Sekarang
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl p-2 text-[#16325C] hover:text-[#07A363] hover:bg-gray-100/70 active:bg-gray-200/80 transition-colors cursor-pointer touch-manipulation"
                  aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                >
                  {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto max-w-sm mx-auto mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 space-y-2 transition-all">
            {NAV_ITEMS.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleMobileNavClick(e, item.href)}
                  className="block py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all touch-manipulation cursor-pointer text-[#16325C] hover:bg-gray-50"
                >
                  {item.name}
                </Link>
              )
            })}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={handleMobileNavClick}
                className="w-full text-center py-2 font-bold text-xs text-[#16325C] border border-gray-200 rounded-full hover:bg-gray-50 touch-manipulation cursor-pointer"
              >
                Portal Akun
              </Link>
              <Link
                href="/ppdb"
                onClick={handleMobileNavClick}
                className="w-full text-center py-2.5 bg-[#F5B744] hover:bg-[#F59E0B] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-sm touch-manipulation cursor-pointer"
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

