'use server'

import { createAdminClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'
import { requireSessionRole } from '@/lib/auth/session'

export async function getSettings() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('settings_tk')
      .select('key, value')

    if (error) throw error

    const settingsRecord: Record<string, string> = {}
    if (data) {
      data.forEach(item => {
        settingsRecord[item.key] = item.value
      })
    }
    return { success: true, settings: settingsRecord }
  } catch (e: any) {
    console.error('Error fetching settings:', e)
    return { success: false, error: e.message, settings: {} as Record<string, string> }
  }
}

export async function updateSettings(settings: Record<string, string>) {
  try {
    await requireSessionRole(['super_admin', 'admin'])
    const supabase = createAdminClient()

    const upsertData = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value)
    }))

    const { error } = await supabase
      .from('settings_tk')
      .upsert(upsertData)

    if (error) throw error

    // Revalidate relevant pages so changes show up instantly
    revalidatePath('/')
    revalidatePath('/ppdb')
    revalidatePath('/dashboard/super-admin/settings')
    revalidatePath('/dashboard/orang-tua/billing')
    
    return { success: true }
  } catch (e: any) {
    console.error('Error updating settings:', e)
    return { success: false, error: e.message }
  }
}
