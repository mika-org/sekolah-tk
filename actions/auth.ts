'use server'

import { createAdminClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { generateJWT } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' }
  }

  const input = username.trim().toLowerCase()
  const isEmail = input.includes('@')

  // Use the admin client to query public.users_tk, bypassing RLS since the user is not authenticated yet.
  const supabaseAdmin = createAdminClient()

  // 1. Get the user record from the public users table
  const query = supabaseAdmin.from('users_tk').select('id, username, email, role, status, password_hash')
  const { data: userData, error: userError } = await (
    isEmail
      ? query.eq('email', input).maybeSingle()
      : query.eq('username', input).maybeSingle()
  )

  if (userError) {
    console.error('Database query error:', userError)
    return { error: 'Terjadi kesalahan sistem database.' }
  }

  if (!userData) {
    console.warn('User not found for input:', input)
    return { error: 'Username atau password salah.' }
  }

  if (userData.status !== 'active') {
    return { error: 'Akun Anda sedang tidak aktif.' }
  }

  // 2. Verify the password locally using bcrypt
  const isPasswordValid = await bcrypt.compare(password, userData.password_hash)
  if (!isPasswordValid) {
    return { error: 'Username atau password salah.' }
  }

  // 3. Generate POS-style custom JWT and set it in cookies to establish the session
  const token = await generateJWT({
    id: userData.id,
    username: userData.username,
    email: userData.email,
    role: userData.role
  })

  const cookieStore = await cookies()
  cookieStore.set('sekolah_tk_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 2 * 60 * 60 // 2 hours
  })

  // 4. Redirect depending on role
  const role = userData.role
  let redirectUrl = '/'
  if (role === 'super_admin') {
    redirectUrl = '/dashboard/super-admin'
  } else if (role === 'admin') {
    redirectUrl = '/dashboard/admin'
  } else if (role === 'guru') {
    redirectUrl = '/dashboard/guru'
  } else if (role === 'orang_tua') {
    redirectUrl = '/dashboard/orang-tua'
  }

  revalidatePath('/', 'layout')
  redirect(redirectUrl)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('sekolah_tk_token')
  revalidatePath('/', 'layout')
  redirect('/login')
}
