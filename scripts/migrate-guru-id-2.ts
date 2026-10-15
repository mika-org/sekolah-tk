import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  console.log('Adding guru_id_2 column to classes_tk...')
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "classes_tk" 
    ADD COLUMN IF NOT EXISTS "guru_id_2" UUID;
  `)

  console.log('Adding foreign key constraint and index...')
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'classes_tk_guru_id_2_fkey'
      ) THEN
        ALTER TABLE "classes_tk" 
        ADD CONSTRAINT "classes_tk_guru_id_2_fkey" 
        FOREIGN KEY ("guru_id_2") REFERENCES "teachers_tk"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;
  `)

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "classes_tk_guru_id_2_idx" ON "classes_tk"("guru_id_2");
  `)

  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'classes_tk'
  `)
  console.log('Updated classes_tk columns:', cols)
}

main()
  .catch((e) => {
    console.error('Migration error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
