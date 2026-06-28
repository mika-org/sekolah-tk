'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import nodemailer from 'nodemailer'

async function sendCredentialEmail(email: string, studentName: string, username: string, passwordStr: string) {
  try {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587')
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.SMTP_FROM || '"KB & TK Istiqamah Balikpapan" <no-reply@sekolah.com>'

    if (!host || !user || !pass) {
      console.warn('SMTP credentials not configured. Simulating email send to:', email)
      console.log(`
        === EMAIL SENT TO ORANG TUA (SIMULATION) ===
        To: ${email}
        Subject: Selamat! Ananda ${studentName} Diterima di KB & TK Istiqamah Balikpapan
        
        Selamat, Ananda telah diterima di KB & TK Istiqamah Balikpapan.
        Berikut akun untuk login.
        Username: ${username}
        Password: ${passwordStr}
        Silakan login melalui: http://localhost:3200/login
        ============================================
      `)
      return { success: true, simulated: true }
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })

    const mailOptions = {
      from,
      to: email,
      subject: `Akun Portal Orang Tua KB & TK Istiqamah - ${studentName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #07265F; margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase;">Selamat! Pendaftaran Diterima</h2>
            <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">KB & TK Istiqamah Balikpapan</p>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Halo Bapak/Ibu Orang Tua/Wali dari <strong>${studentName}</strong>,</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dengan hormat, kami menginformasikan bahwa pendaftaran PPDB ananda <strong>${studentName}</strong> telah <strong>Diterima</strong>.</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Untuk memantau perkembangan belajar, kehadiran, dan nilai ananda, kami telah mengaktifkan akun Portal Orang Tua Anda. Berikut adalah detail login Anda:</p>
          
          <div style="background-color: #F8F6F2; padding: 18px; border-radius: 12px; margin: 24px 0; border: 1px dashed #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 14px;">
              <tr>
                <td style="width: 120px; font-weight: bold; color: #4b5563; padding-bottom: 8px;">Username:</td>
                <td style="color: #07265F; font-weight: bold; padding-bottom: 8px;">${username}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #4b5563;">Password:</td>
                <td style="color: #07265F; font-weight: bold;">${passwordStr}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #ef4444; font-size: 11px; font-weight: 600; margin-top: -12px; margin-bottom: 24px;">*Demi keamanan data Anda, mohon segera lakukan penggantian password sementara di menu Pengaturan Akun setelah pertama kali berhasil masuk.</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3200'}/login" style="background-color: #07A363; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(7, 163, 99, 0.2);">Login ke Portal Sekolah</a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.5; margin: 0;">Email ini dikirimkan secara otomatis oleh Sistem Portal Akademik KB & TK Istiqamah Balikpapan.<br/>Mohon tidak membalas email ini.</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`[EMAIL SENT] Successfully sent credential email to: ${email}`)
    return { success: true }
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send credential email to ${email}:`, err)
    return { success: false, error: err }
  }
}

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

    // 9. Send Email to Parent
    await sendCredentialEmail(parentEmail, ppdb.student_name, username, passwordStr)

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

export async function resendCredentialsEmail(ppdbId: string) {
  try {
    const supabase = createAdminClient()

    // 1. Get PPDB record
    const { data: ppdb, error: ppdbError } = await supabase
      .from('ppdb_tk')
      .select('*')
      .eq('id', ppdbId)
      .maybeSingle()

    if (ppdbError || !ppdb) {
      return { success: false, error: 'Pendaftaran tidak ditemukan.' }
    }

    if (ppdb.status !== 'Diterima') {
      return { success: false, error: 'Pendaftaran belum diterima. Kredensial belum dibuat.' }
    }

    // 2. Get student & parent
    const { data: student } = await supabase
      .from('students_tk')
      .select('id')
      .eq('nama', ppdb.student_name)
      .eq('tanggal_lahir', ppdb.birth_date)
      .maybeSingle()

    if (!student) {
      return { success: false, error: 'Data siswa tidak ditemukan.' }
    }

    const { data: parent } = await supabase
      .from('parents_tk')
      .select('*')
      .eq('student_id', student.id)
      .maybeSingle()

    if (!parent) {
      return { success: false, error: 'Data orang tua tidak ditemukan.' }
    }

    // 3. Get username from users_tk using parent.user_id
    if (!parent.user_id) {
      return { success: false, error: 'Akun orang tua belum terbuat di sistem.' }
    }

    const { data: userRecord } = await supabase
      .from('users_tk')
      .select('username, email')
      .eq('id', parent.user_id)
      .maybeSingle()

    if (!userRecord) {
      return { success: false, error: 'Akun user tidak ditemukan.' }
    }

    // 4. Reconstruct temporary password from birth date (DDMMYYYY)
    const dateObj = new Date(ppdb.birth_date)
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    const passwordStr = `${dd}${mm}${yyyy}`

    const parentEmail = parent.email || userRecord.email

    if (!parentEmail) {
      return { success: false, error: 'Email orang tua tidak ditemukan.' }
    }

    // 5. Send credential email
    const emailResult = await sendCredentialEmail(
      parentEmail,
      ppdb.student_name,
      userRecord.username,
      passwordStr
    )

    if (!emailResult.success) {
      return { success: false, error: 'Gagal mengirim email.' }
    }

    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: 'Terjadi kesalahan: ' + err.message }
  }
}

export async function uploadHeroBanner(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const buttonText = formData.get('buttonText') as string || ''
    const buttonLink = formData.get('buttonLink') as string || ''

    if (!file) {
      return { error: 'File gambar wajib diisi.' }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `hero/${fileName}`

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

    // Encode button configuration as JSON string in the title column
    const titleJson = JSON.stringify({ buttonText, buttonLink })

    const supabaseAdmin = createAdminClient()
    const { data, error: dbError } = await supabaseAdmin
      .from('galleries_tk')
      .insert({ title: titleJson, category: 'Hero Banner', image: publicUrl })
      .select()
      .single()

    if (dbError) {
      return { error: 'Gagal menyimpan ke database: ' + dbError.message }
    }

    revalidatePath('/')
    revalidatePath('/dashboard/admin/hero')
    return { success: true, data }
  } catch (err: any) {
    console.error('Upload hero banner error:', err)
    return { error: 'Gagal mengunggah banner: ' + err.message }
  }
}

export async function deleteHeroBanner(id: string, imageUrl: string) {
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

    revalidatePath('/')
    revalidatePath('/dashboard/admin/hero')
    return { success: true }
  } catch (err: any) {
    console.error('Delete hero banner error:', err)
    return { error: 'Gagal menghapus banner: ' + err.message }
  }
}

