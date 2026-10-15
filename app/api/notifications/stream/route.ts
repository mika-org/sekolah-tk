import { NextRequest } from 'next/server'
import {
  getRecentNotifications,
  subscribePPDBNotification,
  type PPDBNotification,
} from '@/lib/notifications/emitter'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  // Ambil notifikasi dari in-memory store
  let initialNotifications = getRecentNotifications()

  // Jika in-memory masih kosong (misal baru deploy atau restart server), ambil dari DB
  if (initialNotifications.length === 0 && prisma?.ppdb) {
    try {
      const recentApps = await prisma.ppdb.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
      })

      initialNotifications = recentApps.map((app) => {
        const child = (app.child_details as Record<string, any>) || {}
        const father = (app.father_details as Record<string, any>) || {}
        return {
          id: `db_${app.id}`,
          type: (app.payment_status === 'Verified'
            ? 'FORM_COMPLETED'
            : 'NEW_REGISTRATION') as PPDBNotification['type'],
          title: 'Pendaftaran Murid Baru',
          studentName: app.student_name,
          parentName: child.parent_name || father.nama_ayah || 'Orang Tua',
          phone: child.phone || father.hp_ayah || '',
          message: `Calon murid ${app.student_name} terdaftar (${app.status || 'Submitted'}).`,
          link: '/dashboard/admin/ppdb',
          createdAt: app.created_at ? new Date(app.created_at).toISOString() : new Date().toISOString(),
          read: false,
        }
      })
    } catch (e) {
      console.warn('Could not bootstrap notifications from DB:', e)
    }
  }

  let cleanup: (() => void) | null = null
  let pingInterval: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      // 1. Kirim event init berisi notifikasi yang sudah ada
      const initPayload = {
        type: 'INIT',
        notifications: initialNotifications,
      }
      controller.enqueue(encoder.encode(`event: init\ndata: ${JSON.stringify(initPayload)}\n\n`))

      // 2. Berlangganan event emitter notifikasi real-time
      cleanup = subscribePPDBNotification((notification) => {
        try {
          const chunk = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
          controller.enqueue(encoder.encode(chunk))
        } catch (err) {
          console.error('SSE enqueue error:', err)
        }
      })

      // 3. Heartbeat / ping setiap 20 detik agar koneksi tetap aktif di Nginx / proxy
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          if (pingInterval) clearInterval(pingInterval)
        }
      }, 20000)
    },
    cancel() {
      if (cleanup) cleanup()
      if (pingInterval) clearInterval(pingInterval)
    },
  })

  // Tangani saat koneksi ditutup oleh client/browser
  request.signal.addEventListener('abort', () => {
    if (cleanup) cleanup()
    if (pingInterval) clearInterval(pingInterval)
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Khusus Nginx agar tidak buffering SSE
    },
  })
}
