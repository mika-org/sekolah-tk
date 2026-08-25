import type { NextRequest } from 'next/server'
import type { JWTPayload } from '@/lib/jwt'
import { verifyJWT } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function getRequestUser(request: NextRequest) {
  const token = request.cookies.get('sekolah_tk_token')?.value
  const payload = token ? await verifyJWT(token) : null
  if (!payload) return null
  const account = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { status: true, role: true },
  })
  return account?.status === 'active' && account.role === payload.role ? payload : null
}

export async function requestHasRole(request: NextRequest, roles: JWTPayload['role'][]) {
  const user = await getRequestUser(request)
  return Boolean(user && roles.includes(user.role))
}
