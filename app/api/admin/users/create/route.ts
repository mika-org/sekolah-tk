import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/database/server'
import bcrypt from 'bcryptjs'
import { requestHasRole } from '@/lib/auth/request'
import { randomUUID } from 'node:crypto'

export async function POST(req: NextRequest) {
  try {
    if (!await requestHasRole(req, ['super_admin'])) {
      return NextResponse.json({ error: 'Tidak memiliki izin.' }, { status: 403 })
    }
    const { username, email, password, role } = await req.json()

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
    }

    const cleanEmail = String(email).trim().toLowerCase()
    const cleanUsername = String(username).trim()

    const supabase = createAdminClient()

    // Check duplicate
    const { data: existing } = await supabase
      .from('users_tk')
      .select('id, username, email')
      .or(`email.eq.${cleanEmail},username.eq.${cleanUsername}`)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username atau Email sudah terdaftar.' }, { status: 400 })
    }

    // Hash password for users_tk
    const hashed = await bcrypt.hash(password, 10)
    const authId = randomUUID()

    // Insert into public.users_tk
    const { data, error } = await supabase
      .from('users_tk')
      .insert({
        id: authId,
        username: cleanUsername,
        email: cleanEmail,
        password_hash: hashed,
        role,
        status: 'active',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data!.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

