import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
const delegates = {
  users_tk: prisma.user,
  teachers_tk: prisma.teacher,
  classes_tk: prisma.class,
  students_tk: prisma.student,
  parents_tk: prisma.parent,
  ppdb_tk: prisma.ppdb,
  ppdb_documents_tk: prisma.ppdbDocument,
  galleries_tk: prisma.gallery,
  testimonials_tk: prisma.testimonial,
  announcements_tk: prisma.announcement,
  payments_tk: prisma.payment,
  attendance_tk: prisma.attendance,
  grades_tk: prisma.grade,
  activity_logs_tk: prisma.activityLog,
  chats_tk: prisma.chat,
  materials_tk: prisma.material,
  schedules_tk: prisma.schedule,
  settings_tk: prisma.setting,
} as const

async function main() {
  try {
    await prisma.$queryRaw`SELECT 1`
    for (const [table, delegate] of Object.entries(delegates)) {
      console.log(`${table}: ${await (delegate as any).count()}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

void main().catch((error) => { console.error(error.message); process.exitCode = 1 })
