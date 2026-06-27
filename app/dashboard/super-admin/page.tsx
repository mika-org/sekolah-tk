'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Users,
  Layers,
  FileText,
  Settings,
  ShieldCheck,
  TrendingUp,
  Activity,
  History,
  Lock
} from 'lucide-react'

export default function SuperAdminDashboard() {
  const [teachersCount, setTeachersCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)

    try {
      const [teachersRes, studentsRes, classesRes, logsRes] = await Promise.all([
        fetch('/api/admin/data?table=teachers_tk&limit=1000'),
        fetch('/api/admin/data?table=students_tk&limit=1000'),
        fetch('/api/admin/data?table=classes_tk&limit=1000'),
        fetch('/api/admin/data?table=activity_logs_tk&limit=5&orderBy=created_at&ascending=false')
      ])

      const [teachers, students, classes, logsResult] = await Promise.all([
        teachersRes.json(), studentsRes.json(), classesRes.json(), logsRes.json()
      ])

      setTeachersCount((teachers.data || []).length)
      setStudentsCount((students.data || []).length)
      setClassesCount((classes.data || []).length)
      setLogs(logsResult.data || [])
    } catch {
      // silently fail
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Dashboard Super Admin</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Akses penuh terhadap data master, laporan keuangan, audit log, dan pengaturan website.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-primary-blue text-white rounded-full font-bold px-3 py-1 text-xs">Akses Penuh (Root)</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Guru</div>
              <div className="text-2xl font-black text-primary-blue">{teachersCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Murid</div>
              <div className="text-2xl font-black text-primary-blue">{studentsCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Jumlah Kelas</div>
              <div className="text-2xl font-black text-primary-blue">{classesCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#F8F6F2] text-gray-500 rounded-2xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Tahun Ajaran</div>
              <div className="text-sm font-black text-primary-blue mt-1">2026 / 2027</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Audit Log / Activity */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
                  <History className="text-primary-green" />
                  Audit Log & Aktivitas Sistem
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-gray-400">Aktivitas real-time yang terjadi pada sistem portal sekolah.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-xs font-semibold text-primary-blue max-w-lg leading-relaxed">
                      {log.activity}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurations & Permissions */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="bg-white rounded-[32px] shadow-sm border-none">
            <CardHeader className="p-6">
              <CardTitle className="text-sm font-black text-primary-blue flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary-green" />
                Manajemen Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-[#F8F6F2] hover:bg-[#F8F6F2]/80 text-primary-blue border-none font-bold rounded-xl justify-start space-x-3 text-xs">
                <Lock size={16} className="text-primary-green" />
                <span>Pengaturan Role & Izin</span>
              </Button>
              <Button className="w-full bg-[#F8F6F2] hover:bg-[#F8F6F2]/80 text-primary-blue border-none font-bold rounded-xl justify-start space-x-3 text-xs">
                <Settings size={16} className="text-primary-green" />
                <span>Pengaturan Website</span>
              </Button>
              <Button className="w-full bg-[#F8F6F2] hover:bg-[#F8F6F2]/80 text-primary-blue border-none font-bold rounded-xl justify-start space-x-3 text-xs">
                <FileText size={16} className="text-primary-green" />
                <span>Ekspor Backup DB (SQL)</span>
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
