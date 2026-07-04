'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { decodeJWT } from '@/lib/jwt'
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

async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sekolah_tk_token')?.value
  if (!token) return null
  try {
    return decodeJWT(token)
  } catch (e) {
    return null
  }
}

async function ensureBucketExists(bucket: string) {
  try {
    const supabase = createAdminClient()
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.error(`Failed to list buckets: ${error.message}`)
      return
    }
    const exists = buckets?.some(b => b.id === bucket)
    if (!exists) {
      await supabase.storage.createBucket(bucket, { public: true })
    }
  } catch (err) {
    console.error(`Failed to ensure bucket ${bucket} exists:`, err)
  }
}

export async function uploadMaterial(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'guru') {
      return { error: 'Hanya guru yang dapat mengunggah materi pelajaran.' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const classId = formData.get('classId') as string
    const file = formData.get('file') as File

    if (!title || !classId || !file || file.size === 0) {
      return { error: 'Semua field dan file materi wajib diisi.' }
    }

    const supabase = createAdminClient()

    // 1. Get teacher id from current user
    const { data: teacher } = await supabase
      .from('teachers_tk')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!teacher) {
      return { error: 'Profil guru Anda tidak ditemukan.' }
    }

    // 2. Upload file to S3 (bucket: bucket_tk)
    const bucketName = 'bucket_tk'
    await ensureBucketExists(bucketName)

    const fileExtension = file.name.split('.').pop() || 'pdf'
    const fileName = `${classId}/material_${Date.now()}.${fileExtension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const match = supabaseUrl.match(/https:\/\/(.*?)\.supabase/)
    const projectId = match ? match[1] : 'rgccflnozdvdmmxnshqv'
    const fileUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`

    // 3. Save message log/record into database
    const { data: materialData, error: dbError } = await supabase
      .from('materials_tk')
      .insert({
        title,
        description,
        file_url: fileUrl,
        class_id: classId,
        teacher_id: teacher.id
      })
      .select()
      .single()

    if (dbError) throw dbError

    revalidatePath('/dashboard/guru/materials')
    revalidatePath('/dashboard/orang-tua/materials')
    return { success: true, data: materialData }
  } catch (e: any) {
    console.error('Error uploading material:', e)
    return { error: 'Gagal mengunggah materi: ' + e.message }
  }
}

export async function deleteMaterial(id: string, fileUrl: string) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'guru') {
      return { error: 'Tidak memiliki izin.' }
    }

    const supabase = createAdminClient()

    // 1. Delete from database
    const { error: dbError } = await supabase
      .from('materials_tk')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError

    // 2. Delete file from S3 Storage
    try {
      const match = fileUrl.match(/\/public\/bucket_tk\/(.*)/)
      if (match && match[1]) {
        const fileKey = decodeURIComponent(match[1])
        const command = new DeleteObjectCommand({
          Bucket: 'bucket_tk',
          Key: fileKey,
        })
        await s3Client.send(command)
      }
    } catch (s3Error) {
      console.warn('Failed to delete file from S3 Storage bucket:', s3Error)
    }

    revalidatePath('/dashboard/guru/materials')
    revalidatePath('/dashboard/orang-tua/materials')
    return { success: true }
  } catch (e: any) {
    console.error('Error deleting material:', e)
    return { error: 'Gagal menghapus materi: ' + e.message }
  }
}

export async function getMaterialsList(classId?: string) {
  try {
    const supabase = createAdminClient()
    let query = supabase.from('materials_tk').select('*, classes_tk(nama), teachers_tk(nama)')

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, materials: data || [] }
  } catch (e: any) {
    console.error('Error fetching materials:', e)
    return { error: e.message, materials: [] }
  }
}
