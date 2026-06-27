'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  Layers
} from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        // Mock user for local testing if not authenticated
        setUser({
          id: 'mock-user-id',
          email: 'admin@sekolah-istiqamah.sch.id',
          user_metadata: {
            role: pathname.includes('super-admin')
              ? 'super_admin'
              : pathname.includes('admin')
                ? 'admin'
                : pathname.includes('guru')
                  ? 'guru'
                  : 'orang_tua',
            username: 'admin',
            student_name: 'Althaf'
          }
        })
      }
      setLoading(false)
    }
    getUser()
  }, [pathname, supabase])

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F6F2]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-green"></div>
      </div>
    )
  }

  const role = user?.user_metadata?.role || 'admin'

  // Get sidebar links based on role
  const getLinks = () => {
    switch (role) {
      case 'super_admin':
        return [
          { name: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
          { name: 'Master Guru', href: '/dashboard/super-admin/teachers', icon: GraduationCap },
          { name: 'Master Murid', href: '/dashboard/super-admin/students', icon: Users },
          { name: 'Master Kelas', href: '/dashboard/super-admin/classes', icon: Layers },
          { name: 'Laporan PPDB', href: '/dashboard/super-admin/reports', icon: FileSpreadsheet },
          { name: 'Audit Log', href: '/dashboard/super-admin/audit-logs', icon: FileText },
          { name: 'Pengaturan Web', href: '/dashboard/super-admin/settings', icon: Settings },
        ]
      case 'admin':
        return [
          { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
          { name: 'Pendaftar PPDB', href: '/dashboard/admin/ppdb', icon: UserCheck },
          { name: 'Verifikasi Pembayaran', href: '/dashboard/admin/payments', icon: DollarSign },
          { name: 'Kelola Galeri', href: '/dashboard/admin/gallery', icon: BookOpen },
          { name: 'Pengumuman', href: '/dashboard/admin/announcements', icon: Megaphone },
        ]
      case 'guru':
        return [
          { name: 'Dashboard', href: '/dashboard/guru', icon: LayoutDashboard },
          { name: 'Absensi TK', href: '/dashboard/guru/attendance', icon: ClipboardList },
          { name: 'Input Nilai', href: '/dashboard/guru/grades', icon: BookOpen },
          { name: 'Chat Orang Tua', href: '/dashboard/guru/chat', icon: MessageSquare },
        ]
      case 'orang_tua':
        return [
          { name: 'Dashboard', href: '/dashboard/orang-tua', icon: LayoutDashboard },
          { name: 'Status PPDB', href: '/dashboard/orang-tua/ppdb-status', icon: FileText },
          { name: 'Absensi Anak', href: '/dashboard/orang-tua/attendance', icon: ClipboardList },
          { name: 'Nilai & Rapor', href: '/dashboard/orang-tua/grades', icon: GraduationCap },
          { name: 'Tagihan & Bayar', href: '/dashboard/orang-tua/billing', icon: DollarSign },
        ]
      default:
        return []
    }
  }

  const links = getLinks()

  const formatRoleName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Administrator'
      case 'guru': return 'Guru Pengajar'
      case 'orang_tua': return 'Orang Tua'
      default: return role
    }
  }

  return (
    <div className="flex h-screen bg-[#F8F6F2] overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-primary-blue text-white flex-shrink-0 relative">
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center font-black text-sm">
            I
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight leading-none">Istiqamah Portal</div>
            <span className="text-[9px] uppercase font-bold text-primary-green tracking-wider">{formatRoleName(role)}</span>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active 
                    ? 'bg-primary-green text-white shadow-md shadow-primary-green/10' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button Footer */}
        <div className="p-4 border-t border-white/10">
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start space-x-3 text-red-300 hover:text-red-400 hover:bg-white/5 rounded-xl font-bold cursor-pointer"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </Button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* MOBILE HEADER */}
        <header className="lg:hidden bg-primary-blue text-white px-4 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="focus:outline-none">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="font-extrabold text-sm tracking-tight">Portal Istiqamah ({formatRoleName(role)})</span>
          </div>
          <button onClick={handleLogout} className="text-red-300 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </header>

        {/* MOBILE SIDEBAR DRAWERS */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            
            {/* Sidebar drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-blue text-white z-50">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <span className="font-extrabold text-base">Menu Portal</span>
                <button onClick={() => setMobileOpen(false)} className="text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-grow px-4 py-6 space-y-1.5 overflow-y-auto">
                {links.map((link) => {
                  const Icon = link.icon
                  const active = pathname === link.href
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        active 
                          ? 'bg-primary-green text-white shadow-md' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{link.name}</span>
                    </Link>
                  )
                })}
              </nav>
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
