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

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Insert to users_tk
    const { data, error } = await supabase
      .from('users_tk')
      .insert({ username, email, password_hash: hashed, role, status: 'active' })
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
