import { jwtVerify, SignJWT } from 'jose'

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'guru' | 'orang_tua';
  exp: number;
}

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET minimal 32 karakter wajib dikonfigurasi.')
  return new TextEncoder().encode(secret)
}

export async function generateJWT(user: Omit<JWTPayload, 'exp'>): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(getSecret())
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    if (!payload.id || !payload.username || !payload.email || !payload.role || !payload.exp) return null
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export const decodeJWT = verifyJWT

export function isJWTExpired(payload: JWTPayload): boolean {
  return payload.exp <= Math.floor(Date.now() / 1000)
}
