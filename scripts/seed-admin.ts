import { loadEnvFile } from 'node:process'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL wajib diisi.')

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1]
  }
  return undefined
}

const username = (
  getArg('--username') ||
  process.env.SEED_ADMIN_USERNAME ||
  'superadmin'
).trim().toLowerCase()

const email = (
  getArg('--email') ||
  process.env.SEED_ADMIN_EMAIL ||
  'admin@istiqamah.sch.id'
).trim().toLowerCase()

const password = (
  getArg('--password') ||
  process.env.SEED_ADMIN_PASSWORD ||
  'AdminIstiqamah2026!'
)

if (password.length < 8) {
  throw new Error('Password super admin minimal 8 karakter.')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  try {
    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.upsert({
      where: { email },
      create: { username, email, password_hash, role: 'super_admin', status: 'active' },
      update: { username, password_hash, role: 'super_admin', status: 'active' },
      select: { id: true, username: true, email: true, role: true, status: true },
    })
    console.log('✅ Super admin berhasil di-seed / disinkronkan:')
    console.log(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      password: password,
    }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

void main().catch((error) => { console.error('❌ Gagal melakukan seed:', error.message); process.exitCode = 1 })

