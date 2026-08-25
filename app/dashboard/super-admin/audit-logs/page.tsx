'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/database/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TablePagination, TableSearchFilter } from '@/components/ui/table-pagination'
import { History, RefreshCw, Activity } from 'lucide-react'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  const supabase = createClient()

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('activity_logs_tk')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    setLogs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return `${diff} detik lalu`
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !searchQuery ||
        (log.activity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user_id || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchSearch
    })
  }, [logs, searchQuery])

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Audit Log</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Rekam jejak seluruh aktivitas sistem portal KB & TK Istiqamah.</p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
          <RefreshCw size={14} /> Muat Ulang
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-blue/10 text-primary-blue rounded-2xl flex items-center justify-center"><History size={22} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Log Tercatat</div>
              <div className="text-2xl font-black text-primary-blue">{logs.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-3xl shadow-sm border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-green/10 text-primary-green rounded-2xl flex items-center justify-center"><Activity size={22} /></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-gray-400">Hasil Pencarian</div>
              <div className="text-2xl font-black text-primary-blue">{filteredLogs.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Card */}
      <Card className="bg-white rounded-[32px] shadow-sm border-none overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-black text-primary-blue flex items-center gap-2">
              <History className="text-primary-green" size={20} />
              Riwayat Aktivitas Sistem
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-gray-400">Aktivitas real-time yang terjadi di sistem portal sekolah ({filteredLogs.length} aktivitas).</CardDescription>
          </div>

          <TableSearchFilter
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder="Cari aktivitas atau user..."
          />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Memuat log aktivitas...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada catatan aktivitas yang sesuai.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedLogs.map((log) => (
                <div key={log.id} className="px-8 py-4.5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:bg-gray-50/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary-blue/5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity size={14} className="text-primary-blue/60" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-blue leading-relaxed">{log.activity}</p>
                      {log.user_id && (
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          User ID: {String(log.user_id).substring(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Badge className="bg-gray-100 text-gray-500 border-none font-bold rounded-full px-2.5 py-0.5 text-[10px] whitespace-nowrap">
                      {timeAgo(log.created_at)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 15, 25, 50]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
