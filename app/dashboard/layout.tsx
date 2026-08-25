'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/database/client'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  UserCheck,
  Megaphone,
  MessageSquare,
  DollarSign,
  FileSpreadsheet,
  Layers,
  UserCog,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

interface NavGroup {
  id: string
  title: string
  collapsible?: boolean
  items: NavItem[]
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // State to track which group is expanded / collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      // 1. Try to read from cookie first (custom POS-style auth)
      const match = document.cookie.match(new RegExp('(^| )sekolah_tk_token=([^;]+)'))
      if (match) {
        try {
          const token = match[2]
          const parts = token.split('.')
          const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          const payload = JSON.parse(payloadJson)

          setUser({
            id: payload.id,
            email: payload.email,
            user_metadata: {
              role: payload.role,
              username: payload.username,
              student_name: payload.username === 'orangtua' ? 'Althaf' : '',
            },
          })
          setLoading(false)
          return
        } catch (e) {
          console.error('Error decoding cookie token:', e)
        }
      }

      // 2. Fallback to API session
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [pathname, supabase])

  const handleLogout = async () => {
    await logout()
  }

  const role = user?.user_metadata?.role || 'admin'

  // Structured navigation groups based on user role
  const navGroups = useMemo<NavGroup[]>(() => {
    switch (role) {
      case 'super_admin':
        return [
          {
            id: 'main',
            title: 'Utama',
            collapsible: false,
            items: [
              { name: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
            ],
          },
          {
            id: 'academic',
            title: 'Master Data Akademik',
            collapsible: true,
            items: [
              { name: 'Master Guru', href: '/dashboard/super-admin/teachers', icon: GraduationCap },
              { name: 'Master Murid', href: '/dashboard/super-admin/students', icon: Users },
              { name: 'Master Kelas', href: '/dashboard/super-admin/classes', icon: Layers },
            ],
          },
          {
            id: 'ppdb',
            title: 'PPDB & Kesiswaan',
            collapsible: true,
            items: [
              { name: 'Pendaftar PPDB', href: '/dashboard/admin/ppdb', icon: UserCheck },
              { name: 'Verifikasi Pembayaran', href: '/dashboard/admin/payments', icon: DollarSign },
              { name: 'Laporan PPDB', href: '/dashboard/super-admin/reports', icon: FileSpreadsheet },
            ],
          },
          {
            id: 'content',
            title: 'Konten & Media Web',
            collapsible: true,
            items: [
              { name: 'Kelola Banner Hero', href: '/dashboard/admin/hero', icon: Layers },
              { name: 'Kelola Galeri', href: '/dashboard/admin/gallery', icon: BookOpen },
              { name: 'Pengumuman', href: '/dashboard/admin/announcements', icon: Megaphone },
              { name: 'Testimoni', href: '/dashboard/admin/testimonials', icon: MessageSquare },
            ],
          },
          {
            id: 'system',
            title: 'Sistem & Pengaturan',
            collapsible: true,
            items: [
              { name: 'Manajemen User', href: '/dashboard/admin/users', icon: UserCog },
              { name: 'Audit Log Aktivitas', href: '/dashboard/super-admin/audit-logs', icon: FileText },
              { name: 'Pengaturan Web', href: '/dashboard/super-admin/settings', icon: Settings },
            ],
          },
        ]
      case 'admin':
        return [
          {
            id: 'main',
            title: 'Utama',
            collapsible: false,
            items: [
              { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
            ],
          },
          {
            id: 'ppdb',
            title: 'PPDB & Kesiswaan',
            collapsible: true,
            items: [
              { name: 'Pendaftar PPDB', href: '/dashboard/admin/ppdb', icon: UserCheck },
              { name: 'Verifikasi Pembayaran', href: '/dashboard/admin/payments', icon: DollarSign },
            ],
          },
          {
            id: 'content',
            title: 'Konten & Media Web',
            collapsible: true,
            items: [
              { name: 'Kelola Banner Hero', href: '/dashboard/admin/hero', icon: Layers },
              { name: 'Kelola Galeri', href: '/dashboard/admin/gallery', icon: BookOpen },
              { name: 'Pengumuman', href: '/dashboard/admin/announcements', icon: Megaphone },
              { name: 'Testimoni', href: '/dashboard/admin/testimonials', icon: MessageSquare },
            ],
          },
          {
            id: 'system',
            title: 'Sistem',
            collapsible: true,
            items: [
              { name: 'Manajemen User', href: '/dashboard/admin/users', icon: UserCog },
            ],
          },
        ]
      case 'guru':
        return [
          {
            id: 'main',
            title: 'Utama',
            collapsible: false,
            items: [
              { name: 'Dashboard', href: '/dashboard/guru', icon: LayoutDashboard },
            ],
          },
          {
            id: 'academic',
            title: 'Akademik & Penilaian',
            collapsible: true,
            items: [
              { name: 'Absensi TK', href: '/dashboard/guru/attendance', icon: ClipboardList },
              { name: 'Input Nilai PAUD', href: '/dashboard/guru/grades', icon: BookOpen },
              { name: 'Materi Belajar', href: '/dashboard/guru/materials', icon: Layers },
            ],
          },
          {
            id: 'communication',
            title: 'Komunikasi',
            collapsible: true,
            items: [
              { name: 'Chat Orang Tua', href: '/dashboard/guru/chat', icon: MessageSquare },
            ],
          },
        ]
      case 'orang_tua':
        return [
          {
            id: 'main',
            title: 'Utama',
            collapsible: false,
            items: [
              { name: 'Dashboard', href: '/dashboard/orang-tua', icon: LayoutDashboard },
            ],
          },
          {
            id: 'child_dev',
            title: 'Perkembangan Ananda',
            collapsible: true,
            items: [
              { name: 'Absensi Anak', href: '/dashboard/orang-tua/attendance', icon: ClipboardList },
              { name: 'Nilai & Rapor PAUD', href: '/dashboard/orang-tua/grades', icon: GraduationCap },
              { name: 'Materi Belajar', href: '/dashboard/orang-tua/materials', icon: Layers },
            ],
          },
          {
            id: 'admin_fin',
            title: 'Administrasi & Keuangan',
            collapsible: true,
            items: [
              { name: 'Status PPDB', href: '/dashboard/orang-tua/ppdb-status', icon: FileText },
              { name: 'Tagihan & Bayar', href: '/dashboard/orang-tua/billing', icon: DollarSign },
            ],
          },
          {
            id: 'communication',
            title: 'Komunikasi',
            collapsible: true,
            items: [
              { name: 'Chat Wali Kelas', href: '/dashboard/orang-tua/chat', icon: MessageSquare },
            ],
          },
        ]
      default:
        return []
    }
  }, [role])

  // Automatically make sure the group containing active link is expanded
  useEffect(() => {
    navGroups.forEach((group) => {
      const hasActiveChild = group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
      if (hasActiveChild) {
        setCollapsedGroups((prev) => ({ ...prev, [group.id]: false }))
      }
    })
  }, [pathname, navGroups])

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  const formatRoleName = (r: string) => {
    switch (r) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Administrator'
      case 'guru': return 'Guru Pengajar'
      case 'orang_tua': return 'Orang Tua'
      default: return r
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F6F2]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-green"></div>
      </div>
    )
  }

  // Sidebar navigation content renderer
  const renderNav = (isMobile = false) => (
    <div className="space-y-4">
      {navGroups.map((group) => {
        const isCollapsed = Boolean(collapsedGroups[group.id])
        const hasActiveChild = group.items.some((item) => pathname === item.href)

        if (!group.collapsible) {
          // Direct non-collapsible group (e.g. Dashboard)
          return (
            <div key={group.id} className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all',
                      active
                        ? 'bg-primary-green text-white shadow-md shadow-primary-green/20'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon size={17} className={active ? 'text-white' : 'text-emerald-400'} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          )
        }

        return (
          <div key={group.id} className="space-y-1">
            {/* Group Header with toggle */}
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors select-none cursor-pointer',
                hasActiveChild ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-200'
              )}
            >
              <span>{group.title}</span>
              <span className="p-0.5 rounded transition-transform">
                {isCollapsed ? (
                  <ChevronRight size={13} className="text-gray-400" />
                ) : (
                  <ChevronDown size={13} className="text-gray-400" />
                )}
              </span>
            </button>

            {/* Collapsible Submenu Items */}
            {!isCollapsed && (
              <div className="space-y-1 pl-1.5 pt-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => isMobile && setMobileOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all',
                        active
                          ? 'bg-primary-green text-white font-extrabold shadow-md shadow-primary-green/20'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="flex h-screen bg-[#F8F6F2] overflow-hidden font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-primary-blue text-white flex-shrink-0 relative select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center space-x-3 bg-primary-blue/90">
          <div className="w-9 h-9 bg-primary-green text-white rounded-xl flex items-center justify-center font-black text-base shadow-sm">
            I
          </div>
          <div className="min-w-0">
            <div className="font-black text-sm tracking-tight leading-tight truncate">TK Istiqamah</div>
            <div className="inline-flex items-center gap-1 mt-0.5">
              <ShieldCheck size={11} className="text-primary-green" />
              <span className="text-[9px] uppercase font-black text-primary-green tracking-wider">{formatRoleName(role)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Groups with Scroll */}
        <nav className="flex-1 px-3.5 py-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          {renderNav(false)}
        </nav>

        {/* Logout Footer */}
        <div className="p-3.5 border-t border-white/10 bg-primary-blue/95">
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start space-x-3 text-red-300 hover:text-red-200 hover:bg-white/10 rounded-xl font-bold text-xs py-2.5 h-auto cursor-pointer"
          >
            <LogOut size={16} />
            <span>Keluar Portal</span>
          </Button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* MOBILE HEADER */}
        <header className="lg:hidden bg-primary-blue text-white px-4 py-3.5 flex items-center justify-between shadow-md z-30">
          <div className="flex items-center space-x-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 rounded-lg hover:bg-white/10 focus:outline-none cursor-pointer">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="font-black text-sm tracking-tight">Portal TK Istiqamah</span>
          </div>
          <button onClick={handleLogout} className="text-red-300 hover:text-red-200 p-1.5 cursor-pointer">
            <LogOut size={18} />
          </button>
        </header>

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setMobileOpen(false)} />
            
            {/* Drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-blue text-white z-50 shadow-2xl">
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-primary-blue">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-green text-white rounded-xl flex items-center justify-center font-black text-sm">
                    I
                  </div>
                  <div>
                    <span className="font-extrabold text-sm block leading-none">Menu Portal</span>
                    <span className="text-[9px] uppercase font-bold text-primary-green tracking-wider">{formatRoleName(role)}</span>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-grow px-3.5 py-4 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10">
                {renderNav(true)}
              </nav>

              <div className="p-3.5 border-t border-white/10 bg-primary-blue">
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="w-full justify-start space-x-3 text-red-300 hover:text-red-200 hover:bg-white/10 rounded-xl font-bold text-xs py-2.5 h-auto cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Keluar Portal</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {children}
        </main>
      </div>

    </div>
  )
}
