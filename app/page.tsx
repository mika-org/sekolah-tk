'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Star,
  Users,
  Menu,
  X
} from 'lucide-react'

// Programs list with corresponding circular illustration assets
const PROGRAMS = [
  {
    title: 'Lorem Ipsum',
    desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
    image: '/images/Cover.png'
  },
  {
    title: 'Lorem Ipsum',
    desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_44 PM (2).png'
  },
  {
    title: 'Lorem Ipsum',
    desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (3).png'
  },
  {
    title: 'Lorem Ipsum',
    desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_46 PM (4).png'
  },
  {
    title: 'Lorem Ipsum',
    desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
    image: '/images/ChatGPT Image Jun 17, 2026, 10_17_48 PM (5).png'
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] font-sans antialiased text-[#07265F] overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2 border-b border-gray-100' 
          : 'bg-[#F8F6F2]/50 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('beranda')}>
              <div className="relative w-11 h-11">
                <Image
                  src="/images/school_logo.png"
                  alt="KB & TK Istiqamah Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative h-8 w-44">
                <Image
                  src="/images/Asset 12.png"
                  alt="KB & TK ISTIQAMAH"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </div>

            {/* Centered Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {['Beranda', 'Tentang Kami', 'Program', 'Aktivitas', 'Galeri', 'Kontak'].map((item) => {
                const isActive = item === 'Beranda'
                return (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                    className={`font-bold transition-all text-sm cursor-pointer relative py-1 ${
                      isActive 
                        ? 'text-[#07A363]' 
                        : 'text-[#07265F] hover:text-[#07A363]'
                    }`}
                  >
                    {item}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#07A363] rounded-full" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Desktop Call to Action */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/login" className="font-bold text-sm text-[#07265F] hover:text-[#07A363] mr-4 transition-colors">
                Portal Akun
              </Link>
              <Link
                href="/ppdb"
                className="bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs tracking-wider uppercase px-7 py-3.5 rounded-full transition-all shadow-md shadow-[#07A363]/10"
              >
                Daftar Sekarang
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="text-[#07265F] hover:text-[#07A363] transition-colors focus:outline-none cursor-pointer"
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl py-4 px-6 space-y-3">
            {['Beranda', 'Tentang Kami', 'Program', 'Aktivitas', 'Galeri', 'Kontak'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                className="block w-full text-left py-2 font-bold text-[#07265F] hover:text-[#07A363] transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link href="/login" className="w-full text-center py-2.5 font-bold text-sm text-[#07265F] border border-gray-200 rounded-xl hover:bg-gray-50">
                Portal Akun
              </Link>
              <Link href="/ppdb" className="w-full text-center py-3 bg-[#07A363] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl">
                Daftar Sekarang
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section id="beranda" className="relative pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#F8F6F2]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-[46px] lg:text-[54px] font-black leading-[1.12]">
                <span className="text-[#07A363]">Lorem Ipsum</span> <br />
                <span className="text-[#07265F]">Dolor Sit Amet Sed</span> <br />
                <span className="text-[#07A363]">Adipiscing Elit</span>
              </h1>
              
              <p className="text-[#07265F]/80 text-sm sm:text-base font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => scrollToSection('program')}
                  className="px-8 py-3.5 bg-[#07A363] hover:bg-[#07A363]/90 text-white font-extrabold text-xs tracking-wider uppercase rounded-full transition-all cursor-pointer shadow-md shadow-[#07A363]/10"
                >
                  Lihat Program
                </button>
                <button
                  onClick={() => scrollToSection('kontak')}
                  className="px-8 py-3.5 bg-[#07265F] hover:bg-[#07265F]/90 text-white font-extrabold text-xs tracking-wider uppercase rounded-full transition-all cursor-pointer shadow-md shadow-[#07265F]/10"
                >
                  Lorem Ipsum
                </button>
              </div>
            </div>

            {/* Hero Right Content (Kids + Curved dashed path decoration) */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end mt-10 lg:mt-0">
              <div className="relative w-full max-w-[420px] aspect-[420/340]">
                {/* Dashed curve behind kids */}
                <div className="absolute -left-12 top-10 w-[420px] h-[150px] pointer-events-none opacity-90 z-0">
                  <Image
                    src="/images/Asset 11.png"
                    alt="Curve Decoration"
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Floating Star */}
                <div className="absolute -right-4 top-1/3 w-6 h-6 text-amber-400 fill-amber-400">
                  <Star fill="currentColor" size={24} />
                </div>
                
                {/* Kids Image */}
                <div className="relative w-full h-full z-10">
                  <Image
                    src="/images/hero_kids.png"
                    alt="KB & TK Istiqamah Pupils"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION (uses Asset 3.png background for organic wave curves) */}
      <section 
        id="tentang-kami" 
        className="relative pt-32 pb-24 bg-no-repeat bg-cover bg-top -mt-20 z-20 min-h-[500px]"
        style={{ backgroundImage: "url('/images/Asset 3.png')" }}
      >
        {/* Floating clouds to match mock details */}
        <div className="absolute left-[5%] top-[10%] w-20 h-12 pointer-events-none opacity-80">
          <Image src="/images/Asset 13.png" alt="Cloud" fill className="object-contain" />
        </div>
        <div className="absolute right-[5%] top-[25%] w-20 h-12 pointer-events-none opacity-80">
          <Image src="/images/Asset 14.png" alt="Cloud" fill className="object-contain" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          
          {/* Header Title with Floating Star */}
          <div className="text-center max-w-xl mx-auto mb-16 relative">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">
              Mengapa Memilih Istiqamah
            </h2>
            <div className="absolute -top-6 right-[15%] w-5 h-5 text-amber-400 fill-amber-400">
              <Star fill="currentColor" size={20} />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-[28px] shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 relative flex items-center justify-center">
                <Image src="/images/Asset 6.png" alt="Tower Icon" fill className="object-contain" />
              </div>
              <p className="text-sm font-semibold text-[#07265F]/85 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-[28px] shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 relative flex items-center justify-center">
                <Image src="/images/Asset 5.png" alt="Rocket Icon" fill className="object-contain" />
              </div>
              <p className="text-sm font-semibold text-[#07265F]/85 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-[28px] shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 relative flex items-center justify-center">
                <Image src="/images/Asset 4.png" alt="ABC Icon" fill className="object-contain" />
              </div>
              <p className="text-sm font-semibold text-[#07265F]/85 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* EXCELLENT PROGRAMS SECTION */}
      <section id="program" className="py-20 bg-[#F8F6F2]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-24">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">
              Program Unggulan Kami
            </h2>
          </div>

          {/* Cards Row - 5 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-6">
            {PROGRAMS.map((prog, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[28px] shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col text-center p-6 pt-12 relative mt-12 group"
              >
                {/* Circular image overlapping card top border */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-[#07A363] overflow-hidden bg-white shadow-md">
                  <div className="relative w-full h-full">
                    <Image
                      src={prog.image}
                      alt={prog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="flex flex-col flex-grow space-y-3">
                  <h3 className="font-extrabold text-[#07265F] text-base group-hover:text-[#07A363] transition-colors">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-[#07265F]/75 font-semibold leading-relaxed">
                    {prog.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* GALLERY SECTION (Solid green container with custom wave boundaries) */}
      <section id="galeri" className="relative bg-[#07A363] z-10">
        
        {/* Top Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -translate-y-[98%] pointer-events-none fill-[#07A363]">
          <svg viewBox="0 0 1440 100" className="relative block w-full h-12 sm:h-20">
            <path d="M0,50 C320,100 640,0 960,50 C1280,100 1440,50 1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 relative z-10">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Galeri Kami
            </h2>
          </div>

          {/* Gallery Pictures Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Gallery Image 1 */}
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-white/20 shadow-md">
              <Image
                src="/images/gallery_1.png"
                alt="Galeri 1"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Gallery Image 2 */}
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-white/20 shadow-md">
              <Image
                src="/images/gallery_2.png"
                alt="Galeri 2"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Gallery Image 3 */}
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-white/20 shadow-md">
              <Image
                src="/images/gallery_3.png"
                alt="Galeri 3"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Gallery Image 4 */}
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-white/20 shadow-md">
              <Image
                src="/images/gallery_4.png"
                alt="Galeri 4"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
          </div>

        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none translate-y-[98%] pointer-events-none fill-[#07A363]">
          <svg viewBox="0 0 1440 100" className="relative block w-full h-12 sm:h-20">
            <path d="M0,50 C320,100 640,0 960,50 C1280,100 1440,50 1440,50 L1440,100 L0,100 Z" />
          </svg>
        </div>

      </section>

      {/* PARENTS TESTIMONIALS SECTION */}
      <section id="aktivitas" className="pt-32 pb-20 bg-[#F8F6F2]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-[#07265F]">
              Testimoni Orang Tua
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left side: Testimonial Card */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-[28px] p-8 sm:p-10 shadow-sm border border-gray-100 space-y-6 relative">
                
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Round Avatar */}
                  <div className="w-20 h-20 rounded-full border-4 border-[#07A363] overflow-hidden flex-shrink-0 relative">
                    <Image
                      src="/images/parent_agus.png"
                      alt="Pa Agus Botak"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-[#07265F]/80 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
                    </p>
                    <div>
                      <h4 className="font-extrabold text-[#07265F] text-base">Pa Agus Botak</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-0.5">Orang Tua Siswa</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dot Indicators */}
              <div className="flex space-x-2 pl-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#07A363]" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              </div>
            </div>

            {/* Right side: Standing Boy & Green Blob Backdrop */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end min-h-[360px]">
              <div className="relative w-[340px] h-[360px]">
                {/* Green Blob */}
                <div className="absolute left-0 top-6 w-[280px] h-[240px] pointer-events-none">
                  <Image
                    src="/images/Asset 10.png"
                    alt="Backdrop Shape"
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Standing Boy holding brush */}
                <div className="absolute right-0 top-0 w-[200px] h-[350px] z-10">
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

        </div>
      </section>

      {/* CONTACT INFO SECTION */}
      <section id="kontak" className="pb-24 pt-10 bg-[#F8F6F2]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Green Information Card (Left) */}
            <div className="lg:col-span-7 bg-[#07A363] text-white rounded-[32px] p-8 sm:p-10 shadow-lg flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-black">Hubungi Kami</h3>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex items-start space-x-4">
                  <MapPin size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs uppercase text-white/70">Alamat</h4>
                    <p className="text-sm font-semibold mt-0.5">Jl. Taman Citarum, Kec. Bandung Wetan, Kota Bandung</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs uppercase text-white/70">Telepon / HP</h4>
                    <p className="text-sm font-semibold mt-0.5">022 - 4241799 / 0811 2198 853</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail size={20} className="mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs uppercase text-white/70">Email</h4>
                    <p className="text-sm font-semibold mt-0.5">info@tkistiqamah.sch.id</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-white/70">Instagram</h4>
                    <p className="text-sm font-semibold mt-0.5">@kbtkistiqamah</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8H7v3h2v9h3v-9h2.72l.4-3H12V6.5a1 1 0 011-1h1.5V2H12a4 4 0 00-4 4v2H7v3h1v9h3v-9H9v-3z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-white/70">Facebook</h4>
                    <p className="text-sm font-semibold mt-0.5">TK Istiqamah Bandung</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <Link
                  href="/ppdb"
                  className="inline-flex items-center text-xs font-bold text-white hover:text-amber-300 transition-colors uppercase tracking-wider gap-1"
                >
                  Pendaftaran Online <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Quick Contact Form & Maps placeholder (Right) */}
            <div className="lg:col-span-5 bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-gray-150 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold text-base text-[#07265F]">Kirim Pesan Cepat</h4>
                <p className="text-xs text-[#07265F]/75 font-semibold">Tinggalkan nama dan pesan Anda, Admin kami akan merespons sesegera mungkin.</p>
              </div>

              <form className="space-y-4 mt-6">
                <div>
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    className="w-full bg-[#F8F6F2] border-transparent rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07A363]/25 transition-all text-[#07265F]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Alamat Email"
                    className="w-full bg-[#F8F6F2] border-transparent rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07A363]/25 transition-all text-[#07265F]"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    placeholder="Isi pesan / pertanyaan..."
                    className="w-full bg-[#F8F6F2] border-transparent rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07A363]/25 transition-all text-[#07265F] resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => alert('Pesan Anda terkirim secara simulasi. Admin kami akan segera menghubungi Anda!')}
                  className="w-full py-3 bg-[#07265F] hover:bg-[#07265F]/95 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-[#07265F]/15"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#07265F] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <p className="text-xs font-bold text-white/70 tracking-wide">
            &copy; 2026 KB & TK Istiqamah. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

    </div>
  )
}
