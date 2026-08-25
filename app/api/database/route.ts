import { NextRequest, NextResponse } from 'next/server'
import { executeDatabaseQuery } from '@/lib/database/execute'
import type { DatabaseQuery } from '@/lib/database/query-builder'
import { getRequestUser } from '@/lib/auth/request'

const publicReadTables = new Set(['galleries_tk', 'testimonials_tk', 'settings_tk'])
const guruWriteTables = new Set(['attendance_tk', 'grades_tk', 'materials_tk', 'chats_tk'])
const parentWriteTables = new Set(['payments_tk', 'chats_tk'])

function redactPasswords(value: any): any {
  if (Array.isArray(value)) return value.map(redactPasswords)
  if (!value || typeof value !== 'object') return value
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactPasswords(item)]))
  delete result.password_hash
  return result
}

export async function POST(request: NextRequest) {
  const query = await request.json() as DatabaseQuery
  const user = await getRequestUser(request)
  const isRead = query.operation === 'select'

  if (!user && !(isRead && publicReadTables.has(query.table))) {
    return NextResponse.json({ data: null, error: { message: 'Sesi login diperlukan.' } }, { status: 401 })
  }

  if (!user && query.table === 'testimonials_tk') {
    query.filters = [...(query.filters || []), { field: 'published', operator: 'eq', value: true }]
  }

  if (!isRead && user) {
    const allowed = user.role === 'super_admin' || user.role === 'admin'
      || (user.role === 'guru' && guruWriteTables.has(query.table))
      || (user.role === 'orang_tua' && parentWriteTables.has(query.table))
    if (!allowed) {
      return NextResponse.json({ data: null, error: { message: 'Anda tidak berhak mengubah data ini.' } }, { status: 403 })
    }
    if (query.table === 'chats_tk' && query.operation === 'insert') {
      const rows = Array.isArray(query.values) ? query.values : [query.values]
      if (rows.some((row: any) => row?.sender_id !== user.id)) {
        return NextResponse.json({ data: null, error: { message: 'Pengirim chat tidak valid.' } }, { status: 403 })
      }
    }
  }

  const result = await executeDatabaseQuery(query)
  if (user && query.table === 'chats_tk' && isRead && Array.isArray(result.data)) {
    result.data = result.data.filter((row: any) => row.sender_id === user.id || row.receiver_id === user.id) as any
  }
  const status = result.error ? 400 : 200
  return NextResponse.json({ ...result, data: redactPasswords(result.data) }, { status })
}
