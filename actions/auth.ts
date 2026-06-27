'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' }
  }

  const supabase = await createClient()

  // 1. Get the email and role from the public users table using username
  const { data: userData, error: userError } = await supabase
    .from('users_tk')
    .select('email, role')
    .eq('username', username.trim().toLowerCase())
    .single()

  if (userError || !userData) {
    return { error: 'Username atau password salah.' }
  }

  // 2. Sign in with the retrieved email and the user's password
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password,
  })

  if (authError) {
    return { error: 'Username atau password salah.' }
  }

  // 3. Redirect depending on role
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
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
