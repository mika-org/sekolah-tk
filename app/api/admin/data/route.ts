import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Generic admin data fetch endpoint
// Query params:
// - table: name of table or join alias
// - limit: number of rows (default 200)
// - orderBy: column name (optional)
// - ascending: 'true' | 'false' (default false)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const table = searchParams.get('table')
    const limit = parseInt(searchParams.get('limit') || '200')
    const requestedOrderBy = searchParams.get('orderBy')
    const ascending = searchParams.get('ascending') === 'true'

    if (!table) {
      return NextResponse.json({ error: 'table param required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    let query: any

    // Special queries with joins
    if (table === 'payments_tk') {
      query = supabase
        .from('payments_tk')
        .select('*, ppdb_tk(student_name)')
        .order(requestedOrderBy || 'id', { ascending })
        .limit(limit)
    } else if (table === 'teachers_tk_with_users') {
      query = supabase
        .from('teachers_tk')
        .select('*, users_tk(username, email)')
        .order(requestedOrderBy || 'nama', { ascending: true })
        .limit(limit)
    } else if (table === 'classes_tk_with_teachers') {
      query = supabase
        .from('classes_tk')
        .select('*, teachers_tk(nama)')
        .order(requestedOrderBy || 'nama', { ascending: true })
        .limit(limit)
    } else if (table === 'students_tk_with_classes') {
      query = supabase
        .from('students_tk')
        .select('*, classes_tk(nama)')
        .order(requestedOrderBy || 'nama', { ascending: true })
        .limit(limit)
    } else if (table === 'materials_tk_with_classes') {
      query = supabase
        .from('materials_tk')
        .select('*, classes_tk(nama), teachers_tk(nama)')
        .order(requestedOrderBy || 'created_at', { ascending })
        .limit(limit)
    } else if (table === 'schedules_tk_with_classes') {
      query = supabase
        .from('schedules_tk')
        .select('*, classes_tk(nama)')
        .order(requestedOrderBy || 'day', { ascending: true })
        .limit(limit)
    } else {
      // Map of valid tables and their default fallback order column
      const tableOrderDefaults: Record<string, string> = {
        users_tk: 'created_at',
        teachers_tk: 'nama',
        classes_tk: 'nama',
        students_tk: 'nama',
        parents_tk: 'id',
        ppdb_tk: 'created_at',
        ppdb_documents_tk: 'id',
        galleries_tk: 'created_at',
        testimonials_tk: 'id',
        announcements_tk: 'id',
        payments_tk: 'id',
        attendance_tk: 'date',
        grades_tk: 'id',
        activity_logs_tk: 'created_at',
        chats_tk: 'created_at',
        materials_tk: 'created_at',
        schedules_tk: 'id',
        settings_tk: 'updated_at',
      }

      if (!(table in tableOrderDefaults)) {
        return NextResponse.json({ error: `Invalid table parameter: '${table}'` }, { status: 400 })
      }

      const sortColumn = requestedOrderBy || tableOrderDefaults[table]

      try {
        query = supabase
          .from(table as any)
          .select('*')
          .order(sortColumn, { ascending })
          .limit(limit)
      } catch (err: any) {
        return NextResponse.json({ error: 'Query build error: ' + err.message }, { status: 400 })
      }
    }

    const { data, error } = await query

    if (error) {
      console.error(`[API /api/admin/data] Supabase error for '${table}':`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err: any) {
    console.error('[API /api/admin/data] Catch error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

