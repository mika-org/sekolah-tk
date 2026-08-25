'use server'

import { createAdminClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { decodeJWT } from '@/lib/jwt'

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

export async function sendChatMessage(receiverId: string, message: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: 'Anda harus login untuk mengirim pesan.' }

    const messageText = message?.trim()
    if (!messageText) return { error: 'Pesan tidak boleh kosong.' }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('chats_tk')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: messageText
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/guru/chat')
    revalidatePath('/dashboard/orang-tua/chat')
    return { success: true, data }
  } catch (e: any) {
    console.error('Error sending chat:', e)
    return { error: 'Gagal mengirim pesan: ' + e.message }
  }
}

export async function getChatMessages(chatPartnerId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: 'Tidak terautentikasi' }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('chats_tk')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatPartnerId}),and(sender_id.eq.${chatPartnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { success: true, messages: data || [] }
  } catch (e: any) {
    console.error('Error fetching chat messages:', e)
    return { error: e.message, messages: [] }
  }
}

// Get the Wali Kelas (teacher) for Orang Tua, or the List of Parents for Guru
export async function getChatPartners() {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: 'Tidak terautentikasi' }

    const supabase = createAdminClient()

    if (user.role === 'guru') {
      // 1. Get the teacher record of current logged-in guru
      const { data: teacher } = await supabase
        .from('teachers_tk')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!teacher) return { partners: [] }

      // 2. Get the classes taught by this teacher
      const { data: classes } = await supabase
        .from('classes_tk')
        .select('id')
        .eq('guru_id', teacher.id)

      if (!classes || classes.length === 0) return { partners: [] }
      const classIds = classes.map(c => c.id)

      // 3. Get students in these classes
      const { data: students } = await supabase
        .from('students_tk')
        .select('id, nama')
        .in('kelas_id', classIds)

      if (!students || students.length === 0) return { partners: [] }
      const studentIds = students.map(s => s.id)

      // 4. Get parents of these students who have active user accounts
      const { data: parents } = await supabase
        .from('parents_tk')
        .select('*, users_tk(id, username, email), students_tk(nama)')
        .in('student_id', studentIds)
        .not('user_id', 'is', null)

      const formattedPartners = (parents || []).map((p: any) => ({
        id: p.user_id,
        name: `Ayah ${p.nama_ayah || ''} / Ibu ${p.nama_ibu || ''} (${p.students_tk?.nama || ''})`,
        role: 'orang_tua',
        email: p.email || p.users_tk?.email || ''
      }))

      return { success: true, partners: formattedPartners }

    } else if (user.role === 'orang_tua') {
      // Get parent student profile
      const { data: parent } = await supabase
        .from('parents_tk')
        .select('student_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!parent?.student_id) return { partners: [] }

      // Get student's class
      const { data: student } = await supabase
        .from('students_tk')
        .select('kelas_id')
        .eq('id', parent.student_id)
        .maybeSingle()

      if (!student?.kelas_id) return { partners: [] }

      // Get class wali kelas (teacher)
      const { data: cls } = await supabase
        .from('classes_tk')
        .select('guru_id, nama')
        .eq('id', student.kelas_id)
        .maybeSingle()

      if (!cls?.guru_id) return { partners: [] }

      // Get teacher profile and user account
      const { data: teacher } = await supabase
        .from('teachers_tk')
        .select('*, users_tk(id, username, email)')
        .eq('id', cls.guru_id)
        .maybeSingle()

      if (!teacher || !teacher.user_id) return { partners: [] }

      const formattedPartners = [{
        id: teacher.user_id,
        name: `Ustadz/Ustadzah ${teacher.nama} (Wali Kelas ${cls.nama})`,
        role: 'guru',
        email: teacher.users_tk?.email || ''
      }]

      return { success: true, partners: formattedPartners }
    }

    return { partners: [] }
  } catch (e: any) {
    console.error('Error fetching chat partners:', e)
    return { error: e.message, partners: [] }
  }
}
