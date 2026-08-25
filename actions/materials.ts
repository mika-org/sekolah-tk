'use server'

import { createAdminClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { decodeJWT } from '@/lib/jwt'
import { deleteStoredFile, saveStoredFile, storagePathFromUrl } from '@/lib/storage'

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

    // 2. Upload file to the configured local/shared storage.
    const bucketName = 'bucket_tk'

    const fileExtension = file.name.split('.').pop() || 'pdf'
    const fileName = `${classId}/material_${Date.now()}.${fileExtension}`

    const fileUrl = await saveStoredFile(bucketName, fileName, Buffer.from(await file.arrayBuffer()))

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

    // 2. Delete file from storage.
    try {
      const stored = storagePathFromUrl(fileUrl)
      if (stored) {
        await deleteStoredFile(stored.bucket, stored.objectPath)
      }
    } catch (storageError) {
      console.warn('Failed to delete stored material:', storageError)
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
