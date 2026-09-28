import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'
import fs from 'node:fs'
import path from 'node:path'
import { saveStoredFile } from '../lib/storage'

try { loadEnvFile('.env') } catch {}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

async function main() {
  console.log('🚀 Memulai migrasi 35 foto galeri ke server storage...')

  const items = await prisma.gallery.findMany({
    where: { category: { not: 'Hero Banner' } },
    orderBy: { created_at: 'desc' }
  })

  console.log(`Ditemukan ${items.length} item galeri di database.`)

  let migratedCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const item of items) {
    try {
      // Periksa apakah masih mengarah ke public/images/gallery/galeri/
      if (item.image.includes('/images/gallery/galeri/')) {
        const filename = item.image.split('/').pop()
        if (!filename) {
          console.warn(`[SKIP] Format nama file tidak valid: ${item.image}`)
          skippedCount++
          continue
        }

        const sourcePath = path.join(process.cwd(), 'public', 'images', 'gallery', 'galeri', filename)

        if (!fs.existsSync(sourcePath)) {
          console.warn(`[NOT FOUND] File tidak ditemukan di disk: ${sourcePath}`)
          skippedCount++
          continue
        }

        const fileBuffer = fs.readFileSync(sourcePath)

        // Simpan ke storage bucket_tk/gallery/
        const storagePath = `gallery/${filename}`
        const storageUrl = await saveStoredFile('bucket_tk', storagePath, fileBuffer)

        // Update link di database
        await prisma.gallery.update({
          where: { id: item.id },
          data: { image: storageUrl }
        })

        console.log(`✅ [${++migratedCount}/${items.length}] "${item.title}" -> ${storageUrl}`)
      } else {
        console.log(`[ALREADY STORED] "${item.title}" sudah di server storage: ${item.image}`)
        skippedCount++
      }
    } catch (err: any) {
      console.error(`❌ Error migrasi [${item.id} - ${item.title}]:`, err.message)
      errorCount++
    }
  }

  console.log('\n📊 Ringkasan Migrasi:')
  console.log(`- Berhasil dimigrasi ke storage: ${migratedCount}`)
  console.log(`- Dilewati (sudah di storage/tidak ditemukan): ${skippedCount}`)
  console.log(`- Gagal: ${errorCount}`)

  await prisma.$disconnect()
}

main().catch(console.error)
