'use server'

import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/database/server'
import { createAdminClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { deleteStoredFile, saveStoredFile, storagePathFromUrl } from '@/lib/storage'
import { requireSessionRole } from '@/lib/auth/session'

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
            <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">KB & TK Istiqamah Bandung</p>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Halo Bapak/Ibu Orang Tua/Wali dari <strong>${studentName}</strong>,</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Dengan hormat, kami menginformasikan bahwa pendaftaran SPMB ananda <strong>${studentName}</strong> telah <strong>Diterima</strong>.</p>
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

export async function syncPpdbToStudent(ppdbId: string) {
  try {
    await requireSessionRole(['super_admin', 'admin'])
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Get PPDB details
    const { data: ppdb, error: ppdbError } = await supabase
      .from('ppdb_tk')
      .select('*')
      .eq('id', ppdbId)
      .single()

    if (ppdbError || !ppdb) {
      return { error: 'Data pendaftaran tidak ditemukan: ' + (ppdbError?.message || '') }
    }

    const childDetails = (ppdb.child_details as Record<string, any>) || {}
    const fatherDetails = (ppdb.father_details as Record<string, any>) || {}
    const motherDetails = (ppdb.mother_details as Record<string, any>) || {}

    // 2. Generate Username & Password
    const baseUsername = ppdb.student_name.toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = baseUsername || 'murid'
    let counter = 1

    // Check if parent account exists
    const parentEmail = (fatherDetails.email_ayah || motherDetails.email_ibu || `${username}@gmail.com`).trim().toLowerCase()
    const parentPhone = (fatherDetails.hp_ayah || motherDetails.hp_ibu || '').trim()

    let authId = ''
    let passwordStr = ''

    // 1. Cek apakah user sudah ada berdasarkan email atau username
    let existingUser: any = null
    if (parentEmail) {
      const { data: byEmail } = await supabase
        .from('users_tk')
        .select('id, username, email')
        .eq('email', parentEmail)
        .maybeSingle()
      if (byEmail) existingUser = byEmail
    }

    if (!existingUser && username) {
      const { data: byUsername } = await supabase
        .from('users_tk')
        .select('id, username, email')
        .eq('username', username)
        .maybeSingle()
      if (byUsername) existingUser = byUsername
    }

    if (existingUser) {
      authId = existingUser.id
      username = existingUser.username
      await supabase
        .from('users_tk')
        .update({ status: 'active' })
        .eq('id', authId)
    } else {
      // Pastikan username unik
      while (true) {
        const { data: exists } = await supabase
          .from('users_tk')
          .select('id')
          .eq('username', username)
          .maybeSingle()

        if (!exists) break
        username = `${baseUsername}${counter.toString().padStart(2, '0')}`
        counter++
      }

      // Pastikan email unik agar tidak melanggar unique constraint
      let finalEmail = parentEmail
      let emailCounter = 1
      while (true) {
        const { data: existsEmail } = await supabase
          .from('users_tk')
          .select('id')
          .eq('email', finalEmail)
          .maybeSingle()

        if (!existsEmail) break
        const atIdx = parentEmail.indexOf('@')
        if (atIdx !== -1) {
          finalEmail = `${parentEmail.slice(0, atIdx)}${emailCounter}${parentEmail.slice(atIdx)}`
        } else {
          finalEmail = `${parentEmail}${emailCounter}`
        }
        emailCounter++
      }

      const dateObj = new Date(ppdb.birth_date)
      const dd = String(dateObj.getDate()).padStart(2, '0')
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
      const yyyy = dateObj.getFullYear()
      passwordStr = `${dd}${mm}${yyyy}`

      const passwordHash = await bcrypt.hash(passwordStr, 10)
      authId = randomUUID()

      const { data: newUser, error: insertUserError } = await supabase
        .from('users_tk')
        .insert({
          id: authId,
          username,
          email: finalEmail,
          password_hash: passwordHash,
          role: 'orang_tua',
          status: 'active',
        })
        .select('id')
        .single()

      if (insertUserError) {
        console.error('Local User Creation Error in users_tk:', insertUserError)
        // Coba temukan fallback jika ternyata sudah tersimpan
        const { data: fallbackUser } = await supabase
          .from('users_tk')
          .select('id, username')
          .eq('email', finalEmail)
          .maybeSingle()
        if (fallbackUser) {
          authId = fallbackUser.id
          username = fallbackUser.username
        } else {
          authId = ''
        }
      } else if (newUser?.id) {
        authId = newUser.id
      }
    }

    // Verifikasi authId benar-benar ada di users_tk sebelum dijadikan foreign key
    let verifiedUserId: string | null = null
    if (authId) {
      const { data: checkUser } = await supabase
        .from('users_tk')
        .select('id')
        .eq('id', authId)
        .maybeSingle()
      if (checkUser?.id) {
        verifiedUserId = checkUser.id
      }
    }

    // 3. Upsert Student Record in students_tk
    const studentName = ppdb.student_name.trim()
    const rawNik = (childDetails.nik || '').toString().trim()
    const studentNik = rawNik ? rawNik.slice(0, 16) : null
    const rawNisn = (childDetails.nisn || '').toString().trim()
    const studentNisn = rawNisn ? rawNisn.slice(0, 10) : null

    let studentId = ''

    // Try finding by NIK first if available, otherwise by name
    let { data: existingStudent } = studentNik
      ? await supabase.from('students_tk').select('id').eq('nik', studentNik).maybeSingle()
      : { data: null }

    if (!existingStudent) {
      const { data: byName } = await supabase
        .from('students_tk')
        .select('id')
        .eq('nama', studentName)
        .maybeSingle()
      existingStudent = byName
    }

    const birthDate = childDetails.birth_date || ppdb.birth_date
    const gender = childDetails.jenis_kelamin === 'P' || childDetails.jenis_kelamin === 'Perempuan' ? 'P' : 'L'
    const studentPayload = {
      nama: studentName,
      nik: studentNik,
      nisn: studentNisn,
      tempat_lahir: childDetails.tempat_lahir || null,
      tanggal_lahir: birthDate,
      jenis_kelamin: gender,
      agama: childDetails.agama || 'Islam',
      alamat: childDetails.alamat || fatherDetails.alamat_ayah || motherDetails.alamat_ibu || null,
      status: 'active',
      user_id: verifiedUserId,
    }

    if (existingStudent) {
      studentId = existingStudent.id
      await supabase
        .from('students_tk')
        .update(studentPayload)
        .eq('id', studentId)
    } else {
      const { data: newStudent, error: createStudentError } = await supabase
        .from('students_tk')
        .insert(studentPayload)
        .select('id')
        .single()

      if (createStudentError) {
        console.error('Create student error:', createStudentError)
        return { error: 'Gagal membuat data murid: ' + createStudentError.message }
      }
      studentId = newStudent?.id || ''
    }

    // 4. Upsert Parent Record in parents_tk
    const fatherName = (fatherDetails.nama_ayah || '').trim()
    const motherName = (motherDetails.nama_ibu || '').trim()
    const parentJob = `${fatherDetails.pekerjaan_ayah || ''} / ${motherDetails.pekerjaan_ibu || ''}`.replace(/^[\s/]+|[\s/]+$/g, '') || null

    if (studentId) {
      const { data: existingParent } = await supabase
        .from('parents_tk')
        .select('id')
        .eq('student_id', studentId)
        .maybeSingle()

      const parentPayload = {
        student_id: studentId,
        nama_ayah: fatherName || null,
        nama_ibu: motherName || null,
        hp: parentPhone || null,
        email: parentEmail || null,
        alamat: fatherDetails.alamat_ayah || motherDetails.alamat_ibu || childDetails.alamat || null,
        pekerjaan: parentJob,
        user_id: verifiedUserId,
      }

      if (existingParent) {
        await supabase
          .from('parents_tk')
          .update(parentPayload)
          .eq('id', existingParent.id)
      } else {
        await supabase
          .from('parents_tk')
          .insert(parentPayload)
      }
    }

    // 5. Update PPDB & Payment Status
    await supabase
      .from('ppdb_tk')
      .update({ status: 'Diterima', payment_status: 'Verified' })
      .eq('id', ppdbId)

    await supabase
      .from('payments_tk')
      .update({ status: 'Verified' })
      .eq('ppdb_id', ppdbId)

    // Send Credential Email if password was generated
    if (passwordStr && parentEmail) {
      try {
        await sendCredentialEmail(parentEmail, ppdb.student_name, username, passwordStr)
      } catch (emailErr) {
        console.warn('Email sending skipped/failed:', emailErr)
      }
    }

    // Log activity
    try {
      await supabase.from('activity_logs_tk').insert({
        activity: `Verifikasi pendaftaran & pembayaran ${ppdb.student_name} selesai. Akun orang tua (${username}) dan data murid aktif telah dibuat.`,
      })
    } catch {}

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/admin/ppdb')
    revalidatePath('/dashboard/admin/payments')
    revalidatePath('/dashboard/super-admin/students')

    return {
      success: true,
      username,
      password: passwordStr,
      studentId,
      parentEmail,
      parentPhone,
    }
  } catch (e: any) {
    console.error('syncPpdbToStudent error:', e)
    return { error: 'Terjadi kesalahan sistem: ' + e.message }
  }
}

export interface UpdatePPDBPayload {
  student_name: string
  birth_date: string
  status: string
  payment_status: string
  child_details: Record<string, any>
  father_details: Record<string, any>
  mother_details: Record<string, any>
  development_health?: Record<string, any>
}

export async function updatePPDB(ppdbId: string, payload: UpdatePPDBPayload) {
  try {
    await requireSessionRole(['super_admin', 'admin'])
    const supabase = await createClient()

    const { error } = await supabase
      .from('ppdb_tk')
      .update({
        student_name: payload.student_name.trim(),
        birth_date: payload.birth_date,
        status: payload.status,
        payment_status: payload.payment_status,
        child_details: payload.child_details || {},
        father_details: payload.father_details || {},
        mother_details: payload.mother_details || {},
        development_health: payload.development_health || {},
      })
      .eq('id', ppdbId)

    if (error) throw error

    // If status is 'Diterima', ensure synced to student and parent records
    if (payload.status === 'Diterima') {
      await syncPpdbToStudent(ppdbId)
    }

    try {
      await supabase.from('activity_logs_tk').insert({
        activity: `Data pendaftaran SPMB ${payload.student_name.trim()} diperbarui oleh admin.`,
      })
    } catch {}

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/admin/ppdb')
    revalidatePath('/dashboard/admin/payments')
    revalidatePath('/dashboard/super-admin/students')

    return { success: true }
  } catch (err: any) {
    console.error('Error updating PPDB:', err)
    return { error: 'Gagal memperbarui data PPDB: ' + err.message }
  }
}

export async function approvePPDB(ppdbId: string) {
  return syncPpdbToStudent(ppdbId)
}

export async function uploadGalleryPhoto(formData: FormData) {
  try {
    await requireSessionRole(['super_admin', 'admin'])
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

    const publicUrl = await saveStoredFile(bucketName, filePath, buffer)

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
    await requireSessionRole(['super_admin', 'admin'])
    const supabaseAdmin = createAdminClient()
    const stored = storagePathFromUrl(imageUrl)
    if (stored) {
      await deleteStoredFile(stored.bucket, stored.objectPath)
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
    await requireSessionRole(['super_admin', 'admin'])
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { photoUrl: null }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `testimonials/${fileName}`
    const bucketName = 'bucket_tk'

    const photoUrl = await saveStoredFile(bucketName, filePath, buffer)

    return { photoUrl }
  } catch (err: any) {
    console.error('Upload testimonial photo error:', err)
    return { error: 'Gagal upload foto: ' + err.message }
  }
}

export async function uploadPaymentProof(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: 'File tidak ditemukan.' }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = `payments/${fileName}`
    const bucketName = 'bucket_tk'

    const proofUrl = await saveStoredFile(bucketName, filePath, buffer)

    return { proofUrl }
  } catch (err: any) {
    console.error('Upload payment proof error:', err)
    return { error: 'Gagal upload bukti transfer: ' + err.message }
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
    await requireSessionRole(['super_admin', 'admin'])
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
    await requireSessionRole(['super_admin', 'admin'])
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
    await requireSessionRole(['super_admin', 'admin'])
    const supabaseAdmin = createAdminClient()
    if (photoUrl) {
      const stored = storagePathFromUrl(photoUrl)
      if (stored) {
        await deleteStoredFile(stored.bucket, stored.objectPath)
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
    await requireSessionRole(['super_admin', 'admin'])
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
    await requireSessionRole(['super_admin', 'admin'])
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

    const publicUrl = await saveStoredFile(bucketName, filePath, buffer)

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
    await requireSessionRole(['super_admin', 'admin'])
    const supabaseAdmin = createAdminClient()
    const stored = storagePathFromUrl(imageUrl)
    if (stored) {
      await deleteStoredFile(stored.bucket, stored.objectPath)
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
