'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { History, RefreshCw, Activity } from 'lucide-react'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const supabase = createClient()

  const loadData = async (p = 0) => {
    setLoading(true)
    const { data } = await supabase
      .from('activity_logs_tk')
      .select('*')
      .order('created_at', { ascending: false })
      .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)
    setLogs(data || [])
    setPage(p)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return `${diff} detik lalu`
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Audit Log</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Rekam jejak seluruh aktivitas sistem portal KB & TK Istiqamah.</p>
        </div>
        <Button onClick={() => loadData(0)} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
          <RefreshCw size={14} /> Muat Ulang
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center"><History size={22} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Aktivitas Ditampilkan</div>
              <div className="text-2xl font-black text-primary-blue">{logs.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center"><Activity size={22} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Halaman</div>
              <div className="text-2xl font-black text-primary-blue">{page + 1}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
              <History className="text-primary-green" size={20} />
              Riwayat Aktivitas Sistem
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Aktivitas real-time yang terjadi di sistem portal sekolah.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat log aktivitas...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Belum ada catatan aktivitas.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log, i) => (
                <div key={log.id} className="px-8 py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:bg-gray-50/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary-blue/5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity size={14} className="text-primary-blue/60" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-blue leading-relaxed">{log.activity}</p>
                      {log.user_id && (
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          User ID: {log.user_id.substring(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-500 border-none font-bold rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap">
                      {timeAgo(log.created_at)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-3">
        <Button onClick={() => loadData(page - 1)} disabled={page === 0 || loading} variant="outline" className="rounded-xl font-bold text-xs border-gray-200 cursor-pointer">
          ← Sebelumnya
        </Button>
        <div className="flex items-center px-4 bg-white rounded-xl text-xs font-bold text-primary-blue border border-gray-100">
          Hal. {page + 1}
        </div>
        <Button onClick={() => loadData(page + 1)} disabled={logs.length < PAGE_SIZE || loading} variant="outline" className="rounded-xl font-bold text-xs border-gray-200 cursor-pointer">
          Selanjutnya →
        </Button>
      </div>
    </div>
  )
}
