'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
})

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

export async function uploadGalleryPhoto(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string

    if (!file || !title || !category) {
      return { error: 'Semua field wajib diisi.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `gallery/${fileName}`

    const bucketName = 'bucket_tk'

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const match = supabaseUrl.match(/https:\/\/(.*?)\.supabase/)
    const projectId = match ? match[1] : 'rgccflnozdvdmmxnshqv'
    const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`

    const supabaseAdmin = createAdminClient()
    const { data, error: dbError } = await supabaseAdmin
      .from('galleries_tk')
      .insert({ title, category, image: publicUrl })
      .select()
      .single()

    if (dbError) {
      return { error: 'Gagal menyimpan ke database: ' + dbError.message }
    }

    revalidatePath('/dashboard/admin/gallery')
    return { success: true, data }
  } catch (err: any) {
    console.error('Upload error:', err)
    return { error: 'Gagal mengunggah foto: ' + err.message }
  }
}

export async function deleteGalleryPhoto(id: string, imageUrl: string) {
  try {
    const supabaseAdmin = createAdminClient()
    const bucketName = 'bucket_tk'
    const urlParts = imageUrl?.split(`/${bucketName}/`)
    const storagePath = urlParts?.[1]

    if (storagePath) {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: storagePath,
      })
      await s3Client.send(command)
    }

    const { error } = await supabaseAdmin
      .from('galleries_tk')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: 'Gagal menghapus dari database: ' + error.message }
    }

    revalidatePath('/dashboard/admin/gallery')
    return { success: true }
  } catch (err: any) {
    console.error('Delete error:', err)
    return { error: 'Gagal menghapus foto: ' + err.message }
  }
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────

export async function uploadTestimonialPhoto(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { photoUrl: null }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `testimonials/${fileName}`
    const bucketName = 'bucket_tk'

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: file.type,
    })
    await s3Client.send(command)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const match = supabaseUrl.match(/https:\/\/(.*?)\.supabase/)
    const projectId = match ? match[1] : ''
    const photoUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`

    return { photoUrl }
  } catch (err: any) {
    console.error('Upload testimonial photo error:', err)
    return { error: 'Gagal upload foto: ' + err.message }
  }
}

export async function saveTestimonial(data: {
  name: string
  job: string
  content: string
  published: boolean
  photo?: string | null
}) {
  try {
    const supabaseAdmin = createAdminClient()
    const { data: result, error } = await supabaseAdmin
      .from('testimonials_tk')
      .insert({
        name: data.name,
        job: data.job,
        content: data.content,
        published: data.published,
        photo: data.photo || null,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    revalidatePath('/dashboard/admin/testimonials')
    return { success: true, data: result }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleTestimonialPublished(id: string, published: boolean) {
  try {
    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
      .from('testimonials_tk')
      .update({ published })
      .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard/admin/testimonials')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteTestimonial(id: string, photoUrl?: string | null) {
  try {
    const supabaseAdmin = createAdminClient()
    const bucketName = 'bucket_tk'

    if (photoUrl) {
      const urlParts = photoUrl?.split(`/${bucketName}/`)
      const storagePath = urlParts?.[1]
      if (storagePath) {
        const command = new DeleteObjectCommand({ Bucket: bucketName, Key: storagePath })
        await s3Client.send(command)
      }
    }

    const { error } = await supabaseAdmin.from('testimonials_tk').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/dashboard/admin/testimonials')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
