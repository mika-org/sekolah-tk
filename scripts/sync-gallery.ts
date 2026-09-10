import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const GALLERY_ITEMS = [
  {
    title: 'Belajar Berhitung & Menulis di Kelas Ceria',
    image: '/images/gallery/1.jpg',
    category: 'Kegiatan',
  },
  {
    title: 'Pentas Seni Tari Tradisional Anak',
    image: '/images/gallery/2.jpg',
    category: 'Kegiatan',
  },
  {
    title: 'Prestasi Juara Lomba Siswa & Apresiasi',
    image: '/images/gallery/3.jpg',
    category: 'Prestasi',
  },
  {
    title: 'Keceriaan Drama & Pentas Seni Budaya Daerah',
    image: '/images/gallery/4.jpg',
    category: 'Kegiatan',
  },
  {
    title: 'Cooking Day & Kreasi Masak Cilik',
    image: '/images/gallery/5.jpg',
    category: 'Kegiatan',
  },
  {
    title: 'Sarana Bermain Keseimbangan Outdoor',
    image: '/images/gallery/6.jpg',
    category: 'Sarana',
  },
  {
    title: 'Ketangkasan Memanjat Jaring Outbound',
    image: '/images/gallery/7.jpg',
    category: 'Kegiatan',
  },
  {
    title: 'Lomba Adzan & Iqomah Pentas PAI',
    image: '/images/gallery/8.jpg',
    category: 'Prestasi',
  },
  {
    title: 'Petualangan Naik Rakit Air Outbound',
    image: '/images/gallery/9.jpg',
    category: 'Kegiatan',
  },
  {
    title: 'Edukasi Mengenal & Menyayangi Hewan Kelinci',
    image: '/images/gallery/10.jpg',
    category: 'Kegiatan',
  },
]

async function main() {
  try {
    // Delete non-hero gallery records
    await prisma.gallery.deleteMany({
      where: {
        category: { not: 'Hero Banner' },
      },
    })

    // Insert 10 gallery photos
    for (const item of GALLERY_ITEMS) {
      await prisma.gallery.create({
        data: item,
      })
    }

    const count = await prisma.gallery.count()
    console.log('✅ Gallery synced successfully. Total items in DB:', count)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
