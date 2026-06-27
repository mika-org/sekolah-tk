'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function approvePPDB(ppdbId: string) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Get PPDB details
    const { data: ppdb, error: ppdbError } = await supabase
      .from('ppdb_tk')
      .select('*')
      .eq('id', ppdbId)
      .single()

    if (ppdbError || !ppdb) {
      return { error: 'Data pendaftaran tidak ditemukan: ' + ppdbError?.message }
    }

    // 2. Generate Username
    // Format: lowercase student name without spaces
    const baseUsername = ppdb.student_name.toLowerCase().replace(/\s+/g, '')
    let username = baseUsername
    let counter = 1

    // Check if username exists in users table
    while (true) {
      const { data: exists } = await supabase
        .from('users_tk')
        .select('username')
        .eq('username', username)
        .maybeSingle()

      if (!exists) break
      username = `${baseUsername}${counter.toString().padStart(2, '0')}`
      counter++
    }

    // 3. Generate Password from birth date (DDMMYYYY)
    // Birth date is in YYYY-MM-DD from database (e.g. 2021-05-17)
    const dateObj = new Date(ppdb.birth_date)
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    const passwordStr = `${dd}${mm}${yyyy}`

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(passwordStr, 10)

    // 4. Create Parent email
    // Get parent email from student/parent registration if any, or default to username@school.com
    const { data: student } = await supabase
      .from('students_tk')
      .select('id, user_id')
      .eq('nama', ppdb.student_name)
      .maybeSingle()

    let parentEmail = `${username}@gmail.com`
    let studentId = ''

    if (student) {
      studentId = student.id
      const { data: parent } = await supabase
        .from('parents_tk')
        .select('email')
        .eq('student_id', student.id)
        .maybeSingle()
      if (parent && parent.email) {
        parentEmail = parent.email
      }
    }

    // 5. Create user in Supabase Auth (via admin client)
    // Fallback if admin key is not available
    let authId = 'mock-auth-id-' + Date.now()
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: parentEmail,
        password: passwordStr,
        email_confirm: true,
        user_metadata: {
          role: 'orang_tua',
          username: username,
          student_name: ppdb.student_name
        }
      })

      if (authError || !authUser.user) {
        console.error('Auth User Creation Error:', authError)
        return { error: 'Gagal membuat user auth: ' + authError?.message }
      }
      authId = authUser.user.id
    } else {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not configured. Simulating auth user creation.')
    }

    // 6. Insert into public.users table
    const { error: publicUserError } = await supabase
      .from('users_tk')
      .insert({
        id: authId,
        username,
        email: parentEmail,
        password_hash: passwordHash,
        role: 'orang_tua',
        status: 'active'
      })

    if (publicUserError) {
      console.error('Public User Error:', publicUserError)
      // If user already exists locally, we just ignore for demo purposes
      if (!publicUserError.message.includes('duplicate key')) {
        return { error: 'Gagal membuat data user publik: ' + publicUserError.message }
      }
    }

    // 7. Update PPDB status to 'Diterima' and payment_status to 'Verified'
    await supabase
      .from('ppdb_tk')
      .update({ status: 'Diterima', payment_status: 'Verified' })
      .eq('id', ppdbId)

    // 8. Update student and parent details
    if (studentId) {
      // Set student active
      await supabase
        .from('students_tk')
        .update({ user_id: authId, status: 'active' })
        .eq('id', studentId)

      // Set parent user_id
      await supabase
        .from('parents_tk')
        .update({ user_id: authId })
        .eq('student_id', studentId)
    }

    // 9. Send Mock Email (outputting to console/activity logs)
    console.log(`
      === EMAIL SENT TO ORANG TUA ===
      To: ${parentEmail}
      Subject: Selamat! Ananda ${ppdb.student_name} Diterima di KB & TK Istiqamah
      
      Selamat, Ananda telah diterima di KB & TK Istiqamah.
      Berikut akun untuk login.
      Username: ${username}
      Password: ${passwordStr}
      Silakan login melalui: https://sekolah-istiqamah.sch.id/login
      ================================
    `)

    // Save activity log
    try {
      await supabase.from('activity_logs_tk').insert({
        activity: `Menyetujui pendaftaran PPDB ${ppdb.student_name} dan membuat akun orang tua (${username})`
      })
    } catch (e) {
      console.warn('Logging activity failed (probably db not synced yet)')
    }

    revalidatePath('/dashboard/admin')
    return { success: true, username, password: passwordStr }
  } catch (e: any) {
    console.error(e)
    return { error: 'Terjadi kesalahan sistem: ' + e.message }
  }
}
