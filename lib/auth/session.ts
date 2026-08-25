import 'server-only'

import { cookies } from 'next/headers'
import type { JWTPayload } from '@/lib/jwt'
import { verifyJWT } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function getSessionUser(): Promise<JWTPayload | null> {
  const token = (await cookies()).get('sekolah_tk_token')?.value
  const payload = token ? await verifyJWT(token) : null
  if (!payload) return null
  const account = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { status: true, role: true },
  })
  return account?.status === 'active' && account.role === payload.role ? payload : null
}

export async function requireSessionRole(roles: JWTPayload['role'][]) {
  const user = await getSessionUser()
  if (!user || !roles.includes(user.role)) {
    throw new Error('Anda tidak memiliki izin untuk tindakan ini.')
  }
  return user
}
