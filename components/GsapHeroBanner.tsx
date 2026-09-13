'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

export default function GsapHeroBanner() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sunRef = useRef<HTMLDivElement>(null)
  const cloud1Ref = useRef<HTMLDivElement>(null)
  const cloud2Ref = useRef<HTMLDivElement>(null)
  const backHillRef = useRef<HTMLDivElement>(null)
  const mainHillRef = useRef<HTMLDivElement>(null)
  const leftTreeRef = useRef<HTMLDivElement>(null)
  const rightTreeRef = useRef<HTMLDivElement>(null)
  const leftPlayRef = useRef<HTMLDivElement>(null)
  const swingRef = useRef<HTMLDivElement>(null)
  const rightTowerRef = useRef<HTMLDivElement>(null)
  const kidsRef = useRef<HTMLDivElement>(null)
  const bushesRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const title1Ref = useRef<HTMLSpanElement>(null)
  const title2Ref = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const btnsRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  const [logoSrc, setLogoSrc] = useState('/images/hero_gsap_v2/logo.png')

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      if (sunRef.current) tl.from(sunRef.current, { scale: 0, opacity: 0, rotation: -180, y: -40, x: 40, duration: 1.4, ease: 'back.out(1.6)' }, 0.05)
      if (cloud1Ref.current) tl.from(cloud1Ref.current, { opacity: 0, y: -25, x: -20, duration: 1.1 }, 0.2)
      if (cloud2Ref.current) tl.from(cloud2Ref.current, { opacity: 0, y: -20, x: 25, duration: 1.2 }, 0.25)
      if (backHillRef.current) tl.from(backHillRef.current, { y: 70, opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.1)
      if (mainHillRef.current) tl.from(mainHillRef.current, { y: 90, opacity: 0, duration: 1.0, ease: 'power2.out' }, 0.15)
      if (leftTreeRef.current) tl.from(leftTreeRef.current, { x: -110, opacity: 0, duration: 1.0 }, 0.25)
      if (rightTreeRef.current) tl.from(rightTreeRef.current, { x: 110, opacity: 0, duration: 1.0 }, 0.25)
      if (leftPlayRef.current) tl.from(leftPlayRef.current, { x: -140, opacity: 0, duration: 1.1, ease: 'back.out(1.2)' }, 0.35)
      if (swingRef.current) tl.from(swingRef.current, { y: 60, scale: 0.75, opacity: 0, duration: 0.9, ease: 'back.out(1.3)' }, 0.4)
      if (rightTowerRef.current) tl.from(rightTowerRef.current, { x: 130, opacity: 0, duration: 1.1, ease: 'back.out(1.2)' }, 0.35)
      if (kidsRef.current) tl.from(kidsRef.current, { x: 160, opacity: 0, duration: 1.25, ease: 'back.out(1.2)' }, 0.35)
      if (logoRef.current) tl.fromTo(logoRef.current, { scale: 0, y: -25, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0.4)
      if (title1Ref.current && title2Ref.current)
        tl.fromTo([title1Ref.current, title2Ref.current], { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.14, duration: 0.85 }, 0.45)
      if (descRef.current) tl.fromTo(descRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.6)
      if (btnsRef.current) tl.fromTo(btnsRef.current.children, { y: 20, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, stagger: 0.1, duration: 0.55, ease: 'back.out(1.4)' }, 0.7)
      if (badgeRef.current) tl.fromTo(badgeRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.8)
      if (bushesRef.current) tl.from(bushesRef.current.children, { y: 50, opacity: 0, stagger: 0.08, duration: 0.75, ease: 'power2.out' }, 0.5)

      // Idle
      if (sunRef.current) {
        gsap.to(sunRef.current, { rotation: 360, duration: 45, repeat: -1, ease: 'none' })
        gsap.to(sunRef.current, { scale: 1.04, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      }
      if (cloud1Ref.current) gsap.to(cloud1Ref.current, { x: 35, y: -6, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (cloud2Ref.current) gsap.to(cloud2Ref.current, { x: -30, y: 8, duration: 8.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (swingRef.current) gsap.to(swingRef.current, { rotation: 2.8, transformOrigin: 'top center', duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (kidsRef.current) gsap.to(kidsRef.current, { y: -7, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (rightTowerRef.current) gsap.to(rightTowerRef.current, { rotation: 1, transformOrigin: 'bottom center', duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      if (bushesRef.current) gsap.to(bushesRef.current.children, { rotation: (i: number) => (i % 2 === 0 ? 1.8 : -1.8), transformOrigin: 'bottom center', duration: 3.2, stagger: 0.3, repeat: -1, yoyo: true, ease: 'sine.inOut' })

      // Parallax
      const el = containerRef.current
      if (el) {
        const fn = (e: MouseEvent) => {
          const r = el.getBoundingClientRect()
          const x = (e.clientX - r.left) / r.width - 0.5
          const y = (e.clientY - r.top) / r.height - 0.5
          if (sunRef.current) gsap.to(sunRef.current, { x: x * 16, y: y * 12, duration: 1, ease: 'power1.out' })
          if (kidsRef.current) gsap.to(kidsRef.current, { x: x * -18, duration: 0.8, ease: 'power1.out' })
          if (swingRef.current) gsap.to(swingRef.current, { x: x * 10, duration: 1.1, ease: 'power1.out' })
          if (leftPlayRef.current) gsap.to(leftPlayRef.current, { x: x * 12, duration: 1.1, ease: 'power1.out' })
          if (rightTowerRef.current) gsap.to(rightTowerRef.current, { x: x * -12, duration: 1.1, ease: 'power1.out' })
          if (cloud1Ref.current) gsap.to(cloud1Ref.current, { x: x * 20, duration: 1.4, ease: 'power1.out' })
          if (cloud2Ref.current) gsap.to(cloud2Ref.current, { x: x * -15, duration: 1.4, ease: 'power1.out' })
        }
        el.addEventListener('mousemove', fn)
        return () => el.removeEventListener('mousemove', fn)
      }
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{
        aspectRatio: '16/9',
        minHeight: 420,
        maxHeight: '92vh',
        background: 'linear-gradient(180deg, #7EC8E3 0%, #ADE2F3 40%, #C5EDF8 70%, #D4F1FB 100%)',
      }}
    >
      {/* ── SUN (top-right) ── */}
      <div ref={sunRef} className="absolute pointer-events-none"
        style={{ top: '2%', right: '2%', width: '10%', aspectRatio: '1/1', zIndex: 2 }}>
        <div className="absolute inset-0 rounded-full bg-yellow-300/20 blur-2xl scale-150" />
        <Image src="/images/hero_gsap_v2/matahari.png" alt="Matahari" fill className="object-contain" priority />
      </div>

      {/* ── CLOUD 1 ── */}
      <div ref={cloud1Ref} className="absolute pointer-events-none"
        style={{ top: '7%', left: '36%', width: '11%', aspectRatio: '98/54', zIndex: 3, opacity: 0.9 }}>
        <Image src="/images/hero_gsap_v2/awan.png" alt="Awan" fill className="object-contain" />
      </div>

      {/* ── CLOUD 2 ── */}
      <div ref={cloud2Ref} className="absolute pointer-events-none"
        style={{ top: '10%', right: '18%', width: '9%', aspectRatio: '102/56', zIndex: 3, opacity: 0.8 }}>
        <Image src="/images/hero_gsap_v2/awan 2.png" alt="Awan 2" fill className="object-contain" />
      </div>

      {/* ── BACKGROUND ROLLING HILLS ── */}
      <div ref={backHillRef} className="absolute pointer-events-none"
        style={{ bottom: '-2%', width: '61%', aspectRatio: '844/317', zIndex: 10 }}>
        <Image src="/images/hero_gsap_v2/rumput belakang.png" alt="Bukit Belakang" fill className="object-contain object-bottom-right" />
      </div>

      {/* ── LEFT TREE ── */}
      <div ref={leftTreeRef} className="absolute pointer-events-none"
        style={{ bottom: '30%', left: '-4%', width: '12%', aspectRatio: '231/350', zIndex: 6 }}>
        <Image src="/images/hero_gsap_v2/pohon 2.png" alt="Pohon Kiri" fill className="object-contain object-bottom" />
      </div>

      {/* ── RIGHT TREE ── */}
      <div ref={rightTreeRef} className="absolute pointer-events-none"
        style={{ bottom: '36%', right: '1%', width: '10%', aspectRatio: '165/261', zIndex: 6 }}>
        <Image src="/images/hero_gsap_v2/pohon.png" alt="Pohon Kanan" fill className="object-contain object-bottom" />
      </div>

      {/* ── GROUND BACKDROP FILL ── */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: '16%', background: '#92bd64', zIndex: 9 }} />

      {/* ── MAIN HILL (Group 68) ── */}
      <div ref={mainHillRef} className="absolute pointer-events-none"
        style={{ bottom: 0, left: '4%', right: 0, height: '48%', zIndex: 10 }}>
        <Image src="/images/hero_gsap_v2/Group 68.png" alt="Lapangan" fill className="object-fill object-bottom" priority />
      </div>

      {/* ── LEFT PLAYGROUND ── */}
      <div ref={leftPlayRef} className="absolute pointer-events-none"
        style={{ bottom: '20%', left: '0%', width: '22%', aspectRatio: '412/251', zIndex: 15 }}>
        <Image src="/images/hero_gsap_v2/playgorund.png" alt="Playground" fill className="object-contain object-bottom" />
      </div>

      {/* ── SWING ── */}
      <div
        ref={swingRef}
        className="absolute pointer-events-none z-9 aspect-[248/174]
          bottom-[12%] left-[25%] w-[13%]
          sm:bottom-[15%] sm:left-[26%] sm:w-[13%]
          md:bottom-[22%] md:left-[27%] md:w-[13%]"
      >
        <Image src="/images/hero_gsap_v2/ayunan.png" alt="Ayunan" fill className="object-contain object-bottom" />
      </div>

      {/* ── RIGHT TOWER ── */}
      <div ref={rightTowerRef} className="absolute pointer-events-none"
        style={{ bottom: '26%', right: '8.5%', width: '8%', aspectRatio: '213/360', zIndex: 15 }}>
        <Image src="/images/hero_gsap_v2/mainan.png" alt="Mainan" fill className="object-contain object-bottom" />
      </div>

      {/* ── KIDS CHARACTERS ── */}
      <div ref={kidsRef} className="absolute pointer-events-none"
        style={{ bottom: '12%', left: '45%', width: '39%', aspectRatio: '627/500', zIndex: 20 }}>
        <Image src="/images/hero_gsap_v2/orang.png" alt="Siswa KB TK Istiqamah" fill className="object-contain object-bottom" priority />
      </div>

      {/* ── FOREGROUND BUSHES ── */}
      <div
        ref={bushesRef}
        className="absolute inset-x-0 bottom-0 pointer-events-none z-25 h-[12%] sm:h-[15%] md:h-[18%]"
      >
        <div className="absolute left-0 top-0 md:top-[-9%] w-[34%] aspect-[518/209]">
          <Image src="/images/hero_gsap_v2/semak kiri.png" alt="Semak Kiri" fill className="object-contain object-bottom-left" />
        </div>
        <div className="absolute bottom-0 left-[35%] w-[20%] aspect-[437/122]">
          <Image src="/images/hero_gsap_v2/semak tengah.png" alt="Semak Tengah" fill className="object-contain object-bottom" />
        </div>
        <div className="absolute right-0 top-0 md:top-[-40%] w-[20%] aspect-[441/358]">
          <Image src="/images/hero_gsap_v2/semak kanan.png" alt="Semak Kanan" fill className="object-contain object-bottom-right" />
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          HERO TEXT — responsive across mobile, tablet, desktop
      ──────────────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{ inset: 0, zIndex: 30 }}
      >
        <div
          className="absolute flex flex-col items-center text-center pointer-events-auto
            top-[24%] left-[4%] w-[50%]
            sm:top-[24%] sm:left-[8%] sm:w-[42%]
            lg:top-[25%] lg:left-[13%] lg:w-[38%] lg:max-w-[480px]"
        >
          {/* Logo */}
          <div ref={logoRef} className="flex justify-center">
            <Image
              src={logoSrc}
              alt="Logo KB & TK Istiqamah"
              width={80}
              height={100}
              style={{ width: 'clamp(34px,4.5vw,70px)', height: 'auto', display: 'block' }}
              className="object-contain drop-shadow-md hover:scale-105 transition-transform"
              priority
              onError={() => setLogoSrc('/images/school_logo.png')}
            />
          </div>

          {/* Headline */}
          <h1
            className="text-center"
            style={{
              marginTop: 'clamp(6px,0.8vw,14px)',
              fontSize: 'clamp(15px,2.4vw,38px)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            <span ref={title1Ref} style={{ display: 'block', color: '#1B3B6F' }}>
              Being Islamic Character
            </span>
            <span ref={title2Ref} style={{ display: 'block', color: '#06864C', marginTop: 'clamp(1px,0.2vw,4px)' }}>
              Through Life Skill
            </span>
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-center"
            style={{
              marginTop: 'clamp(6px,0.8vw,14px)',
              fontSize: 'clamp(8px,0.9vw,14px)',
              lineHeight: 1.55,
              color: '#244265',
              fontWeight: 600,
              maxWidth: '430px',
            }}
          >
            KB TK Istiqamah menghadirkan lingkungan belajar Islami yang hangat dan menyenangkan untuk mendampingi anak tumbuh menjadi generasi yang santun, mandiri, aktif, religius dan terampil
          </p>

          {/* Buttons */}
          <div
            ref={btnsRef}
            className="flex flex-wrap items-center justify-center"
            style={{
              marginTop: 'clamp(8px,1.1vw,16px)',
              gap: 'clamp(6px,0.8vw,12px)',
            }}
          >
            <Link
              href="/ppdb"
              style={{
                display: 'inline-block',
                padding: 'clamp(6px,0.65vw,11px) clamp(12px,1.5vw,26px)',
                fontSize: 'clamp(8px,0.85vw,13px)',
                fontWeight: 700,
                color: '#fff',
                backgroundColor: '#F5B744',
                borderRadius: 9999,
                boxShadow: '0 4px 14px rgba(245,183,68,0.4)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
                textDecoration: 'none',
              }}
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/tentang-kami"
              style={{
                display: 'inline-block',
                padding: 'clamp(6px,0.65vw,11px) clamp(10px,1.3vw,22px)',
                fontSize: 'clamp(8px,0.85vw,13px)',
                fontWeight: 700,
                color: '#1B3B6F',
                backgroundColor: '#D2EFF8',
                border: '1.5px solid #7AD0ED',
                borderRadius: 9999,
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
                textDecoration: 'none',
              }}
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>

          {/* Accreditation Badge */}
          <div
            ref={badgeRef}
            className="mx-auto"
            style={{
              marginTop: 'clamp(8px,1vw,14px)',
              position: 'relative',
              width: 'clamp(100px,13vw,190px)',
              aspectRatio: '525 / 125',
            }}
          >
            <Image
              src="/images/hero_gsap_v2/Group 50.png"
              alt="Akreditasi A Terakreditasi Unggul"
              fill
              className="object-contain hover:scale-105 transition-transform"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
