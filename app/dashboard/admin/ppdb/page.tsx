'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { approvePPDB } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  KeyRound,
  Mail
} from 'lucide-react'

export default function AdminPPDBPage() {
  const [ppdbList, setPpdbList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  
  // Credentials modal state
  const [credsModalOpen, setCredsModalOpen] = useState(false)
  const [generatedCreds, setGeneratedCreds] = useState<any>(null)
  const [actionPendingId, setActionPendingId] = useState<string | null>(null)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ppdb_tk')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPpdbList(data)
    } else {
      setPpdbList([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (id: string) => {
    setActionPendingId(id)
    const result = await approvePPDB(id)
    setActionPendingId(null)

    if (result.success) {
      setGeneratedCreds({
        studentName: ppdbList.find(app => app.id === id)?.student_name,
        username: result.username,
        password: result.password
      })
      setCredsModalOpen(true)
      
      // Update local state status
      setPpdbList(prev => prev.map(app => 
        app.id === id 
          ? { ...app, status: 'Diterima', payment_status: 'Verified' }
          : app
      ))
    } else {
      toast.error(result.error || 'Terjadi kesalahan.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted': return <Badge className="bg-blue-100 text-blue-800 border-none rounded-full px-3 py-1 font-bold">Baru</Badge>
      case 'Verifikasi Berkas': return <Badge className="bg-amber-100 text-amber-800 border-none rounded-full px-3 py-1 font-bold">Verifikasi Berkas</Badge>
      case 'Diterima': return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-full px-3 py-1 font-bold">Diterima</Badge>
      case 'Ditolak': return <Badge className="bg-rose-100 text-rose-800 border-none rounded-full px-3 py-1 font-bold">Ditolak</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800 border-none rounded-full px-3 py-1 font-bold">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Kelola Pendaftar PPDB</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Verifikasi dokumen dan kelulusan calon siswa baru.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadData} variant="outline" className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs cursor-pointer">
            Muat Ulang Data
          </Button>
        </div>
      </div>

      {/* PPDB Applicants List */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue">Aplikasi PPDB Aktif</CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Daftar calon siswa baru yang mendaftar secara daring.</CardDescription>
          </div>
          <TrendingUp className="text-primary-green" />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat data...</div>
          ) : ppdbList.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada data pendaftar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F8F6F2] text-xs font-extrabold text-primary-blue uppercase border-b border-gray-100">
                    <th className="p-4 pl-8">Nama Calon Siswa</th>
                    <th className="p-4">Tanggal Lahir</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ppdbList.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-primary-blue">{app.student_name}</div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5">ID: {app.id.substring(0, 8)}...</div>
                      </td>
                      <td className="p-4 font-semibold text-gray-600">
                        {new Date(app.birth_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">{getStatusBadge(app.status)}</td>
                      <td className="p-4 pr-8 text-right space-x-2">
                        {['Submitted', 'Verifikasi Berkas'].includes(app.status) && (
                          <>
                            <Button
                              onClick={() => handleApprove(app.id)}
                              disabled={actionPendingId === app.id}
                              className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer"
                            >
                              {actionPendingId === app.id ? 'Memproses...' : 'Terima PPDB'}
                            </Button>
                            <Button
                              onClick={async () => {
                                if (confirm('Tolak pendaftaran ini?')) {
                                  await supabase.from('ppdb_tk').update({ status: 'Ditolak' }).eq('id', app.id)
                                  loadData()
                                }
                              }}
                              variant="outline"
                              className="border-amber-200 text-amber-600 hover:bg-amber-50 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer"
                            >
                              Tolak
                            </Button>
                          </>
                        )}
                        {app.status === 'Diterima' && (
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold mr-2">Terdaftar</Badge>
                        )}
                        {app.status === 'Ditolak' && (
                          <Badge className="bg-rose-50 text-rose-600 border-none font-bold mr-2">Ditolak</Badge>
                        )}
                        <Button
                          onClick={async () => {
                            if (confirm('Hapus pendaftaran ini secara permanen? Semua berkas dan data terkait akan ikut terhapus.')) {
                              setActionPendingId(app.id)
                              const { error } = await supabase.from('ppdb_tk').delete().eq('id', app.id)
                              setActionPendingId(null)
                              if (error) {
                                toast.error('Gagal menghapus pendaftaran: ' + error.message)
                              } else {
                                toast.success('Pendaftaran berhasil dihapus!')
                                loadData()
                              }
                            }
                          }}
                          disabled={actionPendingId === app.id}
                          variant="destructive"
                          className="rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer"
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREDENTIALS GENERATED DIALOG */}
      <Dialog open={credsModalOpen} onOpenChange={setCredsModalOpen}>
        <DialogContent className="rounded-[32px] max-w-md bg-white p-8">
          <DialogHeader className="space-y-3 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-primary-green rounded-full flex items-center justify-center mx-auto">
              <KeyRound size={24} />
            </div>
            <DialogTitle className="text-lg font-black text-primary-blue">Akun Orang Tua Terbuat!</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold">
              Kredensial login berikut telah dibuat secara otomatis untuk orang tua dari ananda <span className="font-bold text-primary-blue">{generatedCreds?.studentName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="p-4 bg-[#F8F6F2] rounded-2xl border border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">Username:</span>
                <span className="font-bold text-primary-blue font-mono">{generatedCreds?.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-semibold">Password Sementara:</span>
                <span className="font-bold text-primary-blue font-mono">{generatedCreds?.password}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                <span className="text-gray-400 font-semibold">Status Akun:</span>
                <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold rounded-full text-[10px]">active</Badge>
              </div>
            </div>

            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-semibold flex items-start gap-2 leading-relaxed">
              <Mail size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Notifikasi email berisi petunjuk login, username, dan password di atas telah dikirimkan secara otomatis ke alamat email terdaftar orang tua.
              </span>
            </div>
          </div>

          <div className="pt-6">
            <Button onClick={() => setCredsModalOpen(false)} className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white rounded-xl font-bold">
              Tutup & Selesai
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
