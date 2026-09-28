import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  const items = await prisma.gallery.findMany({
    orderBy: { created_at: 'desc' }
  })
  console.log('Total gallery items:', items.length)
  for (const item of items) {
    console.log(`- [${item.id}] "${item.title}" | cat: ${item.category} | showcase: ${item.is_showcase} | pub: ${item.published} | img: ${item.image}`)
  }
  await prisma.$disconnect()
}

main().catch(console.error)
