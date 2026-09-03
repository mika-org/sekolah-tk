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
    if (!user || !['guru', 'admin', 'super_admin'].includes(user.role)) {
      return { error: 'Hanya guru atau admin yang dapat mengunggah materi pelajaran.' }
    }

    const title = (formData.get('title') as string)?.trim() // Tema
    const topic = (formData.get('topic') as string)?.trim() // Topik Pembelajaran
    const description = (formData.get('description') as string)?.trim() // Keterangan
    const classId = formData.get('classId') as string // Kelompok
    const file = formData.get('file') as File

    if (!title || !classId || !file || file.size === 0) {
      return { error: 'Tema, Kelompok, dan File materi wajib diisi.' }
    }

    const supabase = createAdminClient()

    // 1. Get teacher id from current user
    let teacherId: string | null = null
    const { data: teacher } = await supabase
      .from('teachers_tk')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (teacher) {
      teacherId = teacher.id
    }

    // 2. Upload file
    const bucketName = 'bucket_tk'
    const fileExtension = file.name.split('.').pop() || 'pdf'
    const fileName = `${classId}/material_${Date.now()}.${fileExtension}`
    const fileUrl = await saveStoredFile(bucketName, fileName, Buffer.from(await file.arrayBuffer()))

    // 3. Format description containing [Topik: ...]
    const finalDescription = topic
      ? `[Topik: ${topic}] ${description || ''}`.trim()
      : (description || '')

    // 4. Save into database
    const { data: materialData, error: dbError } = await supabase
      .from('materials_tk')
      .insert({
        title, // Tema
        description: finalDescription,
        file_url: fileUrl,
        class_id: classId,
        teacher_id: teacherId,
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
    if (!user || !['guru', 'admin', 'super_admin'].includes(user.role)) {
      return { error: 'Tidak memiliki izin.' }
    }

    const supabase = createAdminClient()

    // 1. Delete from database
    const { error: dbError } = await supabase
      .from('materials_tk')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError

    // 2. Delete file from storage
    try {
      const stored = storagePathFromUrl(fileUrl)
      if (stored) {
        await deleteStoredFile(stored.bucket, stored.path)
      }
    } catch (err) {
      console.warn('Could not delete storage file:', err)
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
    let query = supabase
      .from('materials_tk')
      .select('*, classes_tk(nama, tahun_ajaran), teachers_tk(nama)')
      .order('created_at', { ascending: false })

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data, error } = await query
    if (error) throw error

    // Map parsed topic and description
    const mapped = (data || []).map((m: any) => {
      const parsed = parseMaterialContent(m.description)
      return {
        ...m,
        topic: parsed.topic,
        cleanDescription: parsed.description,
      }
    })

    return { success: true, materials: mapped }
  } catch (e: any) {
    console.error('Error fetching materials:', e)
    return { error: 'Gagal memuat materi: ' + e.message, materials: [] }
  }
}
