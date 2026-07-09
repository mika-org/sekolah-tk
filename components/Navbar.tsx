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
  { name: 'Aktivitas', href: '/aktivitas' },
  { name: 'Galeri', href: '/galeri' },
  { name: 'Kontak', href: '/kontak' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-gray-100'
        : 'bg-[#F8F6F2]/60 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-11 h-11">
              <Image src="/images/school_logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="relative h-9 w-44">
              <Image src="/images/Asset 12.png" alt="KB & TK ISTIQAMAH" fill className="object-contain object-left" />
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-bold text-sm cursor-pointer relative py-1 transition-colors ${
                    active ? 'text-[#07A363]' : 'text-[#07265F] hover:text-[#07A363]'
                  }`}
                >
                  {item.name}
                  {active && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#07A363] rounded-full" />}
                </Link>
              )
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="font-bold text-sm text-[#07265F] hover:text-[#07A363] transition-colors">
              Portal Akun
            </Link>
            <Link href="/ppdb" className="bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs tracking-wider uppercase px-7 py-3.5 rounded-full transition-all shadow-md">
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#07265F] hover:text-[#07A363] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl py-4 px-6 space-y-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block w-full text-left py-2 font-bold transition-colors ${
                  active ? 'text-[#07A363]' : 'text-[#07265F] hover:text-[#07A363]'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full text-center py-2.5 font-bold text-sm text-[#07265F] border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Portal Akun
            </Link>
            <Link
              href="/ppdb"
              className="w-full text-center py-3 bg-[#07A363] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-[#07A363]/90"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
