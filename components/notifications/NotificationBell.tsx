'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Volume2, VolumeX, ExternalLink, UserCheck, AlertCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface PPDBNotificationItem {
  id: string
  type: 'NEW_REGISTRATION' | 'PAYMENT_SUBMITTED' | 'FORM_COMPLETED'
  title: string
  studentName: string
  parentName?: string
  phone?: string
  message: string
  link: string
  createdAt: string
  read?: boolean
}

// Synthesizer Web Audio API chime (tanpa file audio eksternal)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime
    // Nada 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0.18, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Nada 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12)
    gain2.gain.setValueAtTime(0.22, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.55)
  } catch (e) {
    // Browser audio policy might block autoplay before interaction
  }
}

function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSec < 45) return 'Baru saja'
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`
    return `${Math.floor(diffSec / 86400)} hari lalu`
  } catch {
    return 'Baru saja'
  }
}

export function NotificationBell({ role, variant = 'light' }: { role?: string; variant?: 'dark' | 'light' }) {
  // Hanya tampil untuk admin dan super_admin
  const isStaff = role === 'admin' || role === 'super_admin'
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<PPDBNotificationItem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Koneksi SSE (Server-Sent Events)
  useEffect(() => {
    if (!isStaff) return

    let eventSource: EventSource | null = null
    let retryTimeout: NodeJS.Timeout | null = null

    function connectSSE() {
      try {
        eventSource = new EventSource('/api/notifications/stream')

        eventSource.onopen = () => {
          setIsConnected(true)
        }

        eventSource.addEventListener('init', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data)
            if (Array.isArray(data.notifications)) {
              setNotifications(data.notifications)
            }
          } catch (err) {
            console.error('Error parsing SSE init payload:', err)
          }
        })

        eventSource.addEventListener('notification', (e: MessageEvent) => {
          try {
            const item: PPDBNotificationItem = JSON.parse(e.data)
            setNotifications((prev) => [item, ...prev.filter((n) => n.id !== item.id)])

            // Putar audio chime
            if (soundEnabled) {
              playNotificationChime()
            }

            // Tampilkan Sonner Toast interaktif
            toast.custom((t) => (
              <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl shadow-xl border-2 border-emerald-500/20 max-w-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={18} className="animate-spin text-emerald-500" style={{ animationDuration: '3s' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-black text-primary-blue truncate">{item.title}</p>
                    <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">Baru saja</span>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-600 mt-0.5 leading-snug line-clamp-2">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        toast.dismiss(t)
                        router.push(item.link || '/dashboard/admin/ppdb')
                      }}
                      className="text-[10px] font-black text-white bg-primary-green hover:bg-emerald-600 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Buka PPDB
                    </button>
                    <button
                      onClick={() => toast.dismiss(t)}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-600 px-2 py-1 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            ), { duration: 6000 })
          } catch (err) {
            console.error('Error handling notification event:', err)
          }
        })

        eventSource.onerror = () => {
          setIsConnected(false)
          if (eventSource) {
            eventSource.close()
          }
          // Retry connection after 5 seconds
          retryTimeout = setTimeout(connectSSE, 5000)
        }
      } catch (err) {
        console.error('SSE connect failed:', err)
        retryTimeout = setTimeout(connectSSE, 5000)
      }
    }

    connectSSE()

    return () => {
      if (eventSource) eventSource.close()
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [isStaff, soundEnabled, router])

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await fetch('/api/notifications/read', { method: 'POST' })
    } catch (e) {
      console.warn('Failed to mark notifications read:', e)
    }
  }, [])

  if (!isStaff) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Lonceng */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifikasi Pendaftaran Siswa"
        title="Notifikasi Pendaftaran PPDB Real-time"
        className={cn(
          'relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center focus:outline-none touch-manipulation',
          variant === 'dark'
            ? isOpen
              ? 'bg-white/20 text-white shadow-sm'
              : 'text-white/80 hover:text-white hover:bg-white/10 active:bg-white/15'
            : isOpen
            ? 'bg-primary-blue text-white shadow-sm'
            : 'text-gray-600 hover:text-primary-blue hover:bg-gray-100 active:bg-gray-200 border border-gray-200/60 bg-white shadow-2xs'
        )}
      >
        <Bell size={19} className={cn(unreadCount > 0 && 'animate-wiggle')} />

        {/* Badge Angka Notifikasi Baru */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 animate-pulse',
              variant === 'dark' ? 'ring-primary-blue' : 'ring-white'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white text-gray-800 shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Popover */}
          <div className="p-3.5 border-b border-gray-100 bg-gradient-to-r from-primary-blue to-[#0b337a] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase tracking-wider">Notifikasi Pendaftaran SPMB</span>
                {/* Live SSE Indicator */}
                <span
                  title={isConnected ? 'Koneksi real-time aktif' : 'Menghubungkan kembali...'}
                  className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    )}
                  />
                  <span>{isConnected ? 'LIVE' : 'SYNCING'}</span>
                </span>
              </div>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Matikan suara notifikasi' : 'Aktifkan suara notifikasi'}
                className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-red-300" />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[11px]">
              <span className="text-white/70 font-semibold">
                {unreadCount > 0 ? `${unreadCount} pendaftar baru belum dibaca` : 'Semua pendaftaran telah dibaca'}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-300 hover:text-white cursor-pointer transition-colors"
                >
                  <CheckCheck size={13} />
                  <span>Tandai dibaca</span>
                </button>
              )}
            </div>
          </div>

          {/* List Notifikasi */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-300 mx-auto flex items-center justify-center mb-2">
                  <UserCheck size={24} />
                </div>
                <p className="text-xs font-bold text-gray-500">Belum ada aktivitas pendaftaran</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Notifikasi siswa mendaftar akan muncul real-time di sini.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.read
                const isPayment = item.type === 'PAYMENT_SUBMITTED'
                const isCompleted = item.type === 'FORM_COMPLETED'

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsOpen(false)
                      router.push(item.link || '/dashboard/admin/ppdb')
                    }}
                    className={cn(
                      'p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-gray-50',
                      isUnread ? 'bg-emerald-50/40' : 'bg-white'
                    )}
                  >
                    {/* Badge Icon */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs',
                        isPayment
                          ? 'bg-amber-100 text-amber-700 font-black'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {isPayment ? 'Rp' : isCompleted ? <CheckCheck size={16} /> : <UserCheck size={16} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-black text-primary-blue truncate">
                          {item.studentName}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 flex-shrink-0">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-gray-600 mt-0.5 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between mt-1.5">
                        <span
                          className={cn(
                            'text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                            isPayment
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              : isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/50'
                          )}
                        >
                          {isPayment ? 'Bukti Bayar' : isCompleted ? 'Biodata Lengkap' : 'Pendaftar Awal'}
                        </span>

                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Popover */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <Link
              href="/dashboard/admin/ppdb"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-black text-primary-blue hover:text-primary-green transition-colors"
            >
              <span>Buka Menu Pendaftar SPMB</span>
              <ExternalLink size={12} />
            </Link>
          </div>

        </div>
      )}
    </div>
  )
}
