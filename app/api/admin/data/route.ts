import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Generic admin data fetch endpoint
// Query param: table = the table name to query
// Supports: ppdb_tk, payments_tk (with join), galleries_tk, announcements_tk
// teachers_tk, classes_tk, students_tk, users_tk, activity_logs_tk

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const table = searchParams.get('table')
    const limit = parseInt(searchParams.get('limit') || '200')
    const orderBy = searchParams.get('orderBy') || 'created_at'
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
        .order('id', { ascending: false })
        .limit(limit)
    } else if (table === 'teachers_tk_with_users') {
      query = supabase
        .from('teachers_tk')
        .select('*, users_tk(username, email)')
        .order('nama')
        .limit(limit)
    } else if (table === 'classes_tk_with_teachers') {
      query = supabase
        .from('classes_tk')
        .select('*, teachers_tk(nama)')
        .order('nama')
        .limit(limit)
    } else if (table === 'students_tk_with_classes') {
      query = supabase
        .from('students_tk')
        .select('*, classes_tk(nama)')
        .order('nama')
        .limit(limit)
    } else {
      // Generic table query
      const validTables = [
        'users_tk', 'teachers_tk', 'classes_tk', 'students_tk',
        'ppdb_tk', 'galleries_tk', 'announcements_tk', 'activity_logs_tk',
        'payments_tk', 'parents_tk'
      ]
      if (!validTables.includes(table)) {
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
      }

      try {
        query = supabase
          .from(table as any)
          .select('*')
          .order(orderBy, { ascending })
          .limit(limit)
      } catch {
        return NextResponse.json({ error: 'Query build error' }, { status: 400 })
      }
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
