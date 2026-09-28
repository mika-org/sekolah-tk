import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE galleries_tk 
    ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
  `)
  console.log('Successfully altered galleries_tk table!')
  
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'galleries_tk'
    ORDER BY ordinal_position
  `)
  console.log('Updated columns:', cols)

  await prisma.$disconnect()
}

main().catch(console.error)
