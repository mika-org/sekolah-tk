'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UploadCloud,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Users,
  Check,
  Copy,
  ArrowRight,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Info,
  DollarSign,
  UserCheck,
  Calendar,
  Lock,
  Eye,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  importPaidStudentsAction,
  getExistingClassesAction,
  type StudentImportRow,
  type ImportResultItem,
} from '@/actions/import-students'

interface ParsedRowWithValidation extends StudentImportRow {
  rowNumber: number
  isValid: boolean
  errors: string[]
}

const TEMPLATE_SAMPLE_ROWS: any[] = [
  {
    'NAMA ANAK': 'Muhammad Althaf Karim',
    'L/P': 'L',
    'KLP': 'TK A',
    'TEMPAT LAHIR': 'Balikpapan',
    'Tanggal Lahir': '2020-05-14',
    'TANGGAL SEKOLAH': '2026-07-15',
    'UMUR/JULI': '6 Th 2 Bln',
    'NAMA ORANG TUA': 'Bambang Haryanto',
    'ALAMAT': 'Jl. MT Haryono No. 45, Balikpapan',
    'NO TLP/HP': '081234567890',
    'KETERANGAN': 'Lunas',
  },
  {
    'NAMA ANAK': 'Aisyah Nur Salsabila',
    'L/P': 'P',
    'KLP': 'TK A',
    'TEMPAT LAHIR': 'Balikpapan',
    'Tanggal Lahir': '18/02/2021',
    'TANGGAL SEKOLAH': '2026-07-15',
    'UMUR/JULI': '5 Th 5 Bln',
    'NAMA ORANG TUA': 'Nurul Hasanah',
    'ALAMAT': 'Jl. Jenderal Sudirman No. 12',
    'NO TLP/HP': '085298765432',
    'KETERANGAN': 'Lunas',
  },
]

export default function ImportStudentsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  const [fileName, setFileName] = useState<string>('')
  const [fileSize, setFileSize] = useState<string>('')
  const [rows, setRows] = useState<ParsedRowWithValidation[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showGuidelineModal, setShowGuidelineModal] = useState(false)

  // Result state
  const [importSummary, setImportSummary] = useState<{
    totalProcessed: number
    totalSuccess: number
    totalFailed: number
    results: ImportResultItem[]
  } | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  useEffect(() => {
    async function loadClasses() {
      setLoadingClasses(true)
      const res = await getExistingClassesAction()
      if (res.success && res.classes) {
        setAvailableClasses(res.classes)
      }
      setLoadingClasses(false)
    }
    loadClasses()
  }, [])

  // Validation engine for a single row
  function validateRow(row: StudentImportRow, index: number): ParsedRowWithValidation {
    const errors: string[] = []

    // 1. Nama Anak (Wajib)
    if (!row.nama_siswa || row.nama_siswa.trim().length < 2) {
      errors.push('NAMA ANAK wajib diisi (minimal 2 karakter)')
    }

    // 2. Tanggal Lahir (Wajib)
    if (!row.tanggal_lahir || !row.tanggal_lahir.toString().trim()) {
      errors.push('Tanggal Lahir wajib diisi (format: YYYY-MM-DD atau DD/MM/YYYY)')
    }

    // 3. L/P (Wajib: L / P)
    const gender = (row.jenis_kelamin || '').trim().toUpperCase()
    if (!gender || (!gender.startsWith('L') && !gender.startsWith('P'))) {
      errors.push('L/P wajib diisi ("L" untuk Laki-laki atau "P" untuk Perempuan)')
    }

    // 4. NAMA ORANG TUA (Wajib)
    const hasOrtu = Boolean(row.nama_orang_tua && row.nama_orang_tua.trim())
    const hasAyah = Boolean(row.nama_ayah && row.nama_ayah.trim())
    const hasIbu = Boolean(row.nama_ibu && row.nama_ibu.trim())
    if (!hasOrtu && !hasAyah && !hasIbu) {
      errors.push('NAMA ORANG TUA wajib diisi')
    }

    return {
      ...row,
      rowNumber: index + 1,
      isValid: errors.length === 0,
      errors,
    }
  }

  // Parse raw sheet data
  function parseAndSetData(rawObjects: any[], sourceName: string) {
    if (!rawObjects || rawObjects.length === 0) {
      toast.error('Berkas tidak memuat data baris yang dapat dibaca.')
      return
    }

    const normalizedRows: StudentImportRow[] = rawObjects.map((item: any) => {
      // Find key matching ignoring case & spaces & slashes
      const findVal = (possibleKeys: string[]) => {
        for (const key of Object.keys(item)) {
          const cleanKey = key.trim().toLowerCase().replace(/[\s_\-/.]/g, '')
          for (const pk of possibleKeys) {
            const cleanPk = pk.trim().toLowerCase().replace(/[\s_\-/.]/g, '')
            if (cleanKey === cleanPk) return item[key]
          }
        }
        return ''
      }

      return {
        nama_siswa: String(findVal(['nama_anak', 'namaanak', 'nama_siswa', 'namasidwa', 'nama', 'namalengkap', 'namamurid']) || '').trim(),
        jenis_kelamin: String(findVal(['l/p', 'lp', 'jenis_kelamin', 'jeniskelamin', 'jk', 'gender']) || '').trim(),
        nama_kelas: String(findVal(['klp', 'kelompok', 'nama_kelas', 'namakelas', 'kelas', 'rombel']) || '').trim(),
        kelompok: String(findVal(['klp', 'kelompok']) || '').trim(),
        tempat_lahir: String(findVal(['tempat_lahir', 'tempatlahir', 'kotalahir']) || '').trim(),
        tanggal_lahir: String(findVal(['tanggal_lahir', 'tanggallahir', 'tgllahir', 'birth_date', 'birthdate']) || '').trim(),
        tanggal_sekolah: String(findVal(['tanggal_sekolah', 'tanggalsekolah', 'tgl_sekolah', 'tglsekolah', 'tanggal_masuk']) || '').trim(),
        umur_juli: String(findVal(['umur/juli', 'umurjuli', 'usia/juli', 'usiajuli', 'umur']) || '').trim(),
        nama_orang_tua: String(findVal(['nama_orang_tua', 'namaorangtua', 'orang_tua', 'orangtua', 'wali']) || '').trim(),
        nama_ayah: String(findVal(['nama_ayah', 'namaayah', 'ayah']) || '').trim(),
        nama_ibu: String(findVal(['nama_ibu', 'namaibu', 'ibu']) || '').trim(),
        alamat: String(findVal(['alamat', 'domisili', 'alamatrumah']) || '').trim(),
        no_hp: String(findVal(['no_tlp/hp', 'notlphp', 'no_tlp_hp', 'no_hp', 'nohp', 'hp', 'telepon', 'telp', 'whatsapp', 'wa', 'no_wa']) || '').trim(),
        keterangan: String(findVal(['keterangan', 'ket', 'notes', 'catatan']) || '').trim(),
        nik: String(findVal(['nik', 'nikanak']) || '').trim(),
        nisn: String(findVal(['nisn']) || '').trim(),
        agama: String(findVal(['agama']) || 'Islam').trim(),
        email_ortu: String(findVal(['email_ortu', 'email', 'emailorangtua']) || '').trim(),
        pekerjaan_ortu: String(findVal(['pekerjaan_ortu', 'pekerjaan', 'pekerjaanortu']) || '').trim(),
        nominal_bayar: findVal(['nominal_bayar', 'nominal', 'biaya', 'jumlah_bayar']) || 1500000,
        metode_bayar: String(findVal(['metode_bayar', 'metode', 'carabayar']) || 'Transfer Bank').trim(),
        tanggal_bayar: String(findVal(['tanggal_bayar', 'tgl_bayar', 'tglbayar', 'tanggal_sekolah', 'tanggalsekolah']) || '').trim(),
      }
    })

    const validated = normalizedRows.map((r, i) => validateRow(r, i))
    setRows(validated)
    setFileName(sourceName)

    const validCount = validated.filter((r) => r.isValid).length
    const errorCount = validated.length - validCount
    if (errorCount > 0) {
      toast.warning(`${validated.length} data dimuat: ${validCount} siap diimport, ${errorCount} perlu perbaikan data.`)
    } else {
      toast.success(`${validated.length} data siswa berhasil dimuat dan seluruhnya valid!`)
    }
  }

  // Handle file drop or selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileSize(`${(file.size / 1024).toFixed(1)} KB`)
    const reader = new FileReader()

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' })
        parseAndSetData(data, file.name)
      } catch (err: any) {
        console.error('File reading error:', err)
        toast.error('Gagal membaca berkas: Pastikan format .xlsx atau .csv valid.')
      }
    }

    reader.readAsBinaryString(file)
  }

  // Load sample demo data
  const handleLoadSample = () => {
    parseAndSetData(TEMPLATE_SAMPLE_ROWS, 'Sample_Demo_Siswa_Lunas.xlsx')
    setFileSize('12.5 KB')
  }

  // Clear loaded data
  const handleClear = () => {
    setRows([])
    setFileName('')
    setFileSize('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.info('Data pratinjau dibersihkan.')
  }

  // Download Excel template
  const handleDownloadExcelTemplate = () => {
    try {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(TEMPLATE_SAMPLE_ROWS)

      // Column widths
      ws['!cols'] = [
        { wch: 25 }, // NAMA ANAK
        { wch: 8 },  // L/P
        { wch: 10 }, // KLP
        { wch: 16 }, // TEMPAT LAHIR
        { wch: 14 }, // Tanggal Lahir
        { wch: 16 }, // TANGGAL SEKOLAH
        { wch: 13 }, // UMUR/JULI
        { wch: 22 }, // NAMA ORANG TUA
        { wch: 30 }, // ALAMAT
        { wch: 16 }, // NO TLP/HP
        { wch: 14 }, // KETERANGAN
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa')
      XLSX.writeFile(wb, 'Format_Import_Data_Siswa_TK.xlsx')
      toast.success('Template Excel berhasil diunduh.')
    } catch (err: any) {
      toast.error('Gagal membuat template Excel: ' + err.message)
    }
  }

  // Download CSV template
  const handleDownloadCsvTemplate = () => {
    try {
      const headers = [
        'NAMA ANAK',
        'L/P',
        'KLP',
        'TEMPAT LAHIR',
        'Tanggal Lahir',
        'TANGGAL SEKOLAH',
        'UMUR/JULI',
        'NAMA ORANG TUA',
        'ALAMAT',
        'NO TLP/HP',
        'KETERANGAN',
      ]

      const sample1 = [
        'Muhammad Althaf Karim',
        'L',
        'TK A',
        'Balikpapan',
        '2020-05-14',
        '2026-07-15',
        '6 Th 2 Bln',
        'Bambang Haryanto',
        'Jl. MT Haryono No. 45, Balikpapan',
        '081234567890',
        'Lunas',
      ]

      const sample2 = [
        'Aisyah Nur Salsabila',
        'P',
        'TK A',
        'Balikpapan',
        '18/02/2021',
        '2026-07-15',
        '5 Th 5 Bln',
        'Nurul Hasanah',
        'Jl. Jenderal Sudirman No. 12',
        '085298765432',
        'Lunas',
      ]

      const csvContent =
        '\uFEFF' +
        [headers.join(','), sample1.map((s) => `"${s}"`).join(','), sample2.map((s) => `"${s}"`).join(',')].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'Format_Import_Data_Siswa_TK.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Template CSV berhasil diunduh.')
    } catch (err: any) {
      toast.error('Gagal membuat template CSV: ' + err.message)
    }
  }


  // Execute Import
  const handleExecuteImport = async () => {
    const validRows = rows.filter((r) => r.isValid)
    if (validRows.length === 0) {
      toast.error('Tidak ada data valid yang dapat diimport. Harap periksa tanda merah pada tabel.')
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading(`Sedang memproses ${validRows.length} data siswa...`)

    try {
      const res = await importPaidStudentsAction(validRows)
      toast.dismiss(toastId)

      if (res.success) {
        setImportSummary({
          totalProcessed: res.totalProcessed,
          totalSuccess: res.totalSuccess,
          totalFailed: res.totalFailed,
          results: res.results,
        })
        setShowResultModal(true)
        toast.success(`Berhasil mengimport ${res.totalSuccess} data siswa!`)
        // Clear preview rows to prevent accidental re-import
        setRows([])
        setFileName('')
      } else {
        toast.error(res.error || 'Terjadi kesalahan saat memproses data.')
      }
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error('Gagal memproses import: ' + err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Copy single account
  const copyAccount = (res: ImportResultItem, index: number) => {
    if (!res.username || !res.password) return
    const text = `Siswa: ${res.studentName}\nUsername Ortu: ${res.username}\nPassword: ${res.password}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success(`Kredensial ${res.studentName} disalin!`)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Copy all accounts
  const copyAllAccounts = () => {
    if (!importSummary?.results) return
    const successfulItems = importSummary.results.filter((r) => r.status === 'success')
    const formatted = successfulItems
      .map(
        (r, i) =>
          `${i + 1}. ${r.studentName} | Kelas: ${r.className || '-'} | Username: ${r.username} | Password: ${r.password}`
      )
      .join('\n')

    navigator.clipboard.writeText(`DAFTAR AKUN PORTAL ORANG TUA (SISWA BARU LUNAS)\n=========================================\n${formatted}`)
    setCopiedAll(true)
    toast.success(`${successfulItems.length} akun disalin ke clipboard!`)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  // Export created accounts to Excel
  const handleExportAccountsToExcel = () => {
    if (!importSummary?.results) return
    try {
      const successfulItems = importSummary.results.filter((r) => r.status === 'success')
      const exportData = successfulItems.map((r, i) => ({
        No: i + 1,
        'Nama Siswa': r.studentName,
        Kelas: r.className || 'Belum di-plot',
        'Username Orang Tua': r.username,
        'Password Awal': r.password,
        'Status Akun': 'Aktif',
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)
      ws['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 15 }, { wch: 22 }, { wch: 18 }, { wch: 12 }]
      XLSX.utils.book_append_sheet(wb, ws, 'Akun_Orang_Tua')
      XLSX.writeFile(wb, `Rekap_Akun_Ortu_Import_${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success('Rekap akun berhasil diunduh ke Excel!')
    } catch (e: any) {
      toast.error('Gagal mengunduh Excel: ' + e.message)
    }
  }

  const validCount = rows.filter((r) => r.isValid).length
  const invalidCount = rows.length - validCount

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/dashboard/admin" className="hover:text-primary-blue transition-colors">
              Admin
            </Link>
            <span>/</span>
            <Link href="/dashboard/admin/ppdb" className="hover:text-primary-blue transition-colors">
              SPMB & Kesiswaan
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Import Siswa Lunas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#07265F] tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-[#07A363]" />
            Import Data Siswa Lunas
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl">
            Unggah data siswa baru yang sudah mendaftar dan lunas. Sistem otomatis mencatat pendaftaran (Diterima),
            pembayaran (Verified), akun portal orang tua, dan murid aktif.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuidelineModal(true)}
            className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-primary-blue" />
            Kamus Data & Kolom
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadExcelTemplate}
            className="border-[#07A363]/30 text-[#07A363] hover:bg-[#07A363]/10 flex items-center gap-2 font-medium"
          >
            <Download className="w-4 h-4" />
            Download Template (.xlsx)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsvTemplate}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            Template CSV (.csv)
          </Button>
        </div>
      </div>

      {/* Quick Info & Column Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Mandatory Fields */}
        <Card className="border-red-100 bg-red-50/40 shadow-sm rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Kolom Wajib (Tidak Boleh Kosong)
              </span>
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-0.5">Wajib Diisi</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-gray-700 space-y-2">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-gray-900">NAMA ANAK:</strong> Nama lengkap anak sesuai Akta/KK.
              </li>
              <li>
                <strong className="text-gray-900">L/P:</strong> Jenis kelamin (<code className="bg-red-100 px-1 py-0.5 rounded font-mono text-red-800">L</code> atau <code className="bg-red-100 px-1 py-0.5 rounded font-mono text-red-800">P</code>).
              </li>
              <li>
                <strong className="text-gray-900">Tanggal Lahir:</strong> Format YYYY-MM-DD atau DD/MM/YYYY.
              </li>
              <li>
                <strong className="text-gray-900">NAMA ORANG TUA:</strong> Nama ayah / ibu / wali murid.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Card 2: Optional Fields */}
        <Card className="border-emerald-100 bg-emerald-50/40 shadow-sm rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#07A363] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#07A363]" />
                Kolom Fleksibel (Boleh Kosong)
              </span>
              <Badge variant="outline" className="border-emerald-300 text-emerald-800 text-[10px] px-2 py-0.5">
                Bisa Kosong
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-gray-700 space-y-1.5">
            <p className="text-[11px] text-gray-500 mb-1">Boleh dikosongkan jika belum ada data:</p>
            <div className="flex flex-wrap gap-1">
              {[
                'KLP',
                'TEMPAT LAHIR',
                'TANGGAL SEKOLAH',
                'UMUR/JULI',
                'ALAMAT',
                'NO TLP/HP',
                'KETERANGAN',
              ].map((item) => (
                <span key={item} className="bg-white border border-emerald-200 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-mono">
                  {item}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Auto Automation */}
        <Card className="border-blue-100 bg-blue-50/40 shadow-sm rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#07265F] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#07265F]" />
                Otomatisasi Sistem
              </span>
              <Badge className="bg-[#07265F] text-white text-[10px] px-2 py-0.5">Instant</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-gray-700 space-y-1.5">
            <p>
              🔐 <strong>Akun Orang Tua:</strong> Username <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-blue-900">ortu_nama</code> & Password awal otomatis dari tanggal lahir (<code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-blue-900">DDMMYYYY</code>).
            </p>
            <p>
              ✅ <strong>Status:</strong> PPDB Diterima & Pembayaran Lunas (Verified).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dropzone Section */}
      <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-6 md:p-8">
          <div className="border-2 border-dashed border-gray-200 hover:border-[#07A363] transition-colors rounded-2xl p-6 md:p-10 text-center bg-[#F8F6F2]/50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
              id="file-upload-input"
            />

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#07A363] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Pilih atau Tarik Berkas Excel / CSV Anda ke Sini
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
              Mendukung format Microsoft Excel (<strong>.xlsx</strong>, <strong>.xls</strong>) dan Comma-Separated Values (<strong>.csv</strong>).
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <label htmlFor="file-upload-input">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#07A363] hover:bg-[#068f56] text-white font-semibold px-6 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Pilih Berkas dari Komputer
                </Button>
              </label>

              <Button
                type="button"
                variant="outline"
                onClick={handleLoadSample}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Muat Contoh Data Uji Coba
              </Button>
            </div>

            {fileName && (
              <div className="mt-6 inline-flex items-center gap-3 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs text-gray-700 shadow-sm">
                <FileCheck className="w-4 h-4 text-[#07A363]" />
                <span className="font-semibold text-gray-900">{fileName}</span>
                <span className="text-gray-400">({fileSize})</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-700 ml-2 font-medium"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      {rows.length > 0 && (
        <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="p-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <span>Pratinjau & Validasi Data Siswa</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {rows.length} Baris Terbaca
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 mt-1">
                  Periksa kembali kolom data sebelum dieksekusi. Baris dengan indikator hijau siap dimasukkan ke database.
                </CardDescription>
              </div>

              {/* Status Counters & Import Button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#07A363] border border-emerald-200 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {validCount} Siap Import
                  </span>
                  {invalidCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {invalidCount} Ada Masalah
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleExecuteImport}
                  disabled={validCount === 0 || isProcessing}
                  className="bg-[#07265F] hover:bg-[#0a3582] text-white font-bold px-6 shadow-md flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memproses Import...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Proses Import ({validCount} Murid Siap)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Table Container */}
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#F8F6F2] text-gray-700 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 z-10">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 w-24">Status</th>
                  <th className="py-3 px-4 min-w-[170px]">NAMA ANAK (Wajib)</th>
                  <th className="py-3 px-2 w-16 text-center">L/P (Wajib)</th>
                  <th className="py-3 px-3 min-w-[80px]">KLP</th>
                  <th className="py-3 px-3 min-w-[110px]">TEMPAT LAHIR</th>
                  <th className="py-3 px-3 min-w-[110px]">Tanggal Lahir (Wajib)</th>
                  <th className="py-3 px-3 min-w-[110px]">TANGGAL SEKOLAH</th>
                  <th className="py-3 px-3 min-w-[90px]">UMUR/JULI</th>
                  <th className="py-3 px-4 min-w-[160px]">NAMA ORANG TUA (Wajib)</th>
                  <th className="py-3 px-3 min-w-[120px]">NO TLP/HP</th>
                  <th className="py-3 px-4 min-w-[150px]">ALAMAT</th>
                  <th className="py-3 px-3 min-w-[100px]">KETERANGAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {rows.map((row) => {
                  return (
                    <tr
                      key={row.rowNumber}
                      className={row.isValid ? 'hover:bg-gray-50/70 transition-colors' : 'bg-red-50/40 hover:bg-red-50/70'}
                    >
                      <td className="py-3 px-3 text-center font-mono text-gray-400 font-medium">
                        {row.rowNumber}
                      </td>

                      {/* Status badge */}
                      <td className="py-3 px-3">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Valid
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              Error
                            </span>
                            <p className="text-[10px] text-red-600 leading-tight">
                              {row.errors[0]}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Nama Anak */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{row.nama_siswa || <span className="text-red-500 italic">Kosong</span>}</div>
                      </td>

                      {/* L/P */}
                      <td className="py-3 px-2 text-center">
                        {row.jenis_kelamin?.toUpperCase().startsWith('L') ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                            L
                          </span>
                        ) : row.jenis_kelamin?.toUpperCase().startsWith('P') ? (
                          <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold text-[10px]">
                            P
                          </span>
                        ) : (
                          <span className="text-red-500 italic">?</span>
                        )}
                      </td>

                      {/* KLP */}
                      <td className="py-3 px-3">
                        {row.nama_kelas || row.kelompok ? (
                          <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {row.nama_kelas || row.kelompok}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* TEMPAT LAHIR */}
                      <td className="py-3 px-3 text-gray-700">
                        {row.tempat_lahir || <span className="text-gray-400">-</span>}
                      </td>

                      {/* Tanggal Lahir */}
                      <td className="py-3 px-3 font-mono">
                        {row.tanggal_lahir ? (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">
                            {row.tanggal_lahir}
                          </span>
                        ) : (
                          <span className="text-red-500 italic text-[11px]">Wajib diisi</span>
                        )}
                      </td>

                      {/* TANGGAL SEKOLAH */}
                      <td className="py-3 px-3 text-gray-700">
                        {row.tanggal_sekolah || <span className="text-gray-400">-</span>}
                      </td>

                      {/* UMUR/JULI */}
                      <td className="py-3 px-3 text-gray-700">
                        {row.umur_juli || <span className="text-gray-400">-</span>}
                      </td>

                      {/* NAMA ORANG TUA */}
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {row.nama_orang_tua || row.nama_ayah || row.nama_ibu || (
                          <span className="text-red-500 italic text-[11px]">Belum diisi</span>
                        )}
                      </td>

                      {/* NO TLP/HP */}
                      <td className="py-3 px-3 font-mono text-[11px] text-gray-700">
                        {row.no_hp || <span className="text-gray-400">-</span>}
                      </td>

                      {/* ALAMAT */}
                      <td className="py-3 px-4 text-gray-600 truncate max-w-[200px]" title={row.alamat}>
                        {row.alamat || <span className="text-gray-400">-</span>}
                      </td>

                      {/* KETERANGAN */}
                      <td className="py-3 px-3">
                        <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {row.keterangan || 'Lunas'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}


      {/* Modal: Kamus Data & Panduan Lengkap */}
      <Dialog open={showGuidelineModal} onOpenChange={setShowGuidelineModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#07265F] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#07A363]" />
              Kamus Kolom & Aturan Import Data Siswa
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Panduan lengkap format berkas Excel atau CSV untuk data siswa yang sudah mendaftar dan lunas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-xs text-gray-700">
            {/* Table of columns */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8F6F2] font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5">Nama Kolom Header</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Format / Ketentuan</th>
                    <th className="p-2.5">Contoh Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-red-50/30">
                    <td className="p-2.5 font-mono font-bold text-gray-900">nama_siswa</td>
                    <td className="p-2.5">
                      <Badge className="bg-red-500 text-white text-[10px]">Wajib (Not Null)</Badge>
                    </td>
                    <td className="p-2.5">Nama lengkap murid sesuai akta/KK.</td>
                    <td className="p-2.5 text-gray-600">Muhammad Althaf Karim</td>
                  </tr>
                  <tr className="bg-red-50/30">
                    <td className="p-2.5 font-mono font-bold text-gray-900">tanggal_lahir</td>
                    <td className="p-2.5">
                      <Badge className="bg-red-500 text-white text-[10px]">Wajib (Not Null)</Badge>
                    </td>
                    <td className="p-2.5">Format YYYY-MM-DD atau DD/MM/YYYY. Digunakan untuk password awal.</td>
                    <td className="p-2.5 text-gray-600">2020-05-14</td>
                  </tr>
                  <tr className="bg-red-50/30">
                    <td className="p-2.5 font-mono font-bold text-gray-900">jenis_kelamin</td>
                    <td className="p-2.5">
                      <Badge className="bg-red-500 text-white text-[10px]">Wajib (Not Null)</Badge>
                    </td>
                    <td className="p-2.5">"L" (Laki-laki) atau "P" (Perempuan).</td>
                    <td className="p-2.5 text-gray-600">L</td>
                  </tr>
                  <tr className="bg-red-50/30">
                    <td className="p-2.5 font-mono font-bold text-gray-900">nama_ayah / nama_ibu</td>
                    <td className="p-2.5">
                      <Badge className="bg-red-500 text-white text-[10px]">Wajib Salah Satu</Badge>
                    </td>
                    <td className="p-2.5">Boleh hanya Ayah, hanya Ibu, atau keduanya terisi.</td>
                    <td className="p-2.5 text-gray-600">Bambang Haryanto</td>
                  </tr>

                  {/* Optionals */}
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">nik</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong</Badge>
                    </td>
                    <td className="p-2.5">16 digit angka jika sudah ada KIA/NIK.</td>
                    <td className="p-2.5 text-gray-600">6471011405200001</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">nisn</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong</Badge>
                    </td>
                    <td className="p-2.5">10 digit angka jika ada.</td>
                    <td className="p-2.5 text-gray-600">3201456789</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">tempat_lahir</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong</Badge>
                    </td>
                    <td className="p-2.5">Kota tempat kelahiran anak.</td>
                    <td className="p-2.5 text-gray-600">Balikpapan</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">agama</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong (Default: Islam)</Badge>
                    </td>
                    <td className="p-2.5">Islam / Kristen / Katolik / dll.</td>
                    <td className="p-2.5 text-gray-600">Islam</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">alamat</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong</Badge>
                    </td>
                    <td className="p-2.5">Alamat rumah domisili.</td>
                    <td className="p-2.5 text-gray-600">Jl. MT Haryono No. 45</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">no_hp</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong</Badge>
                    </td>
                    <td className="p-2.5">Nomor WhatsApp/HP orang tua.</td>
                    <td className="p-2.5 text-gray-600">081234567890</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">email_ortu</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong (Auto Buat)</Badge>
                    </td>
                    <td className="p-2.5">Jika kosong, dibuatkan email sistem otomatis.</td>
                    <td className="p-2.5 text-gray-600">bambang@gmail.com</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">nama_kelas</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong</Badge>
                    </td>
                    <td className="p-2.5">Nama rombel/kelas untuk plotting langsung.</td>
                    <td className="p-2.5 text-gray-600">TK A1</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-mono text-gray-800">nominal_bayar</td>
                    <td className="p-2.5">
                      <Badge variant="outline" className="text-gray-600 text-[10px]">Boleh Kosong (Default: 1.500.000)</Badge>
                    </td>
                    <td className="p-2.5">Nominal biaya pendaftaran lunas.</td>
                    <td className="p-2.5 text-gray-600">1500000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note about credentials */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 space-y-1">
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-700" />
                Ketentuan Password & Login Orang Tua
              </h4>
              <p className="text-[11px] leading-relaxed">
                Setiap siswa yang diimport akan dibuatkan akun portal orang tua dengan <strong>Username:</strong> <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">ortu_[namasiswa]</code> dan <strong>Password Awal:</strong> tanggal lahir format <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">DDMMYYYY</code> (misal lahir 14 Mei 2020 maka password adalah <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">14052020</code>).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowGuidelineModal(false)} className="bg-gray-900 text-white text-xs">
              Tutup Panduan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Hasil Import & Daftar Akun Kredensial Baru */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#07265F] flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#07A363]" />
              Import Siswa Lunas Berhasil Selesai!
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Berikut adalah ringkasan proses dan daftar akun portal orang tua yang telah aktif. Simpan atau bagikan kredensial ini kepada orang tua.
            </DialogDescription>
          </DialogHeader>

          {importSummary && (
            <div className="space-y-6">
              {/* Stat counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 font-medium">Total Diproses</div>
                  <div className="text-xl font-extrabold text-gray-900 mt-1">{importSummary.totalProcessed}</div>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <div className="text-xs text-emerald-700 font-semibold">Berhasil Didaftarkan</div>
                  <div className="text-xl font-extrabold text-[#07A363] mt-1">{importSummary.totalSuccess}</div>
                </div>
                <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="text-xs text-red-600 font-medium">Gagal / Dilewati</div>
                  <div className="text-xl font-extrabold text-red-600 mt-1">{importSummary.totalFailed}</div>
                </div>
              </div>

              {/* Action buttons on accounts */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8F6F2] p-3 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-800">
                  Daftar Kredensial Login Orang Tua ({importSummary.results.filter((r) => r.status === 'success').length} Akun)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAllAccounts}
                    className="text-xs border-gray-300 flex items-center gap-1.5"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAll ? 'Tersalin!' : 'Salin Semua Akun (Text)'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExportAccountsToExcel}
                    className="text-xs bg-[#07A363] hover:bg-[#068f56] text-white flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Rekap Akun (.xlsx)
                  </Button>
                </div>
              </div>

              {/* Table of accounts */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-[320px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#F8F6F2] font-bold text-gray-700 text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">Username Ortu</th>
                      <th className="py-2.5 px-3">Password Awal</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importSummary.results.map((item, idx) => {
                      if (item.status !== 'success') {
                        return (
                          <tr key={idx} className="bg-red-50/50">
                            <td className="py-2.5 px-3 text-gray-400 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-semibold text-gray-800">{item.studentName}</td>
                            <td colSpan={3} className="py-2.5 px-3 text-red-600 font-medium">
                              Gagal: {item.error}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <Badge className="bg-red-100 text-red-800 text-[10px]">Gagal</Badge>
                            </td>
                          </tr>
                        )
                      }

                      return (
                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-gray-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-gray-900">{item.studentName}</td>
                          <td className="py-2.5 px-3 text-gray-700">
                            {item.className ? (
                              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                                {item.className}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Belum di-plot</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-primary-blue">
                            {item.username}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold bg-emerald-50/50">
                            {item.password}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyAccount(item, idx)}
                              className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              {copiedIndex === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter className="flex sm:justify-between items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/super-admin/students')}
              className="text-xs border-gray-300 text-gray-700 flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-primary-blue" />
              Buka Master Data Murid
            </Button>
            <Button
              onClick={() => setShowResultModal(false)}
              className="bg-[#07265F] hover:bg-[#0a3582] text-white text-xs"
            >
              Selesai & Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
