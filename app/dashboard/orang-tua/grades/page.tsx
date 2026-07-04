'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GraduationCap, Printer, Sparkles } from 'lucide-react'

export default function GradesPage() {
  const [studentData, setStudentData] = useState<any>(null)
  const [gradeLogs, setGradeLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    
    // 1. Try to read from cookie first (custom POS-style auth)
    let user = null
    const match = document.cookie.match(new RegExp('(^| )sekolah_tk_token=([^;]+)'))
    if (match) {
      try {
        const token = match[2]
        const parts = token.split('.')
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        const payload = JSON.parse(payloadJson)
        user = {
          id: payload.id,
          email: payload.email,
          user_metadata: {
            role: payload.role,
            username: payload.username,
            student_name: payload.username === 'orangtua' ? 'Althaf Syahputra' : ''
          }
        }
      } catch (e) {
        console.error('Error decoding cookie token:', e)
      }
    }

    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
    }
    
    let studentId = ''

    if (user) {
      // 1. First, try to query parents_tk by user_id to get linked student_id
      const { data: parent } = await supabase
        .from('parents_tk')
        .select('student_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (parent && parent.student_id) {
        studentId = parent.student_id
        const { data: stud } = await supabase
          .from('students_tk')
          .select('*')
          .eq('id', studentId)
          .maybeSingle()
        if (stud) {
          setStudentData(stud)
        }
      } else {
        // 2. Fallback to name-based match for mock/seeded logins
        const studentName = user.user_metadata?.student_name || (user.user_metadata?.username === 'orangtua' ? 'Althaf Syahputra' : '')
        if (studentName) {
          const { data: stud } = await supabase
            .from('students_tk')
            .select('*')
            .eq('nama', studentName)
            .maybeSingle()
          if (stud) {
            setStudentData(stud)
            studentId = stud.id
          }
        }
      }
    }

    if (studentId) {
      const { data: grd } = await supabase
        .from('grades_tk')
        .select('*')
        .eq('student_id', studentId)
        .order('id', { ascending: false })
      if (grd) setGradeLogs(grd)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Memuat nilai & rapor...</div>
  }

  const averageScore = gradeLogs.length > 0
    ? Math.round(gradeLogs.reduce((acc, curr) => acc + curr.score, 0) / gradeLogs.length)
    : 0

  return (
    <div className="space-y-8">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, aside, header, button, .no-print, .toast-container {
            display: none !important;
          }
          main, .main-content, #dashboard-layout-main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          #print-rapor {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 40px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
        @media screen {
          #print-rapor {
            display: none;
          }
        }
      `}} />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <GraduationCap size={12} className="text-amber-400" />
            <span>Hasil Belajar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Nilai Harian & Rapor Anak</h1>
          <p className="text-gray-300 font-medium text-xs">Evaluasi perkembangan kompetensi dan nilai mata pelajaran siswa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        {/* Grades List Card */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <GraduationCap className="text-primary-green" />
                  Perkembangan Akademik (Nilai Harian)
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-semibold">Daftar nilai kompetensi teranyar ananda.</CardDescription>
              </div>
              {gradeLogs.length > 0 && (
                <Button onClick={handlePrint} className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs py-2 h-auto cursor-pointer gap-2">
                  <Printer size={14} /> Cetak Rapor
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {gradeLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-semibold text-xs">Belum ada data nilai terdaftar.</div>
                ) : (
                  gradeLogs.map((grade) => (
                    <div key={grade.id} className="p-6 flex justify-between items-start gap-4 hover:bg-gray-55/10 transition-colors">
                      <div className="space-y-1">
                        <div className="font-extrabold text-sm text-primary-blue">{grade.subject}</div>
                        <div className="text-xs text-gray-500 font-medium leading-relaxed">"{grade.description}"</div>
                      </div>
                      <Badge className="bg-primary-green text-white hover:bg-primary-green border-none font-bold text-xs rounded-xl px-3 py-1">
                        Nilai: {grade.score}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-6 bg-[#F8F6F2] border-b border-gray-150">
              <CardTitle className="text-sm font-black text-primary-blue">Info Akademik</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-gray-500 font-semibold">
              <div className="flex justify-between">
                <span>Nama Siswa:</span>
                <span className="text-primary-blue font-extrabold">{studentData?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span>Rata-Rata Nilai:</span>
                <span className="text-primary-green font-extrabold">{averageScore}</span>
              </div>
              <div className="flex justify-between">
                <span>Tahun Ajaran:</span>
                <span className="text-primary-blue font-bold">2026/2027</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PRINT-ONLY RAPOR LAYOUT */}
      <div id="print-rapor" className="bg-white text-black font-serif text-sm">
        {/* School Letterhead */}
        <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase tracking-tight">KB & TK ISTIQAMAH BANDUNG</h2>
          <p className="text-xs font-semibold italic mt-1">Alamat: Jl. Istiqamah No. 12, Cihapit, Kec. Bandung Wetan, Kota Bandung</p>
          <p className="text-[10px] font-medium text-gray-550">Telp: (022) 4208008 | Email: tkistiqamahbandung@gmail.com</p>
        </div>

        {/* Report Card Title */}
        <div className="text-center my-6">
          <h3 className="text-lg font-bold underline uppercase">LAPORAN CAPAIAN PERKEMBANGAN SISWA</h3>
          <p className="text-xs font-bold mt-1">TAHUN AJARAN 2026/2027</p>
        </div>

        {/* Student Meta Details */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-xs font-medium border border-black p-4 rounded-lg">
          <div className="space-y-1">
            <div className="flex"><span className="w-28">Nama Murid</span><span>: {studentData?.nama}</span></div>
            <div className="flex"><span className="w-28">NISN / NIK</span><span>: {studentData?.nisn || studentData?.nik || '-'}</span></div>
          </div>
          <div className="space-y-1">
            <div className="flex"><span className="w-28">Kelas</span><span>: KB / TK - A</span></div>
            <div className="flex"><span className="w-28">Rata-Rata Nilai</span><span>: <strong>{averageScore}</strong> / 100</span></div>
          </div>
        </div>

        {/* Grades Table */}
        <table className="w-full border-collapse border border-black mb-10 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-3 text-left w-12 text-center">No</th>
              <th className="border border-black p-3 text-left w-48">Aspek / Bidang Penilaian</th>
              <th className="border border-black p-3 text-center w-24">Nilai Angka</th>
              <th className="border border-black p-3 text-left">Deskripsi Perkembangan Kualitatif</th>
            </tr>
          </thead>
          <tbody>
            {gradeLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-black p-4 text-center italic text-gray-500">Belum ada data nilai.</td>
              </tr>
            ) : (
              gradeLogs.map((grade, idx) => (
                <tr key={grade.id}>
                  <td className="border border-black p-3 text-center">{idx + 1}</td>
                  <td className="border border-black p-3 font-bold">{grade.subject}</td>
                  <td className="border border-black p-3 text-center font-bold">{grade.score}</td>
                  <td className="border border-black p-3 leading-relaxed">{grade.description || 'Sangat baik dalam mengikuti KBM.'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Signature Area */}
        <div className="grid grid-cols-3 gap-4 text-center mt-12 text-xs">
          <div className="space-y-16">
            <div>Orang Tua / Wali Siswa,</div>
            <div className="font-bold underline">( ____________________ )</div>
          </div>
          <div className="space-y-16">
            <div>Mengetahui,<br />Kepala Sekolah</div>
            <div className="font-bold underline">Ustadzah Nurul Hidayah, S.Pd</div>
          </div>
          <div className="space-y-16">
            <div>Bandung, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />Wali Kelas,</div>
            <div className="font-bold underline">Ustadzah Khadijah</div>
          </div>
        </div>
      </div>

    </div>
  )
}
