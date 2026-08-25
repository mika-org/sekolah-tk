'use server'

import { createAdminClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from '@/lib/auth/session'
import { CRITERIA_MAP, type SaveGradePayload } from '@/lib/grades'

export async function saveWeeklyGrade(payload: SaveGradePayload) {
  try {
    const user = await getSessionUser()
    if (!user || !['guru', 'admin', 'super_admin'].includes(user.role)) {
      return { error: 'Anda tidak memiliki izin untuk menginput nilai.' }
    }

    const supabase = createAdminClient()

    // Get teacher id if user is a teacher
    let teacherId: string | null = null
    if (user.role === 'guru') {
      const { data: teacher } = await supabase
        .from('teachers_tk')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (teacher) teacherId = teacher.id
    }

    const score = CRITERIA_MAP[payload.criteria]?.score || 3
    const year = payload.academicYear || '2026/2027'
    const metaTag = `[M${payload.week}-TW${payload.trimester}-${payload.semester}-${year}][${payload.criteria}]`
    const description = `${metaTag} ${payload.notes?.trim() || ''}`.trim()

    const { data, error } = await supabase
      .from('grades_tk')
      .insert({
        student_id: payload.studentId,
        teacher_id: teacherId,
        subject: payload.subject,
        score,
        description,
      })
      .select('*, students_tk(nama, kelas_id)')
      .single()

    if (error) {
      console.error('Error saving grade:', error)
      return { error: 'Gagal menyimpan nilai: ' + error.message }
    }

    revalidatePath('/dashboard/guru/grades')
    revalidatePath('/dashboard/orang-tua/grades')
    return { success: true, data }
  } catch (err: any) {
    console.error('saveWeeklyGrade exception:', err)
    return { error: 'Terjadi kesalahan: ' + err.message }
  }
}

export async function deleteGrade(id: string) {
  try {
    const user = await getSessionUser()
    if (!user || !['guru', 'admin', 'super_admin'].includes(user.role)) {
      return { error: 'Tidak memiliki izin.' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('grades_tk').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/dashboard/guru/grades')
    revalidatePath('/dashboard/orang-tua/grades')
    return { success: true }
  } catch (err: any) {
    return { error: 'Gagal menghapus nilai: ' + err.message }
  }
}
