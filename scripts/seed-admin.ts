import { loadEnvFile } from 'node:process'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}

const connectionString = process.env.DATABASE_URL
const username = process.env.SEED_ADMIN_USERNAME?.trim().toLowerCase()
const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.SEED_ADMIN_PASSWORD

if (!connectionString) throw new Error('DATABASE_URL wajib diisi.')
if (!username || !email || !password || password.length < 12) {
  throw new Error('SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, dan SEED_ADMIN_PASSWORD minimal 12 karakter wajib diisi.')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  try {
    const password_hash = await bcrypt.hash(password!, 12)
    const user = await prisma.user.upsert({
      where: { email: email! },
      create: { username: username!, email: email!, password_hash, role: 'super_admin', status: 'active' },
      update: { username: username!, password_hash, role: 'super_admin', status: 'active' },
      select: { id: true, username: true, email: true, role: true },
    })
    console.log('Super admin synchronized:', user)
  } finally {
    await prisma.$disconnect()
  }
}

void main().catch((error) => { console.error(error.message); process.exitCode = 1 })
