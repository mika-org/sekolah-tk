import { NextRequest, NextResponse } from 'next/server'
import { requestHasRole } from '@/lib/auth/request'
import { importPaidStudentsAction, type StudentImportRow } from '@/actions/import-students'

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await requestHasRole(req, ['super_admin', 'admin'])
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesi login Anda telah berakhir atau akun tidak memiliki hak akses. Silakan login kembali.',
          isAuthError: true,
        },
        { status: 401 }
      )
    }

    const body = await req.json()
    const rows: StudentImportRow[] = body?.rows || []

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak ada data siswa yang dikirimkan.',
        },
        { status: 400 }
      )
    }

    const result = await importPaidStudentsAction(rows)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('API /api/admin/import-students error:', err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Terjadi kesalahan sistem di server saat memproses import.',
      },
      { status: 500 }
    )
  }
}
