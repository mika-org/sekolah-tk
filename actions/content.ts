'use server'

import { createAdminClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'
import { requireSessionRole } from '@/lib/auth/session'
import { saveStoredFile } from '@/lib/storage'
import { FACILITIES, FacilityItem } from '@/lib/facilities'
import { DEFAULT_PROGRAMS, ProgramItem } from '@/lib/programs'

// ─── FASILITAS ──────────────────────────────────────────────

export async function getFacilitiesData(): Promise<{ success: boolean; data: FacilityItem[] }> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('settings_tk')
      .select('value')
      .eq('key', 'school_facilities')
      .maybeSingle()

    if (!error && data?.value) {
      const parsed = JSON.parse(data.value)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { success: true, data: parsed }
      }
    }
    return { success: true, data: FACILITIES }
  } catch (e: any) {
    console.error('Error fetching facilities data:', e)
    return { success: false, data: FACILITIES }
  }
}

export async function saveFacilitiesData(
  items: FacilityItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionRole(['super_admin', 'admin'])
    const supabase = createAdminClient()

    const { error } = await supabase.from('settings_tk').upsert([
      {
        key: 'school_facilities',
        value: JSON.stringify(items),
        updated_at: new Date().toISOString(),
      },
    ])

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/fasilitas')
    revalidatePath('/dashboard/admin/facilities')

    return { success: true }
  } catch (e: any) {
    console.error('Error saving facilities:', e)
    return { success: false, error: e.message }
  }
}

// ─── PROGRAM UNGGULAN ────────────────────────────────────────

export async function getProgramsData(): Promise<{ success: boolean; data: ProgramItem[] }> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('settings_tk')
      .select('value')
      .eq('key', 'school_programs')
      .maybeSingle()

    if (!error && data?.value) {
      const parsed = JSON.parse(data.value)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { success: true, data: parsed }
      }
    }
    return { success: true, data: DEFAULT_PROGRAMS }
  } catch (e: any) {
    console.error('Error fetching programs data:', e)
    return { success: false, data: DEFAULT_PROGRAMS }
  }
}

export async function saveProgramsData(
  items: ProgramItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireSessionRole(['super_admin', 'admin'])
    const supabase = createAdminClient()

    const { error } = await supabase.from('settings_tk').upsert([
      {
        key: 'school_programs',
        value: JSON.stringify(items),
        updated_at: new Date().toISOString(),
      },
    ])

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/program')
    revalidatePath('/dashboard/admin/programs')

    return { success: true }
  } catch (e: any) {
    console.error('Error saving programs:', e)
    return { success: false, error: e.message }
  }
}

// ─── UPLOAD GAMBAR FASILITAS / PROGRAM ───────────────────────

export async function uploadContentImage(
  formData: FormData,
  folder: 'facilities' | 'programs'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireSessionRole(['super_admin', 'admin'])
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return { success: false, error: 'File gambar wajib dipilih.' }
    }

    if (file.size > 8 * 1024 * 1024) {
      return { success: false, error: 'Ukuran gambar maksimal 8MB.' }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const url = await saveStoredFile(folder, fileName, buffer)

    return { success: true, url }
  } catch (e: any) {
    console.error('Error uploading content image:', e)
    return { success: false, error: e.message }
  }
}
