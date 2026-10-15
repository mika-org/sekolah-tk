import { NextResponse } from 'next/server'
import { markNotificationsAsRead } from '@/lib/notifications/emitter'

export async function POST() {
  try {
    markNotificationsAsRead()
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
