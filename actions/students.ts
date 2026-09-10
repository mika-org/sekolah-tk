'use server'

import { prisma } from '@/lib/prisma'
import { requireSessionRole, getSessionUser } from '@/lib/auth/session'

export interface StudentFullDetailResponse {
  success: boolean
  error?: string
  student?: any
  parent?: any
  ppdb?: any
  documents?: any[]
  payment?: any
  user?: any
}

export async function getStudentFullDetail(studentId: string): Promise<StudentFullDetailResponse> {
  try {
    await requireSessionRole(['super_admin', 'admin', 'guru'])

    if (!studentId) {
      return { success: false, error: 'ID Murid tidak valid.' }
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classes_tk: true,
        parents_tk: true,
      },
    })

    if (!student) {
      return { success: false, error: 'Data murid tidak ditemukan.' }
    }

    const parent = student.parents_tk?.[0] || null

    // Find linked portal user account
    let user: any = null
    if (student.user_id) {
      user = await prisma.user.findUnique({
        where: { id: student.user_id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          initial_password: true,
          status: true,
        },
      })
    }

    // Find linked PPDB record
    let ppdb: any = null
    if (student.nik) {
      ppdb = await prisma.ppdb.findFirst({
        where: {
          child_details: {
            path: ['nik'],
            equals: student.nik,
          },
        },
      })
    }

    if (!ppdb && student.nama) {
      ppdb = await prisma.ppdb.findFirst({
        where: {
          student_name: {
            equals: student.nama,
            mode: 'insensitive',
          },
        },
      })
    }

    let documents: any[] = []
    let payment: any = null

    if (ppdb) {
      const [docsData, paymentData] = await Promise.all([
        prisma.ppdbDocument.findMany({
          where: { ppdb_id: ppdb.id },
          orderBy: { id: 'asc' },
        }),
        prisma.payment.findFirst({
          where: { ppdb_id: ppdb.id },
        }),
      ])

      documents = docsData || []
      payment = paymentData || null
    }

    return {
      success: true,
      student,
      parent,
      ppdb,
      documents,
      payment,
      user,
    }
  } catch (err: any) {
    console.error('Error fetching student full detail:', err)
    return {
      success: false,
      error: err.message || 'Gagal memuat detail data murid.',
    }
  }
}

export interface TeacherPlottedDataResponse {
  success: boolean
  error?: string
  isTeacher: boolean
  teacher?: any
  classes: any[]
  students: any[]
}

export async function getTeacherPlottedClassAndStudents(): Promise<TeacherPlottedDataResponse> {
  try {
    const user = await getSessionUser()
    if (!user) {
      return { success: false, error: 'Sesi login tidak ditemukan.', isTeacher: false, classes: [], students: [] }
    }

    // Jika Super Admin atau Admin, berikan semua kelas dan semua murid aktif
    if (['super_admin', 'admin'].includes(user.role)) {
      const [allClasses, allStudents] = await Promise.all([
        prisma.class.findMany({
          include: { teachers_tk: true },
          orderBy: { nama: 'asc' },
        }),
        prisma.student.findMany({
          where: { status: 'active' },
          include: { classes_tk: true, parents_tk: true },
          orderBy: { nama: 'asc' },
        }),
      ])
      return {
        success: true,
        isTeacher: false,
        classes: JSON.parse(JSON.stringify(allClasses)),
        students: JSON.parse(JSON.stringify(allStudents)),
      }
    }

    // Jika Guru, cari akun teacher berdasarkan user_id
    let teacher = await prisma.teacher.findFirst({
      where: { user_id: user.id },
      include: {
        classes_tk: true,
      },
    })

    // Fallback jika belum terhubung via user_id
    if (!teacher && user.email) {
      teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { nama: { contains: user.username, mode: 'insensitive' } },
            { hp: { not: null } },
          ],
        },
        include: {
          classes_tk: true,
        },
      })
    }

    if (!teacher) {
      return {
        success: true,
        isTeacher: true,
        classes: [],
        students: [],
      }
    }

    const classes = teacher.classes_tk || []
    if (classes.length === 0) {
      return {
        success: true,
        isTeacher: true,
        teacher: JSON.parse(JSON.stringify(teacher)),
        classes: [],
        students: [],
      }
    }

    const classIds = classes.map((c) => c.id)

    // Ambil murid yang SUDAH di-plotting ke kelas guru ini
    const students = await prisma.student.findMany({
      where: {
        kelas_id: { in: classIds },
        status: 'active',
      },
      include: {
        classes_tk: true,
        parents_tk: true,
      },
      orderBy: { nama: 'asc' },
    })

    return {
      success: true,
      isTeacher: true,
      teacher: JSON.parse(JSON.stringify(teacher)),
      classes: JSON.parse(JSON.stringify(classes)),
      students: JSON.parse(JSON.stringify(students)),
    }
  } catch (err: any) {
    console.error('getTeacherPlottedClassAndStudents error:', err)
    return {
      success: false,
      error: err.message || 'Gagal memuat data kelas guru.',
      isTeacher: false,
      classes: [],
      students: [],
    }
  }
}
