import { NextRequest, NextResponse } from 'next/server'
import { requestHasRole } from '@/lib/auth/request'
import { prisma } from '@/lib/prisma'

const tablesToExport: { table: string; model: string }[] = [
  { table: 'settings_tk', model: 'setting' },
  { table: 'users_tk', model: 'user' },
  { table: 'teachers_tk', model: 'teacher' },
  { table: 'classes_tk', model: 'class' },
  { table: 'students_tk', model: 'student' },
  { table: 'parents_tk', model: 'parent' },
  { table: 'ppdb_tk', model: 'ppdb' },
  { table: 'ppdb_documents_tk', model: 'ppdbDocument' },
  { table: 'galleries_tk', model: 'gallery' },
  { table: 'testimonials_tk', model: 'testimonial' },
  { table: 'announcements_tk', model: 'announcement' },
  { table: 'payments_tk', model: 'payment' },
  { table: 'attendance_tk', model: 'attendance' },
  { table: 'grades_tk', model: 'grade' },
  { table: 'materials_tk', model: 'material' },
  { table: 'schedules_tk', model: 'schedule' },
  { table: 'activity_logs_tk', model: 'activityLog' },
]

function formatSqlValue(val: any): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL'
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
  if (val instanceof Date) return `'${val.toISOString()}'`
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''")
    return `'${jsonStr}'::jsonb`
  }
  const str = String(val).replace(/'/g, "''")
  return `'${str}'`
}

export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await requestHasRole(req, ['super_admin', 'admin'])
    if (!isAuthorized) {
      return new NextResponse('-- Unauthorized: Super Admin role required', { status: 403 })
    }

    if (!prisma) {
      return new NextResponse('-- Database connection not available', { status: 500 })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const sqlChunks: string[] = []

    sqlChunks.push(`-- ==========================================================`)
    sqlChunks.push(`-- BACKUP DATABASE: KB & TK ISTIQAMAH`)
    sqlChunks.push(`-- Generated: ${new Date().toISOString()}`)
    sqlChunks.push(`-- Mode: PostgreSQL SQL Dump`)
    sqlChunks.push(`-- ==========================================================\n`)
    sqlChunks.push(`SET statement_timeout = 0;`)
    sqlChunks.push(`SET lock_timeout = 0;`)
    sqlChunks.push(`SET client_encoding = 'UTF8';\n`)

    for (const item of tablesToExport) {
      try {
        const delegate = (prisma as any)[item.model]
        if (!delegate || typeof delegate.findMany !== 'function') continue

        const rows = await delegate.findMany()
        sqlChunks.push(`-- Table: ${item.table} (${rows.length} rows)`)

        if (rows.length === 0) {
          sqlChunks.push(`-- (no data)\n`)
          continue
        }

        for (const row of rows) {
          const columns = Object.keys(row)
          const formattedCols = columns.map(c => `"${c}"`).join(', ')
          const formattedVals = columns.map(c => formatSqlValue(row[c])).join(', ')
          sqlChunks.push(`INSERT INTO "${item.table}" (${formattedCols}) VALUES (${formattedVals}) ON CONFLICT DO NOTHING;`)
        }
        sqlChunks.push('')
      } catch (err: any) {
        sqlChunks.push(`-- Error exporting table ${item.table}: ${err.message}\n`)
      }
    }

    const sqlContent = sqlChunks.join('\n')
    const filename = `backup_tk_istiqamah_${timestamp}.sql`

    return new NextResponse(sqlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error: any) {
    return new NextResponse(`-- Backup error: ${error.message}`, { status: 500 })
  }
}
