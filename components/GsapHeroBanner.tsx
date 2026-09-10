'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

export default function GsapHeroBanner() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Elements Refs
  const sunRef = useRef<HTMLDivElement>(null)
  const cloudsRef = useRef<HTMLDivElement>(null)
  const groundRef = useRef<HTMLDivElement>(null)
  const grassRef = useRef<HTMLDivElement>(null)

  // Left-origin elements (hidden -> emerge and slide to the RIGHT)
  const leftTreeRef = useRef<HTMLDivElement>(null)
  const leftBushRef = useRef<HTMLDivElement>(null)
  const leftPlaygroundRef = useRef<HTMLDivElement>(null)

  // Right-origin elements (hidden -> emerge and slide to the LEFT)
  const rightTreeRef = useRef<HTMLDivElement>(null)
  const rightBushRef = useRef<HTMLDivElement>(null)
  const rightTowerRef = useRef<HTMLDivElement>(null)
  const kidsRef = useRef<HTMLDivElement>(null)

  // Center & Foreground elements
  const swingRef = useRef<HTMLDivElement>(null)
  const leavesRef = useRef<HTMLDivElement>(null)
  const bushBottomRef = useRef<HTMLDivElement>(null)

  // Left Text Content Refs (slide in from left)
  const contentRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const titleLine1Ref = useRef<HTMLSpanElement>(null)
  const titleLine2Ref = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  const [logoSrc, setLogoSrc] = useState('/images/hero_gsap/logo.png')

  useEffect(() => {
    // GSAP context ensures clean setup & teardown
    const ctx = gsap.context(() => {
      // ─── MASTER ENTRANCE TIMELINE ON REFRESH / LOAD ───
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 1. SUN FULL REVEAL (from scale 0, rotating, radiating from top-right)
      if (sunRef.current) {
        tl.from(sunRef.current, {
          scale: 0,
          opacity: 0,
          rotation: -180,
          y: -40,
          x: 40,
          duration: 1.4,
          ease: 'back.out(1.6)',
        }, 0.05)
      }

      // Clouds soft fade-in
      if (cloudsRef.current) {
        tl.from(cloudsRef.current, {
          opacity: 0,
          y: -25,
          duration: 1.0,
        }, 0.2)
      }

      // 2. GREEN GROUND & ROLLING HILLS RISE UP FROM BOTTOM
      if (groundRef.current) {
        tl.from(groundRef.current, {
          y: 90,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
        }, 0.1)
      }

      if (grassRef.current) {
        tl.from(grassRef.current.children, {
          y: 50,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
        }, 0.3)
      }

      // 3. LEFT ELEMENTS: HIDE & SLIDE TOWARDS RIGHT (Left-to-Right reveal)
      if (leftTreeRef.current) {
        tl.from(leftTreeRef.current, {
          x: -110,
          opacity: 0,
          duration: 1.0,
          ease: 'power3.out',
        }, 0.2)
      }

      if (leftBushRef.current) {
        tl.from(leftBushRef.current, {
          x: -90,
          opacity: 0,
          duration: 0.9,
        }, 0.3)
      }

      if (leftPlaygroundRef.current) {
        tl.from(leftPlaygroundRef.current, {
          x: -140,
          opacity: 0,
          duration: 1.1,
          ease: 'back.out(1.15)',
        }, 0.35)
      }

      // 4. RIGHT ELEMENTS: HIDE & SLIDE TOWARDS LEFT (Right-to-Left reveal)
      if (rightTreeRef.current) {
        tl.from(rightTreeRef.current, {
          x: 110,
          opacity: 0,
          duration: 1.0,
          ease: 'power3.out',
        }, 0.2)
      }

      if (rightBushRef.current) {
        tl.from(rightBushRef.current, {
          x: 90,
          opacity: 0,
          duration: 0.9,
        }, 0.3)
      }

      if (rightTowerRef.current) {
        tl.from(rightTowerRef.current, {
          x: 130,
          opacity: 0,
          duration: 1.1,
          ease: 'back.out(1.15)',
        }, 0.35)
      }

      // 5. CENTER SWING SET POPS UP
      if (swingRef.current) {
        tl.from(swingRef.current, {
          y: 60,
          scale: 0.75,
          opacity: 0,
          duration: 0.9,
          ease: 'back.out(1.3)',
        }, 0.4)
      }

      // 6. MAIN 3D CHARACTERS (KIDS) EMERGE & SLIDE IN FROM RIGHT
      if (kidsRef.current) {
        tl.from(kidsRef.current, {
          x: 160,
          opacity: 0,
          duration: 1.25,
          ease: 'back.out(1.2)',
        }, 0.35)
      }

      // 7. LEFT CONTENT (TEXT & BUTTONS) SLIDE IN TOWARDS RIGHT
      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { scale: 0, y: -25, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' },
          0.4
        )
      }

      if (titleLine1Ref.current && titleLine2Ref.current) {
        tl.from(
          [titleLine1Ref.current, titleLine2Ref.current],
          {
            x: -80,
            opacity: 0,
            stagger: 0.14,
            duration: 0.85,
            ease: 'power3.out',
          },
          0.45
        )
      }

      if (descRef.current) {
        tl.from(descRef.current, {
          x: -50,
          opacity: 0,
          duration: 0.7,
        }, 0.6)
      }

      if (buttonsRef.current) {
        tl.from(buttonsRef.current.children, {
          x: -40,
          scale: 0.9,
          opacity: 0,
          stagger: 0.1,
          duration: 0.55,
          ease: 'back.out(1.4)',
        }, 0.7)
      }

      if (badgeRef.current) {
        tl.from(badgeRef.current, {
          y: 25,
          opacity: 0,
          duration: 0.5,
        }, 0.8)
      }

      // 8. FOREGROUND BOTTOM STRIP RISES SMOOTHLY
      if (leavesRef.current) {
        tl.from(leavesRef.current.children, {
          y: 60,
          opacity: 0,
          stagger: 0.07,
          duration: 0.75,
          ease: 'power2.out',
        }, 0.5)
      }

      // ─── CONTINUOUS IDLE ANIMATIONS (LOOPING) ───

      // Sun continuous 360 rotation & radiant pulse
      if (sunRef.current) {
        gsap.to(sunRef.current, {
          rotation: 360,
          duration: 45,
          repeat: -1,
          ease: 'none',
        })
        gsap.to(sunRef.current, {
          scale: 1.04,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // Gentle swaying of the swing set
      if (swingRef.current) {
        gsap.to(swingRef.current, {
          rotation: 2.8,
          transformOrigin: 'top center',
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // Kids gentle breathing / float
      if (kidsRef.current) {
        gsap.to(kidsRef.current, {
          y: -7,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // Clouds smooth drift
      if (cloudsRef.current) {
        gsap.to(cloudsRef.current, {
          x: 45,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // Playground tower subtle idle
      if (rightTowerRef.current) {
        gsap.to(rightTowerRef.current, {
          rotation: 1,
          transformOrigin: 'bottom center',
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // Foreground leaves soft breeze
      if (leavesRef.current) {
        gsap.to(leavesRef.current.children, {
          rotation: (i) => (i % 2 === 0 ? 2.5 : -2.5),
          transformOrigin: 'bottom center',
          duration: 3.2,
          stagger: 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // ─── INTERACTIVE MOUSE PARALLAX EFFECT ───
      const container = containerRef.current
      if (container) {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = container.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width - 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5

          if (sunRef.current) {
            gsap.to(sunRef.current, {
              x: x * 16,
              y: y * 12,
              duration: 1,
              ease: 'power1.out',
            })
          }

          if (kidsRef.current) {
            gsap.to(kidsRef.current, {
              x: x * -18,
              duration: 0.8,
              ease: 'power1.out',
            })
          }

          if (swingRef.current) {
            gsap.to(swingRef.current, {
              x: x * 10,
              duration: 1.1,
              ease: 'power1.out',
            })
          }

          if (leftPlaygroundRef.current) {
            gsap.to(leftPlaygroundRef.current, {
              x: x * 12,
              duration: 1.1,
              ease: 'power1.out',
            })
          }

          if (rightTowerRef.current) {
            gsap.to(rightTowerRef.current, {
              x: x * -12,
              duration: 1.1,
              ease: 'power1.out',
            })
          }
        }

        container.addEventListener('mousemove', handleMouseMove)
        return () => container.removeEventListener('mousemove', handleMouseMove)
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[700px] sm:min-h-[740px] md:min-h-[780px] lg:min-h-[840px] xl:min-h-[890px] aspect-[16/10] max-h-[940px] overflow-hidden bg-gradient-to-b from-[#AEE4F2] via-[#BFEBF6] to-[#CDEEF7] select-none"
    >
      {/* ─── LAYER 1: SKY, FULL-REVEAL SUN & DRIFTING CLOUDS (z-0) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Full-Reveal Sun in Top Right Corner (100% visible, fully inside canvas) */}
        <div
          ref={sunRef}
          className="absolute top-3 sm:top-5 lg:top-7 xl:top-8 right-4 sm:right-7 lg:right-14 xl:right-18 w-20 h-20 sm:w-28 sm:h-28 lg:w-40 lg:h-40 xl:w-44 xl:h-44"
        >
          {/* Subtle warm sunbeam aura */}
          <div className="absolute inset-0 rounded-full bg-amber-300/25 blur-xl -z-10 scale-125 pointer-events-none" />
          <Image
            src="/images/hero_gsap/matahari.png"
            alt="Matahari Cerah"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        {/* Drifting Clouds */}
        <div ref={cloudsRef} className="absolute inset-0 opacity-80">
          <div className="absolute top-14 sm:top-18 lg:top-24 left-[34%] sm:left-[38%] w-24 sm:w-36 lg:w-40 h-10 sm:h-14 lg:h-16">
            <svg viewBox="0 0 100 45" fill="white" className="w-full h-full drop-shadow-sm">
              <path d="M15 35 A15 15 0 0 1 35 15 A20 20 0 0 1 70 12 A15 15 0 0 1 90 35 Z" opacity="0.85" />
            </svg>
          </div>
          <div className="absolute top-28 sm:top-34 lg:top-40 right-[28%] sm:right-[32%] w-20 sm:w-28 lg:w-32 h-8 sm:h-12">
            <svg viewBox="0 0 100 45" fill="white" className="w-full h-full drop-shadow-sm">
              <path d="M15 35 A15 15 0 0 1 35 15 A20 20 0 0 1 70 12 A15 15 0 0 1 90 35 Z" opacity="0.7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── LAYER 2: BACKGROUND TREES & BUSHES (z-10) ─── */}
      <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none z-10">
        {/* Left Background Tree */}
        <div
          ref={leftTreeRef}
          className="absolute bottom-[28%] sm:bottom-[32%] lg:bottom-[36%] left-0 sm:left-3 lg:left-6 w-24 sm:w-32 lg:w-40 xl:w-44 h-36 sm:h-48 lg:h-60 xl:h-64 opacity-90"
        >
          <Image
            src="/images/hero_gsap/pohon 2.png"
            alt="Pohon Rindang"
            fill
            className="object-contain object-bottom-left"
          />
        </div>

        {/* Left Background Bush */}
        <div
          ref={leftBushRef}
          className="absolute bottom-[24%] sm:bottom-[28%] lg:bottom-[32%] left-10 sm:left-20 lg:left-32 w-36 sm:w-52 lg:w-64 h-18 sm:h-26 lg:h-32 opacity-85"
        >
          <Image
            src="/images/hero_gsap/semak belakang.png"
            alt="Semak Belakang"
            fill
            className="object-contain"
          />
        </div>

        {/* Right Background Tree */}
        <div
          ref={rightTreeRef}
          className="absolute bottom-[29%] sm:bottom-[33%] lg:bottom-[37%] right-1 sm:right-4 lg:right-8 w-24 sm:w-32 lg:w-40 xl:w-44 h-36 sm:h-48 lg:h-60 xl:h-64 opacity-90"
        >
          <Image
            src="/images/hero_gsap/pohon.png"
            alt="Pohon Belakang"
            fill
            className="object-contain object-bottom-right"
          />
        </div>

        {/* Right Background Bush */}
        <div
          ref={rightBushRef}
          className="absolute bottom-[25%] sm:bottom-[29%] lg:bottom-[33%] right-10 sm:right-20 lg:right-32 w-36 sm:w-48 lg:w-56 h-18 sm:h-24 lg:h-28 opacity-85"
        >
          <Image
            src="/images/hero_gsap/semak 2.png"
            alt="Semak Belakang Kanan"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* ─── LAYER 3: EXPANSIVE GREEN LAWN & ROLLING HILLS (z-15) ─── */}
      <div
        ref={groundRef}
        className="absolute inset-x-0 bottom-0 h-[38%] sm:h-[42%] lg:h-[46%] xl:h-[48%] z-15 pointer-events-none"
      >
        {/* Soft Background Hill (Left-side rolling green slope behind fore.png) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <svg
            viewBox="0 0 1000 400"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* Lighter rolling back hill */}
            <path
              d="M 0 140 Q 220 50 480 180 T 1000 130 L 1000 400 L 0 400 Z"
              fill="#94C366"
            />
            {/* Soft shadow accent on hill crest */}
            <path
              d="M 0 180 Q 260 120 500 210 L 500 400 L 0 400 Z"
              fill="#8BBF5C"
              opacity="0.35"
            />
          </svg>
        </div>

        {/* Foreground rolling hill (fore.png with flowers and grass) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/hero_gsap/fore.png"
            alt="Bukit Rumput Hijau"
            fill
            className="object-fill object-bottom"
            priority
          />
        </div>
      </div>

      {/* ─── LAYER 4: PLAYGROUND STRUCTURES & SWING (z-25, STANDING ON THE LAWN) ─── */}
      <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none z-25">
        {/* Left Playground: Bridge & Slide (Standing on the grass) */}
        <div
          ref={leftPlaygroundRef}
          className="absolute bottom-[8%] sm:bottom-[10%] lg:bottom-[14%] xl:bottom-[15%] left-0 sm:left-2 lg:left-8 xl:left-12 w-32 sm:w-44 md:w-52 lg:w-64 xl:w-72 h-20 sm:h-28 md:h-34 lg:h-42 xl:h-46 drop-shadow-sm"
        >
          <Image
            src="/images/hero_gsap/playgorund.png"
            alt="Perosotan Playground"
            fill
            className="object-contain object-bottom-left"
          />
        </div>

        {/* Center-Left: Swing Set (100% visible, upright on grass slope, both seats hanging freely) */}
        <div
          ref={swingRef}
          className="absolute bottom-[11%] sm:bottom-[14%] md:bottom-[16%] lg:bottom-[18%] xl:bottom-[19%] left-[28%] sm:left-[32%] md:left-[35%] lg:left-[37%] xl:left-[38%] w-22 sm:w-28 md:w-34 lg:w-42 xl:w-46 h-18 sm:h-22 md:h-26 lg:h-32 xl:h-36 drop-shadow-sm"
        >
          <Image
            src="/images/hero_gsap/ayunan.png"
            alt="Ayunan Sekolah"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* Right: Playhouse Tower with Slide (Standing on grass) */}
        <div
          ref={rightTowerRef}
          className="absolute bottom-[8%] sm:bottom-[10%] md:bottom-[13%] lg:bottom-[15%] xl:bottom-[16%] right-1 sm:right-3 md:right-6 lg:right-10 xl:right-14 w-20 sm:w-28 md:w-32 lg:w-40 xl:w-44 h-32 sm:h-44 md:h-52 lg:h-64 xl:h-70 drop-shadow-sm"
        >
          <Image
            src="/images/hero_gsap/mainan.png"
            alt="Rumah Bermain"
            fill
            className="object-contain object-bottom-right"
          />
        </div>
      </div>

      {/* ─── LAYER 5: 3D KIDS CHARACTERS (z-35, STANDING ON HILL CREST) ─── */}
      <div
        ref={kidsRef}
        className="absolute bottom-[6%] sm:bottom-[8%] md:bottom-[10%] lg:bottom-[12%] xl:bottom-[13%] right-[2%] sm:right-[3%] md:right-[2%] lg:right-[12%] xl:right-[16%] 2xl:right-[20%] w-[240px] sm:w-[300px] md:w-[350px] lg:w-[540px] xl:w-[580px] aspect-[627/500] z-35 pointer-events-none drop-shadow-xl"
      >
        <Image
          src="/images/hero_gsap/orang.png"
          alt="Siswa KB TK Istiqamah"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>

      {/* ─── LAYER 6: FOREGROUND BOTTOM STRIP (z-40, EXACTLY MATCHING IMAGE 1 & IMAGE 2) ─── */}
      <div
        ref={leavesRef}
        className="absolute inset-x-0 bottom-0 h-20 sm:h-28 lg:h-44 xl:h-48 z-40 pointer-events-none overflow-hidden"
      >
        {/* 1. Far-left leaves cluster: daun bawah */}
        <div className="absolute bottom-0 left-0 w-16 sm:w-24 lg:w-40 xl:w-44 h-16 sm:h-24 lg:h-40 xl:h-44">
          <Image
            src="/images/hero_gsap/daun bawah.png"
            alt="Daun Bawah Kiri"
            fill
            className="object-contain object-bottom-left"
          />
        </div>

        {/* 2. Left grass patch: rumput 1 */}
        <div className="absolute bottom-1 sm:bottom-2 left-[10%] sm:left-[12%] lg:left-[15%] w-28 sm:w-42 lg:w-64 xl:w-72 h-10 sm:h-15 lg:h-24">
          <Image
            src="/images/hero_gsap/rumput 1.png"
            alt="Rumput Bunga Kiri"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* 3. Dark green bush overlapping front-right of rumput 1: daun bawah 2 */}
        <div className="absolute bottom-0 left-[16%] sm:left-[19%] lg:left-[23%] w-14 sm:w-22 lg:w-34 xl:w-38 h-12 sm:h-18 lg:h-28 xl:h-32">
          <Image
            src="/images/hero_gsap/daun bawah 2.png"
            alt="Daun Rindang Bawah"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* 4. Center lush bush directly below kids: semak bawah */}
        <div
          ref={bushBottomRef}
          className="absolute bottom-0 left-[34%] sm:left-[38%] lg:left-[42%] xl:left-[43%] w-48 sm:w-68 lg:w-[440px] xl:w-[500px] h-18 sm:h-26 lg:h-42 xl:h-46"
        >
          <Image
            src="/images/hero_gsap/semak bawah.png"
            alt="Semak Rindang Tengah"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* 5. Slanted grass patch right of center: rumput 2 */}
        <div className="absolute bottom-1 sm:bottom-2 lg:bottom-4 left-[62%] sm:left-[64%] lg:left-[68%] w-24 sm:w-36 lg:w-56 xl:w-64 h-8 sm:h-11 lg:h-18">
          <Image
            src="/images/hero_gsap/rumput 2.png"
            alt="Rumput Kanan Tengah"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* 6. Grass patch right: rumput 3 */}
        <div className="absolute bottom-1 sm:bottom-2 lg:bottom-3 left-[75%] sm:left-[77%] lg:left-[81%] w-20 sm:w-30 lg:w-46 xl:w-52 h-7 sm:h-10 lg:h-16">
          <Image
            src="/images/hero_gsap/rumput 3.png"
            alt="Rumput Kanan"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* 7. Far-right leaves cluster: daun bawah 3 */}
        <div className="absolute bottom-0 right-0 w-16 sm:w-22 lg:w-36 xl:w-40 h-16 sm:h-22 lg:h-36 xl:h-40">
          <Image
            src="/images/hero_gsap/daun bawah 3.png"
            alt="Daun Bawah Kanan"
            fill
            className="object-contain object-bottom-right"
          />
        </div>
      </div>

      {/* ─── LAYER 7: HERO TEXT CONTENT (z-50, MATCHING MOCKUP) ─── */}
      <div
        ref={contentRef}
        className="relative z-50 max-w-7xl mx-auto w-full h-full px-4 sm:px-6 md:px-6 lg:px-14 pt-20 sm:pt-24 md:pt-24 lg:pt-28 pb-8 flex flex-col justify-start md:justify-center items-center md:items-start pointer-events-auto"
      >
        <div className="w-full max-w-[340px] sm:max-w-[380px] md:max-w-[360px] lg:max-w-[480px] flex flex-col items-center text-center">
          {/* Official School Crest Logo */}
          <div
            ref={logoRef}
            className="relative flex items-center justify-center mb-2 sm:mb-2.5 drop-shadow-md hover:scale-105 transition-transform"
          >
            <Image
              src={logoSrc}
              alt="Logo KB & TK Istiqamah"
              width={70}
              height={88}
              className="w-14 sm:w-16 md:w-20 lg:w-[84px] h-auto object-contain drop-shadow-sm"
              priority
              onError={() => setLogoSrc('/images/school_logo.png')}
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-xl sm:text-2xl md:text-[30px] lg:text-[35px] xl:text-[39px] font-black leading-[1.14] tracking-tight text-center">
            <span
              ref={titleLine1Ref}
              className="block text-[#1B3B6F] drop-shadow-sm"
            >
              Being Islamic Character
            </span>
            <span
              ref={titleLine2Ref}
              className="block text-[#06864C] mt-0.5 sm:mt-1 drop-shadow-sm"
            >
              Through Life Skill
            </span>
          </h1>

          {/* Subtitle Description */}
          <p
            ref={descRef}
            className="mt-2.5 sm:mt-3 text-[11px] sm:text-[12.5px] md:text-[13px] lg:text-[14px] text-[#244265] font-semibold leading-[1.55] max-w-[320px] sm:max-w-[380px] lg:max-w-[440px] text-center drop-shadow-sm"
          >
            KB TK Istiqamah menghadirkan lingkungan belajar Islami yang hangat dan menyenangkan untuk mendampingi anak tumbuh menjadi generasi yang santun, mandiri, aktif, religius dan terampil
          </p>

          {/* Action Buttons (Daftar Sekarang & Pelajari Lebih Lanjut) */}
          <div
            ref={buttonsRef}
            className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          >
            <Link
              href="/ppdb"
              className="px-5 sm:px-7 py-2 sm:py-2.5 bg-[#F5B744] hover:bg-[#F59E0B] text-white font-bold text-xs sm:text-sm tracking-wide rounded-full shadow-[0_4px_14px_rgba(245,183,68,0.38)] hover:shadow-[0_6px_20px_rgba(245,183,68,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/tentang-kami"
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#D2EFF8] hover:bg-[#C2E8F5] border border-[#7AD0ED] text-[#1B3B6F] font-bold text-xs sm:text-sm tracking-wide rounded-full shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>

          {/* Accreditation Badge */}
          <div
            ref={badgeRef}
            className="mt-2.5 sm:mt-3.5 bg-white/85 backdrop-blur-sm px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full border border-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.05)] inline-flex items-center justify-center"
          >
            <div className="relative w-[150px] sm:w-[175px] lg:w-[190px] h-[30px] sm:h-[35px] lg:h-[38px]">
              <Image
                src="/images/hero_gsap/akreditasi.png"
                alt="Akreditasi A Terakreditasi Unggul"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
