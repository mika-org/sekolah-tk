'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSessionUser } from '@/lib/auth/session'

export async function sendChatMessage(receiverId: string, message: string) {
  try {
    const user = await getSessionUser()
    if (!user) return { error: 'Anda harus login untuk mengirim pesan.' }

    const messageText = message?.trim()
    if (!messageText) return { error: 'Pesan tidak boleh kosong.' }

    const chat = await prisma.chat.create({
      data: {
        sender_id: user.id,
        receiver_id: receiverId,
        message: messageText,
      },
    })

    revalidatePath('/dashboard/guru/chat')
    revalidatePath('/dashboard/orang-tua/chat')
    return { success: true, data: chat }
  } catch (e: any) {
    console.error('Error sending chat:', e)
    return { error: 'Gagal mengirim pesan: ' + e.message }
  }
}

export async function getChatMessages(chatPartnerId: string) {
  try {
    const user = await getSessionUser()
    if (!user) return { error: 'Tidak terautentikasi', messages: [] }

    const messages = await prisma.chat.findMany({
      where: {
        OR: [
          { sender_id: user.id, receiver_id: chatPartnerId },
          { sender_id: chatPartnerId, receiver_id: user.id },
        ],
      },
      orderBy: { created_at: 'asc' },
    })

    return { success: true, messages }
  } catch (e: any) {
    console.error('Error fetching chat messages:', e)
    return { error: e.message, messages: [] }
  }
}

// Get chat partners for Guru (Parents) or Orang Tua (Teachers)
export async function getChatPartners() {
  try {
    const user = await getSessionUser()
    if (!user) return { error: 'Tidak terautentikasi', partners: [] }

    if (user.role === 'guru' || user.role === 'admin' || user.role === 'super_admin') {
      // 1. Try to get the teacher record of current logged-in guru
      let teacher = await prisma.teacher.findFirst({
        where: { user_id: user.id },
      })

      // If not linked by user_id, fallback to matching by email or username
      if (!teacher && user.email) {
        teacher = await prisma.teacher.findFirst({
          where: {
            OR: [
              { nama: { contains: user.username, mode: 'insensitive' } },
              { hp: { not: null } },
            ],
          },
        })
      }

      // 2. Get students: if teacher has classes, get their class students; otherwise get all active students
      let studentIds: string[] = []
      if (teacher) {
        const classes = await prisma.class.findMany({
          where: { guru_id: teacher.id },
          select: { id: true },
        })
        const classIds = classes.map((c) => c.id)

        if (classIds.length > 0) {
          const students = await prisma.student.findMany({
            where: { kelas_id: { in: classIds } },
            select: { id: true },
          })
          studentIds = students.map((s) => s.id)
        }
      }

      // If teacher has no specific class or class has no students, fetch all active students
      if (studentIds.length === 0) {
        const allStudents = await prisma.student.findMany({
          where: { status: 'active' },
          select: { id: true },
        })
        studentIds = allStudents.map((s) => s.id)
      }

      // 3. Find parent records with their students and user accounts
      const parents = await prisma.parent.findMany({
        where: studentIds.length > 0 ? { student_id: { in: studentIds } } : undefined,
        include: {
          students_tk: {
            include: {
              classes_tk: true,
            },
          },
          users_tk: true,
        },
      })

      // Also find all users with role 'orang_tua' to ensure every registered parent is reachable
      const parentUsers = await prisma.user.findMany({
        where: { role: 'orang_tua', status: 'active' },
      })

      // Fetch PPDB schedule synchronization
      let ppdbMap = new Map<string, any>()
      try {
        const { createAdminClient } = await import('@/lib/database/server')
        const supabase = createAdminClient()
        const { data: ppdbList } = await supabase.from('ppdb_tk').select('student_name, child_details')
        if (ppdbList) {
          for (const item of ppdbList) {
            if (item.student_name) {
              ppdbMap.set(item.student_name.toLowerCase().trim(), item.child_details?.schedules || null)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching PPDB schedules for chat:', err)
      }

      const partnersMap = new Map<string, { id: string; name: string; role: string; email: string; studentName?: string; phone?: string; className?: string; schedules?: any }>()

      for (const p of parents) {
        const partnerId = p.user_id || p.users_tk?.id || p.id
        const parentName = [p.nama_ayah ? `Ayah ${p.nama_ayah}` : '', p.nama_ibu ? `Ibu ${p.nama_ibu}` : '']
          .filter(Boolean)
          .join(' / ') || 'Orang Tua'
        const childName = p.students_tk?.nama || ''
        const className = p.students_tk?.classes_tk?.nama || ''
        const schedules = childName ? ppdbMap.get(childName.toLowerCase().trim()) : null

        partnersMap.set(partnerId, {
          id: partnerId,
          name: childName ? `${parentName} (${childName})` : parentName,
          role: 'orang_tua',
          email: p.email || p.users_tk?.email || p.hp || '',
          studentName: childName,
          phone: p.hp || '',
          className,
          schedules,
        })
      }

      // Add any parent users not yet in the map
      for (const u of parentUsers) {
        if (!partnersMap.has(u.id)) {
          partnersMap.set(u.id, {
            id: u.id,
            name: `Wali Murid (@${u.username})`,
            role: 'orang_tua',
            email: u.email,
          })
        }
      }

      return {
        success: true,
        partners: Array.from(partnersMap.values()),
      }
    } else if (user.role === 'orang_tua') {
      // For orang tua: find child's teacher/wali kelas, plus all active teachers
      const parent = await prisma.parent.findFirst({
        where: {
          OR: [
            { user_id: user.id },
            { email: user.email },
          ],
        },
        include: {
          students_tk: {
            include: {
              classes_tk: {
                include: {
                  teachers_tk: {
                    include: {
                      users_tk: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      const teachers = await prisma.teacher.findMany({
        include: {
          users_tk: true,
          classes_tk: true,
        },
      })

      const guruUsers = await prisma.user.findMany({
        where: { role: { in: ['guru', 'admin', 'super_admin'] }, status: 'active' },
      })

      const partnersMap = new Map<string, { id: string; name: string; role: string; email: string; className?: string }>()

      // Prioritize direct wali kelas
      const waliKelas = parent?.students_tk?.classes_tk?.teachers_tk
      if (waliKelas && (waliKelas.user_id || waliKelas.users_tk?.id)) {
        const id = waliKelas.user_id || waliKelas.users_tk!.id
        partnersMap.set(id, {
          id,
          name: `Ustadz/Ustadzah ${waliKelas.nama} (Wali Kelas ${parent?.students_tk?.classes_tk?.nama || ''})`,
          role: 'guru',
          email: waliKelas.users_tk?.email || waliKelas.hp || '',
          className: parent?.students_tk?.classes_tk?.nama || '',
        })
      }

      // Add other teachers
      for (const t of teachers) {
        const id = t.user_id || t.users_tk?.id
        if (id && !partnersMap.has(id)) {
          const classNames = t.classes_tk?.map((c) => c.nama).join(', ')
          partnersMap.set(id, {
            id,
            name: `Ustadz/Ustadzah ${t.nama} ${classNames ? `(Guru ${classNames})` : ''}`,
            role: 'guru',
            email: t.users_tk?.email || t.hp || '',
          })
        }
      }

      // Add any guru user accounts
      for (const u of guruUsers) {
        if (!partnersMap.has(u.id) && u.id !== user.id) {
          partnersMap.set(u.id, {
            id: u.id,
            name: `Pengajar / Admin (@${u.username})`,
            role: u.role,
            email: u.email,
          })
        }
      }

      return {
        success: true,
        partners: Array.from(partnersMap.values()),
      }
    }

    return { success: true, partners: [] }
  } catch (e: any) {
    console.error('Error fetching chat partners:', e)
    return { error: 'Gagal memuat kontak: ' + e.message, partners: [] }
  }
}
