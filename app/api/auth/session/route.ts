import { NextRequest, NextResponse } from 'next/server'
import { getRequestUser } from '@/lib/auth/request'

export async function GET(request: NextRequest) {
  const payload = await getRequestUser(request)
  if (!payload) return NextResponse.json({ user: null }, { status: 401 })

  return NextResponse.json({
    user: {
      id: payload.id,
      email: payload.email,
      user_metadata: {
        role: payload.role,
        username: payload.username,
      },
    },
  })
}
