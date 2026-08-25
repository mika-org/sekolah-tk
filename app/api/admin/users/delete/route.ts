import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/database/server'
import { requestHasRole } from '@/lib/auth/request'

export async function POST(req: NextRequest) {
  try {
    if (!await requestHasRole(req, ['super_admin'])) {
      return NextResponse.json({ error: 'Tidak memiliki izin.' }, { status: 403 })
    }
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib disertakan.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Delete from users_tk
    const { error } = await supabase
      .from('users_tk')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

