export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'guru' | 'orang_tua';
  exp: number;
}

export function generateJWT(user: { id: string; username: string; email: string; role: 'super_admin' | 'admin' | 'guru' | 'orang_tua' }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Date.now() + 2 * 60 * 60 * 1000 // 2 hours expiration
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signature = 'sekolah_tk_sig_hash_client';

  return `${base64Header}.${base64Payload}.${signature}`;
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    return JSON.parse(payloadJson) as JWTPayload;
  } catch (err) {
    return null;
  }
}

export function isJWTExpired(payload: JWTPayload): boolean {
  return payload.exp < Date.now();
}
