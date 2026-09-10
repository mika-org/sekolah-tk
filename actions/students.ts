'use server'

import { prisma } from '@/lib/prisma'
import { requireSessionRole } from '@/lib/auth/session'

export interface StudentFullDetailResponse {
  success: boolean
  error?: string
  student?: any
  parent?: any
  ppdb?: any
  documents?: any[]
  payment?: any
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
    }
  } catch (err: any) {
    console.error('Error fetching student full detail:', err)
    return {
      success: false,
      error: err.message || 'Gagal memuat detail data murid.',
    }
  }
}
