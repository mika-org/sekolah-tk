import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib disertakan.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Delete from auth.users if possible
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await supabase.auth.admin.deleteUser(id)
      } catch (e) {
        console.warn('Auth user deletion warning:', e)
      }
    }

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

