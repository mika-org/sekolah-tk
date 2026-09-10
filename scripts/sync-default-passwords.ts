import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function run() {
  console.log('=== 1. MENAMBAHKAN KOLOM initial_password KE users_tk ===')
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "users_tk" ADD COLUMN IF NOT EXISTS "initial_password" TEXT;
  `)
  console.log('✅ Kolom initial_password berhasil dipastikan ada di users_tk')

  console.log('\n=== 2. SINKRONISASI PASSWORD AWAL / DEFAULT DI users_tk ===')
  const users = await prisma.user.findMany({
    include: {
      parents_tk: {
        include: {
          students_tk: true,
        },
      },
    },
  })

  let updatedCount = 0
  for (const u of users) {
    let defaultPass = u.initial_password

    if (!defaultPass) {
      if (['guru', 'admin', 'super_admin'].includes(u.role)) {
        defaultPass = 'Istiqamah2026!'
      } else if (u.role === 'orang_tua') {
        const student = u.parents_tk?.[0]?.students_tk
        if (student?.tanggal_lahir) {
          const d = new Date(student.tanggal_lahir)
          const dd = String(d.getDate()).padStart(2, '0')
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const yyyy = d.getFullYear()
          defaultPass = `${dd}${mm}${yyyy}`
        } else {
          defaultPass = 'Istiqamah2026!'
        }
      } else {
        defaultPass = 'Istiqamah2026!'
      }

      await prisma.user.update({
        where: { id: u.id },
        data: { initial_password: defaultPass },
      })
      updatedCount++
      console.log(`🔑 Disinkronkan: ${u.username} (${u.role}) -> initial_password: ${defaultPass}`)
    } else {
      console.log(`ℹ️ Sudah ada password: ${u.username} -> ${defaultPass}`)
    }
  }

  console.log(`\n🎉 Selesai! ${updatedCount} akun berhasil disinkronkan password awalnya.`)
}

run()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
