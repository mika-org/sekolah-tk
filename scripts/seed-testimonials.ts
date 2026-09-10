import { loadEnvFile } from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const testimonialsToInsert = [
  {
    name: 'Shakil Athaya Mumtaz',
    job: 'Kelas Shafa Marwah',
    content:
      'Terima kasih kepada seluruh guru dan pihak sekolah atas perhatian, kesabaran, serta pendampingan yang telah diberikan kepada Shakil selama bulan ini. Kami melihat adanya perkembangan yang baik dalam sikap, kemandirian, dan semangat belajar Shakil. Sebagai saran dan masukan, kami berharap komunikasi mengenai perkembangan Shakil dapat terus terjalin dengan baik antara sekolah dan orang tua. Kami juga berharap sekolah dapat terus memberikan rekomendasi kegiatan sederhana yang dapat dilakukan di rumah sehingga stimulasi yang diberikan di sekolah dan di rumah dapat berjalan selaras demi mendukung tumbuh kembang Shakil secara optimal.',
    photo: null,
    published: true,
  },
  {
    name: 'Faeyza Zidan Al Karim',
    job: 'Hamzah bin Abdul Muthalib',
    content:
      'Saya mau minta masukan terkait laporan kegiatan bulanan anak contoh hal nya melalui foto kegiatan yg di share di grup kelas Agar saya bisa mendapat gambaran tentang aktivitas dan perkembangan anak di sekolah, baik akademik maupun non-akademik. Tujuannya supaya saya bisa bantu dukung anak dari rumah dan untuk menyelaraskan pola didik anak di rumah dengan disekolah Terima kasih atas perhatian dan kerja samanya',
    photo: null,
    published: true,
  },
  {
    name: 'Raheeq Satvik Relaksana',
    job: 'Umar bin Khattab',
    content:
      'Terima kasih sudah menghargai Raheeq untuk melindungi dirinya ketika temannya mengganggunya. Pada dasaranya Raheeq bukan anak yang suka memulai masalah/pertengkaran, hanya apabila diganggu dia anak yang siap melawan. Saya cukup bangga juga dengan dia. Dia tidak menceritakan hal tersebut ke orangtuanya karena saya yakin dia sudah merasa bisa menyelesaikan masalahnya sendiri.',
    photo: null,
    published: true,
  },
]

async function main() {
  try {
    // Delete existing dummy testimonials
    await prisma.testimonial.deleteMany({
      where: {
        name: { in: ['Budi Santoso', 'Bunda Mila', 'Ayah Rizki', 'Papah Adit'] }
      }
    })

    // Upsert or create the new testimonials
    for (const item of testimonialsToInsert) {
      const existing = await prisma.testimonial.findFirst({
        where: { name: item.name }
      })
      if (existing) {
        await prisma.testimonial.update({
          where: { id: existing.id },
          data: item
        })
        console.log(`Updated testimonial for ${item.name}`)
      } else {
        await prisma.testimonial.create({
          data: item
        })
        console.log(`Created testimonial for ${item.name}`)
      }
    }

    const all = await prisma.testimonial.findMany()
    console.log('Final testimonials in DB:', all)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
