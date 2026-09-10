import 'dotenv/config'
import { prisma } from '../lib/prisma'

const TARGET_CLASSES = [
  'Mina Arafah',
  'Shafa Marwah',
  'Ali bin Abi Thalib',
  'Umar bin Khattab',
  'Hamzah bin Abdul Muthalib',
  'Bilal bin Rabbah',
  'Abu Bakar Ash Shiddiq',
  'Utsman bin Affan',
  'Khalid Bin Walid',
]

const DEFAULT_TAHUN_AJARAN = '2026/2027'

async function seedClasses() {
  console.log('--- SEEDING CLASSES_TK ---')

  // 1. Fetch existing classes
  const existingClasses = await prisma.class.findMany()
  console.log(`Ditemukan ${existingClasses.length} kelas di database:`)
  existingClasses.forEach((c) => console.log(` - [${c.id}] ${c.nama} (${c.tahun_ajaran})`))

  // 2. Check if dummy class 'TK A' exists, rename it to 'Mina Arafah' so existing FKs stay valid
  const dummyTkA = existingClasses.find(
    (c) => c.nama.trim().toUpperCase() === 'TK A' || c.nama.trim().toUpperCase() === 'TKA'
  )

  if (dummyTkA) {
    console.log(`Mengubah kelas dummy "${dummyTkA.nama}" menjadi "${TARGET_CLASSES[0]}"...`)
    await prisma.class.update({
      where: { id: dummyTkA.id },
      data: {
        nama: TARGET_CLASSES[0],
        tahun_ajaran: dummyTkA.tahun_ajaran || DEFAULT_TAHUN_AJARAN,
      },
    })
  }

  // 3. Ensure all 9 classes exist
  for (const className of TARGET_CLASSES) {
    const found = await prisma.class.findFirst({
      where: {
        nama: {
          equals: className,
          mode: 'insensitive',
        },
      },
    })

    if (!found) {
      const created = await prisma.class.create({
        data: {
          nama: className,
          tahun_ajaran: DEFAULT_TAHUN_AJARAN,
        },
      })
      console.log(`✅ Berhasil menambahkan kelas: ${created.nama} (${created.tahun_ajaran})`)
    } else {
      console.log(`ℹ️ Kelas sudah ada: ${found.nama} (${found.tahun_ajaran})`)
    }
  }

  const finalClasses = await prisma.class.findMany({
    orderBy: { nama: 'asc' },
  })
  console.log('\n--- DAFTAR KELAS AKTIF SAAT INI ---')
  finalClasses.forEach((c, idx) => console.log(`${idx + 1}. ${c.nama} - TA: ${c.tahun_ajaran}`))
}

seedClasses()
  .catch((e) => {
    console.error('Error saat seed kelas:', e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })
