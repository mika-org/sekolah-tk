'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { approvePPDB } from '@/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  KeyRound,
  Mail,
  AlertCircle
} from 'lucide-react'

export default function AdminPPDBPage() {
  const [ppdbList, setPpdbList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  
  // Credentials modal state
  const [credsModalOpen, setCredsModalOpen] = useState(false)
  const [generatedCreds, setGeneratedCreds] = useState<any>(null)
  const [actionPendingId, setActionPendingId] = useState<string | null>(null)

  // Details modal state
  const [selectedDetails, setSelectedDetails] = useState<any>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Custom confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {})

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

  useEffect(() => {
    if (detailsModalOpen || confirmOpen || credsModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [detailsModalOpen, confirmOpen, credsModalOpen])

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

  const handleViewDetails = async (app: any) => {
    setSelectedApp(app)
    setDetailsModalOpen(true)
    setLoadingDetails(true)
    setSelectedDetails(null)

    try {
      // 1. Fetch documents
      const { data: docs } = await supabase
        .from('ppdb_documents_tk')
        .select('*')
        .eq('ppdb_id', app.id)

      // 2. Fetch payment
      const { data: payment } = await supabase
        .from('payments_tk')
        .select('*')
        .eq('ppdb_id', app.id)
        .maybeSingle()

      // 3. Fetch student
      const { data: student } = await supabase
        .from('students_tk')
        .select('*')
        .eq('nama', app.student_name)
        .eq('tanggal_lahir', app.birth_date)
        .maybeSingle()

      // 4. Fetch parent
      let parent = null
      if (student) {
        const { data: parentData } = await supabase
          .from('parents_tk')
          .select('*')
          .eq('student_id', student.id)
          .maybeSingle()
        parent = parentData
      }

      setSelectedDetails({
        docs: docs || [],
        payment: payment || null,
        student: student || null,
        parent: parent || null
      })
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat detail pendaftaran.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleRejectClick = (appId: string) => {
    setConfirmTitle('Tolak Pendaftaran')
    setConfirmMessage('Apakah Anda yakin ingin menolak pendaftaran ini? Status pendaftaran akan diubah menjadi Ditolak.')
    setOnConfirm(() => async () => {
      const { error } = await supabase
        .from('ppdb_tk')
        .update({ status: 'Ditolak' })
        .eq('id', appId)
      if (error) {
        toast.error('Gagal menolak pendaftaran: ' + error.message)
      } else {
        toast.success('Pendaftaran berhasil ditolak!')
        loadData()
      }
    })
    setConfirmOpen(true)
  }

  const handleDeleteClick = (appId: string) => {
    setConfirmTitle('Hapus Pendaftaran')
    setConfirmMessage('Apakah Anda yakin ingin menghapus pendaftaran ini secara permanen? Semua berkas dan data terkait akan ikut terhapus dari sistem.')
    setOnConfirm(() => async () => {
      setActionPendingId(appId)
      const { error } = await supabase.from('ppdb_tk').delete().eq('id', appId)
      setActionPendingId(null)
      if (error) {
        toast.error('Gagal menghapus pendaftaran: ' + error.message)
      } else {
        toast.success('Pendaftaran berhasil dihapus!')
        loadData()
      }
    })
    setConfirmOpen(true)
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
                        <Button
                          onClick={() => handleViewDetails(app)}
                          variant="outline"
                          className="border-blue-250 text-[#07265F] hover:bg-gray-50 rounded-lg text-xs py-1.5 px-3 h-auto cursor-pointer"
                        >
                          Detail
                        </Button>
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
                              onClick={() => handleRejectClick(app.id)}
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
                          onClick={() => handleDeleteClick(app.id)}
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
        <DialogContent className="rounded-[32px] w-full sm:max-w-md bg-white p-8">
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

      {/* PPDB DETAILS DIALOG */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-4xl bg-white p-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-black text-primary-blue">Detail Pendaftaran PPDB</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-gray-400">
                Data lengkap calon siswa dan berkas pendaftaran ananda <span className="font-bold text-primary-blue">{selectedApp?.student_name}</span>.
              </DialogDescription>
            </div>
            {selectedApp && getStatusBadge(selectedApp.status)}
          </DialogHeader>

          {loadingDetails ? (
            <div className="py-20 text-center text-gray-400 font-bold">Memuat detail data calon siswa...</div>
          ) : !selectedDetails ? (
            <div className="py-20 text-center text-red-500 font-bold">Gagal memuat data. Silakan coba lagi.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              {/* LEFT COLUMN: STUDENT & PARENT DETAILS */}
              <div className="space-y-6">
                {/* 1. DATA CALON SISWA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">1. Data Calon Siswa</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3 border border-gray-50 text-xs">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Nama Lengkap:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.student?.nama}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Tempat/Tgl Lahir:</span>
                      <span className="col-span-2 font-bold text-primary-blue">
                        {selectedDetails.student?.tempat_lahir || '-'}, {selectedDetails.student?.tanggal_lahir ? new Date(selectedDetails.student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Jenis Kelamin:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.student?.jenis_kelamin === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Agama:</span>
                      <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.student?.agama || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">NIK Anak:</span>
                      <span className="col-span-2 font-bold text-primary-blue font-mono">{selectedDetails.student?.nik || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">NISN Anak:</span>
                      <span className="col-span-2 font-bold text-primary-blue font-mono">{selectedDetails.student?.nisn || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-gray-400 font-semibold">Keluarga:</span>
                      <span className="col-span-2 font-bold text-primary-blue">Anak Ke-{selectedDetails.student?.anak_ke || '1'} dari {selectedDetails.student?.jml_saudara || '0'} bersaudara</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-200/60">
                      <span className="text-gray-400 font-semibold">Alamat:</span>
                      <span className="col-span-2 font-semibold text-primary-blue leading-relaxed">{selectedDetails.student?.alamat || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. DATA ORANG TUA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">2. Data Orang Tua</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-4 border border-gray-50 text-xs">
                    {/* AYAH */}
                    <div className="space-y-2 pb-3 border-b border-gray-200/60">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">👨 Identitas Ayah Kandung</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Nama Ayah:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.nama_ayah || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Pekerjaan:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.pekerjaan?.split('/')?.[0]?.trim() || '-'}</span>
                      </div>
                    </div>
                    {/* IBU */}
                    <div className="space-y-2">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">👩 Identitas Ibu Kandung</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Nama Ibu:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.nama_ibu || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Pekerjaan:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.pekerjaan?.split('/')?.[1]?.trim() || '-'}</span>
                      </div>
                    </div>
                    {/* CONTACT */}
                    <div className="space-y-2 pt-3 border-t border-gray-200/60">
                      <div className="font-extrabold text-primary-blue flex items-center gap-1.5">📞 Kontak & Alamat</div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">No. HP / WA:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.hp || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Email:</span>
                        <span className="col-span-2 font-bold text-primary-blue">{selectedDetails.parent?.email || '-'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-gray-400 font-semibold">Alamat Orang Tua:</span>
                        <span className="col-span-2 font-semibold text-primary-blue leading-relaxed">{selectedDetails.parent?.alamat || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DOCUMENTS & PAYMENT */}
              <div className="space-y-6">
                {/* 3. DOKUMEN BERKAS */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">3. Dokumen Lampiran</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-3 border border-gray-50 text-xs">
                    {selectedDetails.docs.length === 0 ? (
                      <div className="text-center text-gray-400 py-4 font-semibold">Tidak ada berkas yang diunggah.</div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedDetails.docs.map((doc: any) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#07A363]/30 transition-all">
                            <div>
                              <div className="font-bold text-primary-blue">{doc.type === 'kk' ? 'Kartu Keluarga' : doc.type === 'akta' ? 'Akta Kelahiran' : doc.type === 'foto_anak' ? 'Foto Anak' : doc.type === 'ktp_ayah' ? 'KTP Ayah' : doc.type === 'ktp_ibu' ? 'KTP Ibu' : doc.type}</div>
                              <div className="text-[10px] text-gray-400 font-medium">Dokumen PPDB</div>
                            </div>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#07265F]/5 hover:bg-[#07265F]/10 text-primary-blue hover:text-primary-blue/90 font-extrabold rounded-lg text-[10px] transition-colors"
                            >
                              Lihat Berkas
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. INFORMASI BIAYA & PEMBAYARAN */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary-green">4. Riwayat Pembayaran</h3>
                  <div className="bg-[#F8F6F2] rounded-2xl p-5 space-y-4 border border-gray-50 text-xs">
                    {!selectedDetails.payment ? (
                      <div className="text-center text-gray-400 py-4 font-semibold">Tidak ada data pembayaran.</div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-semibold">Metode Pembayaran:</span>
                            <Badge className="bg-blue-50 text-blue-700 border-none font-bold rounded-full">{selectedDetails.payment.method}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-semibold">Jumlah Biaya:</span>
                            <span className="font-bold text-primary-blue">Rp {parseFloat(selectedDetails.payment.amount).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400 font-semibold">Status:</span>
                            <Badge className={cn(
                              "border-none font-bold rounded-full",
                              selectedDetails.payment.status === 'Verified' ? "bg-emerald-100 text-emerald-800" :
                              selectedDetails.payment.status === 'Rejected' ? "bg-rose-100 text-rose-800" :
                              "bg-amber-100 text-amber-800"
                            )}>
                              {selectedDetails.payment.status === 'Verified' ? 'Diverifikasi' : 
                               selectedDetails.payment.status === 'Rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                            </Badge>
                          </div>
                        </div>

                        {selectedDetails.payment.proof && (
                          <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                            <span className="text-gray-400 font-semibold">Bukti Pembayaran:</span>
                            <a
                              href={selectedDetails.payment.proof}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-1.5 bg-[#07A363]/10 hover:bg-[#07A363]/25 text-[#07A363] font-extrabold rounded-lg text-[10px] transition-all"
                            >
                              Lihat Bukti Transfer
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DIALOG FOOTER ACTIONS */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end items-center">
            {selectedApp && ['Submitted', 'Verifikasi Berkas'].includes(selectedApp.status) && (
              <>
                <Button
                  onClick={() => {
                    setDetailsModalOpen(false)
                    handleApprove(selectedApp.id)
                  }}
                  disabled={actionPendingId === selectedApp.id}
                  className="bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl text-xs py-2.5 px-4 cursor-pointer"
                >
                  Terima Calon Siswa
                </Button>
                <Button
                  onClick={() => {
                    setDetailsModalOpen(false)
                    handleRejectClick(selectedApp.id)
                  }}
                  variant="outline"
                  className="border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl text-xs py-2.5 px-4 cursor-pointer"
                >
                  Tolak Pendaftaran
                </Button>
              </>
            )}
            <Button onClick={() => setDetailsModalOpen(false)} variant="outline" className="border-gray-200 hover:border-gray-300 font-bold rounded-xl text-xs py-2.5 px-5 cursor-pointer">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CUSTOM CONFIRMATION DIALOG */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="rounded-[32px] w-full sm:max-w-md bg-white p-8">
          <DialogHeader className="space-y-3 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <DialogTitle className="text-lg font-black text-primary-blue">{confirmTitle}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-semibold leading-relaxed">
              {confirmMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-6">
            <Button
              onClick={() => {
                setConfirmOpen(false)
                onConfirm()
              }}
              className="flex-1 bg-primary-green hover:bg-primary-green/90 text-white font-extrabold rounded-xl py-2.5 cursor-pointer"
            >
              Ya, Lanjutkan
            </Button>
            <Button
              onClick={() => setConfirmOpen(false)}
              variant="outline"
              className="flex-1 border-gray-200 hover:border-gray-300 font-bold rounded-xl py-2.5 cursor-pointer"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
