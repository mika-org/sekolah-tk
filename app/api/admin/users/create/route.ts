import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, role } = await req.json()

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Create Auth user in Supabase Auth first
    let authId = 'user-id-' + Date.now()
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, username }
      })

      if (authError || !authUser.user) {
        return NextResponse.json({ error: 'Gagal membuat auth user: ' + (authError?.message || 'Unknown error') }, { status: 400 })
      }
      authId = authUser.user.id
    }

    // 2. Hash password for users_tk
    const hashed = await bcrypt.hash(password, 10)

    // 3. Insert into public.users_tk
    const { data, error } = await supabase
      .from('users_tk')
      .insert({ id: authId, username, email, password_hash: hashed, role, status: 'active' })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

