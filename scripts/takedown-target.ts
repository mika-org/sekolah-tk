import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'
import fs from 'node:fs'
import path from 'node:path'

try { loadEnvFile('.env') } catch {}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  // Delete from galleries_tk where image contains WhatsApp Image 2026-09-09 at 14.26.03.webp
  const deleted = await prisma.$executeRawUnsafe(`
    DELETE FROM galleries_tk 
    WHERE image LIKE '%WhatsApp Image 2026-09-09 at 14.26.03.webp%'
       OR title LIKE '%Pentas Seni Tari Kreasi Nusantara%'
  `)
  console.log('Deleted rows from galleries_tk:', deleted)

  // Also check if file exists in public/images/gallery/galeri/
  const filePath = path.join(process.cwd(), 'public', 'images', 'gallery', 'galeri', 'WhatsApp Image 2026-09-09 at 14.26.03.webp')
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log('Deleted file from disk:', filePath)
  } else {
    console.log('File does not exist on disk:', filePath)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
