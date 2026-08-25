import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/database/server'
import { requestHasRole } from '@/lib/auth/request'

export async function GET(req: NextRequest) {
  try {
    if (!await requestHasRole(req, ['super_admin'])) {
      return NextResponse.json({ error: 'Tidak memiliki izin.' }, { status: 403 })
    }
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('users_tk')
      .select('id, username, email, role, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
