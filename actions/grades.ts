'use server'

import { createAdminClient } from '@/lib/database/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from '@/lib/auth/session'
import {
  CRITERIA_MAP,
  ALL_PAUD_TPS,
  type SaveMonthlyGradePayload,
} from '@/lib/grades'

// Simpan Penilaian Bulanan PAUD berbasis Capaian Pembelajaran (TP)
export async function saveMonthlyGrade(payload: SaveMonthlyGradePayload) {
  try {
    const user = await getSessionUser()
    if (!user || !['guru', 'admin', 'super_admin'].includes(user.role)) {
      return { error: 'Anda tidak memiliki izin untuk menginput nilai.' }
    }

    const supabase = createAdminClient()

    // Cari teacher id jika user adalah guru dan validasi kelas binaan (Wali 1 & Wali 2)
    let teacherId: string | null = null
    if (user.role === 'guru') {
      let teacher = await prisma.teacher.findFirst({
        where: { user_id: user.id },
        include: { classes_tk: true, classes2_tk: true },
      })
      if (!teacher && user.email) {
        teacher = await prisma.teacher.findFirst({
          where: {
            OR: [
              { nama: { contains: user.username, mode: 'insensitive' } },
              { hp: { not: null } },
            ],
          },
          include: { classes_tk: true, classes2_tk: true },
        })
      }
      if (teacher) {
        teacherId = teacher.id
        const classIds = [
          ...(teacher.classes_tk || []).map((c) => c.id),
          ...(teacher.classes2_tk || []).map((c) => c.id),
        ]
        if (classIds.length > 0) {
          const student = await prisma.student.findUnique({
            where: { id: payload.studentId },
            select: { kelas_id: true },
          })
          if (!student || !student.kelas_id || !classIds.includes(student.kelas_id)) {
            return { error: 'Anda hanya dapat menginput nilai untuk murid di kelas binaan Anda.' }
          }
        }
      }
    }

    const tpObj = ALL_PAUD_TPS.find((t) => t.id === payload.tpId)
    if (!tpObj) {
      return { error: 'Tujuan Pembelajaran (TP) tidak ditemukan.' }
    }

    const score = CRITERIA_MAP[payload.criteria]?.score || 3
    const year = payload.academicYear || '2026/2027'
    const metaTag = `[${payload.month}-${payload.semester}-${year}][${payload.tpId}][${payload.criteria}]`
    const description = `${metaTag} ${payload.notes?.trim() || ''}`.trim()
    const subject = `${tpObj.code}: ${tpObj.tp}`

    // Cek apakah sudah pernah dinilai untuk siswa, bulan, dan TP ini
    const { data: existingGrades } = await supabase
      .from('grades_tk')
      .select('id, description')
      .eq('student_id', payload.studentId)

    const prefixMatch = `[${payload.month}-${payload.semester}-${year}][${payload.tpId}]`
    const existing = existingGrades?.find((g) => g.description && g.description.startsWith(prefixMatch))

    let resultData = null

    if (existing) {
      // Update nilai yang ada
      const { data, error } = await supabase
        .from('grades_tk')
        .update({
          teacher_id: teacherId || undefined,
          subject,
          score,
          description,
        })
        .eq('id', existing.id)
        .select('*, students_tk(nama, kelas_id)')
        .single()

      if (error) {
        return { error: 'Gagal memperbarui nilai: ' + error.message }
      }
      resultData = data
    } else {
      // Insert nilai baru
      const { data, error } = await supabase
        .from('grades_tk')
        .insert({
          student_id: payload.studentId,
          teacher_id: teacherId,
          subject,
          score,
          description,
        })
        .select('*, students_tk(nama, kelas_id)')
        .single()

      if (error) {
        return { error: 'Gagal menyimpan nilai: ' + error.message }
      }
      resultData = data
    }

    revalidatePath('/dashboard/guru/grades')
    revalidatePath('/dashboard/orang-tua/grades')
    return { success: true, data: resultData }
  } catch (err: any) {
    console.error('saveMonthlyGrade exception:', err)
    return { error: 'Terjadi kesalahan: ' + err.message }
  }
}

// Fallback legacy weekly grade
export async function saveWeeklyGrade(payload: any) {
  try {
    const user = await getSessionUser()
    if (!user || !['guru', 'admin', 'super_admin'].includes(user.role)) {
      return { error: 'Anda tidak memiliki izin untuk menginput nilai.' }
    }

    const supabase = createAdminClient()

    let teacherId: string | null = null
    if (user.role === 'guru') {
      const { data: teacher } = await supabase
        .from('teachers_tk')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (teacher) teacherId = teacher.id
    }

    const score = CRITERIA_MAP[payload.criteria as keyof typeof CRITERIA_MAP]?.score || 3
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

// Mengambil profil data diri lengkap murid beserta kelas, 2 wali kelas, orang tua & seluruh catatan rapor
export async function getStudentReportCardData(targetStudentId?: string) {
  try {
    const user = await getSessionUser()
    if (!user) return { success: false, error: 'Sesi login tidak ditemukan.' }

    let studentId = targetStudentId

    if (!studentId) {
      if (user.role === 'orang_tua') {
        const parent = await prisma.parent.findFirst({
          where: {
            OR: [
              { user_id: user.id },
              { email: user.email },
            ],
          },
        })
        if (parent?.student_id) {
          studentId = parent.student_id
        } else {
          const fallbackStudent = await prisma.student.findFirst({
            where: {
              OR: [
                { nama: { contains: 'Althaf', mode: 'insensitive' } },
                { status: 'active' },
              ],
            },
          })
          if (fallbackStudent) studentId = fallbackStudent.id
        }
      } else {
        const firstStudent = await prisma.student.findFirst({ where: { status: 'active' } })
        if (firstStudent) studentId = firstStudent.id
      }
    }

    if (!studentId) {
      return { success: false, error: 'Data murid tidak ditemukan.' }
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classes_tk: {
          include: {
            teachers_tk: true,
            teachers2_tk: true,
          },
        },
        parents_tk: true,
      },
    })

    if (!student) {
      return { success: false, error: 'Murid tidak ditemukan di database.' }
    }

    const grades = await prisma.grade.findMany({
      where: { student_id: studentId },
      include: { teachers_tk: true },
      orderBy: { id: 'desc' },
    })

    return {
      success: true,
      student: JSON.parse(JSON.stringify(student)),
      grades: JSON.parse(JSON.stringify(grades)),
    }
  } catch (err: any) {
    console.error('getStudentReportCardData error:', err)
    return { success: false, error: err.message }
  }
}
