import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const GALLERY_ITEMS = [
  {
    title: 'Wisudawan Cilik Tahfidz Al-Qur\'an',
    image: '/images/gallery/galeri/DSC00536.webp',
    category: 'Prestasi',
  },
  {
    title: 'Prestasi Juara Lomba Tari Kreasi PAUD/TK',
    image: '/images/gallery/galeri/99190870-c2d5-477d-98df-2a8db67151b5.webp',
    category: 'Prestasi',
  },
  {
    title: 'Qur\'an Camp: Dari Qur\'an Aku Belajar Mandiri',
    image: '/images/gallery/galeri/IMG_8916_11.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Field Trip Edukatif Naik Kereta Api',
    image: '/images/gallery/galeri/0e5f36e8-e974-492f-8584-23ee4ef3eef3_1.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Mengenal Profesi Bersama Masinis KAI',
    image: '/images/gallery/galeri/2d4578ca-b1d2-422c-879a-a7a7caa15439_2.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Tertib & Disiplin di Peron Stasiun Kereta',
    image: '/images/gallery/galeri/c75c267a-c04f-44bd-981d-f00b6fd6c639.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Eksplorasi Sains di Science Center Ocean World',
    image: '/images/gallery/galeri/9a40f375-8544-462f-bb0c-e6faeeb1f0e7_4.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Kunjungan Edukasi Alam di Jendela Alam',
    image: '/images/gallery/galeri/fa2093cb-7375-4119-86dc-21d904c2b663.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Ketangkasan & Keberanian Outbound Flying Fox',
    image: '/images/gallery/galeri/6bd691a0-eb0d-4951-bb91-d1b22d5b6145.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Keceriaan Berkemah di Qur\'an Camp',
    image: '/images/gallery/galeri/25d4958f-3543-4d72-9e87-908ce770afe2.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Malam Api Unggun & Tasyakuran Ceria',
    image: '/images/gallery/galeri/IMG_1196_10.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Petualangan Bermain Air & Kerjasama Tim',
    image: '/images/gallery/galeri/7de9d875-2a05-4a1b-92d7-11eb2386abc1_3.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Pelepasan & Wisuda Tahfizh Siswa Berprestasi',
    image: '/images/gallery/galeri/IMG_3646.webp',
    category: 'Prestasi',
  },
  {
    title: 'Wisuda Putri Tahfidz Al-Qur\'an',
    image: '/images/gallery/galeri/DSC00402.webp',
    category: 'Prestasi',
  },
  {
    title: 'Gema Shalawat & Nasyid di Panggung Utama',
    image: '/images/gallery/galeri/DSC01556.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Lantunan Asmaul Husna Santriwati',
    image: '/images/gallery/galeri/DSC01557.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Penyerahan Plakat Apresiasi Siswa',
    image: '/images/gallery/galeri/DSC05496.webp',
    category: 'Prestasi',
  },
  {
    title: 'Kelulusan Kenaikan Jilid Tilawati',
    image: '/images/gallery/galeri/630f908a-4f6f-49fa-9494-ce33a4a34ea8_5.webp',
    category: 'Prestasi',
  },
  {
    title: 'Pembelajaran Tilawati Klasikal di Kelas',
    image: '/images/gallery/galeri/db00711f-5a6f-44e5-96da-90025f51e7dd.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Praktik Gerakan Shalat Berjamaah',
    image: '/images/gallery/galeri/IMG_5191.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Aktivitas Sensorik & Life Skill Mandiri',
    image: '/images/gallery/galeri/IMG_5178.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Karya Kreativitas Mewarnai Kolaboratif',
    image: '/images/gallery/galeri/IMG_0912_8.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Suasana Belajar Aktif & Berpusat Pada Anak',
    image: '/images/gallery/galeri/IMG_4891.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Gerak Irama & Lagu Ceria Dalam Kelas',
    image: '/images/gallery/galeri/6f3a79a8-d071-4025-9ca9-3f30f5668eea.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Ekstrakurikuler Seni Musik Angklung Sunda',
    image: '/images/gallery/galeri/IMG-20260909-WA0025.jpg.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Eksplorasi Suara di Studio Podcast Sekolah',
    image: '/images/gallery/galeri/b9984032-e597-49e9-b273-bd9b2f6d5c44.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Olahraga Peregangan & Senam Sehat Pagi',
    image: '/images/gallery/galeri/3e41d139-1d9f-43e8-81a6-1608646b4ded.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Pertandingan Futsal Mini Anak',
    image: '/images/gallery/galeri/c36b51a1-d106-4bdf-a348-083f266b0106.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Briefing Strategi Tim Futsal Bersama Pelatih',
    image: '/images/gallery/galeri/cd40c543-e0a4-4d7c-8ef3-39cc5960a025.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Pentas Seni Tari Kreasi Nusantara',
    image: '/images/gallery/galeri/WhatsApp Image 2026-09-09 at 14.26.03.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Tari Saman Cilik Penuh Kekompakan',
    image: '/images/gallery/galeri/e7777a50-bd66-4a1f-8fcf-65186e447c02.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Tari Tradisional Merak Berbusana Batik',
    image: '/images/gallery/galeri/f17b6a33-20f2-4487-b5c0-bbbb1afec095.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Pentas Gerak & Tari Kumbang Cilik',
    image: '/images/gallery/galeri/IMG_1958.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Tari Lebah Imut Penuh Percaya Diri',
    image: '/images/gallery/galeri/IMG_1959.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Kesiapan di Balik Panggung Pentas Seni',
    image: '/images/gallery/galeri/IMG_1963.webp',
    category: 'Kegiatan',
  },
  {
    title: 'Drama Teater Pendekar Cilik Berkarakter',
    image: '/images/gallery/galeri/IMG_1966_7.webp',
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
