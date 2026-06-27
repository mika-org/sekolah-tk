'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, User } from 'lucide-react'
import { login } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F6F2]">
      
      {/* Left side: branding/welcome banner (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-blue text-white p-16 flex-col justify-between relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -ml-20 -mb-20" />

        {/* Branding header */}
        <div className="relative z-10 flex items-center space-x-3 cursor-pointer">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-extrabold text-lg">
              I
            </div>
            <span className="font-extrabold text-xl tracking-tight">KB & TK Istiqamah</span>
          </Link>
        </div>

        {/* Dynamic banner text */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-4xl font-extrabold leading-tight">
            Selamat Datang Kembali di Portal Akademik
          </h2>
          <p className="text-gray-300 font-medium leading-relaxed text-sm">
            Silakan masuk untuk mengelola data sekolah, menginput absensi & nilai anak, mengunduh rapor, atau melacak status pendaftaran PPDB.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} KB & TK Istiqamah Balikpapan.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 relative">
        {/* Back Link */}
        <Link 
          href="/" 
          className="absolute top-8 left-8 sm:top-12 sm:left-12 inline-flex items-center gap-2 text-sm font-bold text-primary-blue hover:text-primary-green transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        {/* Card wrapper */}
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[32px] shadow-xl border border-gray-100 space-y-8">
          
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-black text-primary-blue">Masuk ke Akun</h1>
            <p className="text-xs text-gray-500 font-bold">Masukkan username dan password Anda</p>
          </div>

          <form action={formAction} className="space-y-6">
            
            {/* Error Message */}
            {state?.error && (
              <div className="p-4 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-200">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              
              {/* Username Input */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold text-primary-blue">Username</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400">
                    <User size={18} />
                  </span>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="namaanda"
                    className="pl-11 h-12 bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold text-primary-blue">Password</Label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl transition-colors shadow-md shadow-primary-green/10 text-sm cursor-pointer"
            >
              {isPending ? 'Memproses...' : 'Masuk Sekarang'}
            </Button>

          </form>

          {/* Quick Info Block */}
          <div className="text-center pt-4 border-t border-gray-50 text-[11px] text-gray-400 font-semibold space-y-1">
            <p>Belum terdaftar di PPDB? <Link href="/ppdb" className="text-primary-green hover:underline">Daftar Sekarang</Link></p>
            <p>Hubungi Guru/Admin jika lupa detail login Anda.</p>
          </div>

        </div>
      </div>

    </div>
  )
}
