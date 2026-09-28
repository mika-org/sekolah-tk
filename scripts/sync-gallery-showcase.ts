import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  const targetImages = [
    'DSC00536.webp',
    'IMG_8916_11.webp',
    'fa2093cb-7375-4119-86dc-21d904c2b663.webp',
    'e7777a50-bd66-4a1f-8fcf-65186e447c02.webp',
    'IMG_1196_10.webp',
    'IMG_5191.webp',
    'IMG_3646.webp'
  ]

  for (const filename of targetImages) {
    const updated = await prisma.gallery.updateMany({
      where: { image: { contains: filename } },
      data: { is_showcase: true, published: true }
    })
    console.log(`Updated showcase for ${filename}: ${updated.count} row(s)`)
  }

  const showcases = await prisma.gallery.findMany({
    where: { is_showcase: true },
    select: { id: true, title: true, image: true, is_showcase: true }
  })
  console.log(`Total showcase photos in DB: ${showcases.length}`)
  for (const s of showcases) {
    console.log(`- ${s.title} (${s.image})`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
