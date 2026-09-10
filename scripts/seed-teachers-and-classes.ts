import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

const TEACHERS = [
  {
    nama: 'Heti Herawati, S.Pd.',
    role: 'admin',
    jabatan: 'Kepala Sekolah',
    username: 'heti.herawati',
    email: 'heti.herawati@istiqamah.sch.id',
    className: null,
  },
  {
    nama: 'Reuhulina Putri, S.Pd',
    role: 'guru',
    jabatan: 'Guru',
    username: 'reuhulina.putri',
    email: 'reuhulina.putri@istiqamah.sch.id',
    className: 'Mina Arafah',
  },
  {
    nama: 'Ria Trianawati, S.Pd',
    role: 'guru',
    jabatan: 'Guru',
    username: 'ria.trianawati',
    email: 'ria.trianawati@istiqamah.sch.id',
    className: 'Shafa Marwah',
  },
  {
    nama: 'Isma Monica, S.Pd',
    role: 'guru',
    jabatan: 'Guru',
    username: 'isma.monica',
    email: 'isma.monica@istiqamah.sch.id',
    className: 'Ali bin Abi Thalib',
  },
  {
    nama: 'Dinanty Nurshabrina, S.Pd',
    role: 'guru',
    jabatan: 'Guru',
    username: 'dinanty.nurshabrina',
    email: 'dinanty.nurshabrina@istiqamah.sch.id',
    className: 'Umar bin Khattab',
  },
  {
    nama: 'Sari Ningsih, S.Pd',
    role: 'guru',
    jabatan: 'Guru',
    username: 'sari.ningsih',
    email: 'sari.ningsih@istiqamah.sch.id',
    className: 'Hamzah bin Abdul Muthalib',
  },
  {
    nama: 'Lia Marliati, S.Pd.AUD',
    role: 'guru',
    jabatan: 'Guru',
    username: 'lia.marliati',
    email: 'lia.marliati@istiqamah.sch.id',
    className: 'Bilal bin Rabbah',
  },
  {
    nama: 'Yulia Muzdalipah, S.Pd',
    role: 'guru',
    jabatan: 'Guru',
    username: 'yulia.muzdalipah',
    email: 'yulia.muzdalipah@istiqamah.sch.id',
    className: 'Abu Bakar Ash Shiddiq',
  },
  {
    nama: 'Ummu Salamah, S.Pd.AUD',
    role: 'guru',
    jabatan: 'Guru',
    username: 'ummu.salamah',
    email: 'ummu.salamah@istiqamah.sch.id',
    className: 'Utsman bin Affan',
  },
  {
    nama: 'Nur Fitri Hadyatmi, S.Pd',
    role: 'guru',
    jabatan: 'Guru',
    username: 'nur.fitri',
    email: 'nur.fitri@istiqamah.sch.id',
    className: 'Khalid Bin Walid',
  },
]

const DEFAULT_PASSWORD = 'Istiqamah2026!'

async function run() {
  console.log('=== 1. UPDATE BIAYA PPDB (ppdb_fee = 500000) ===')
  const feeSetting = await prisma.setting.upsert({
    where: { key: 'ppdb_fee' },
    create: {
      key: 'ppdb_fee',
      value: '500000',
    },
    update: {
      value: '500000',
      updated_at: new Date(),
    },
  })
  console.log(`✅ Biaya PPDB berhasil diatur ke: Rp ${Number(feeSetting.value).toLocaleString('id-ID')}`)

  console.log('\n=== 2. MEMBUAT AKUN & DATA GURU / KEPALA SEKOLAH ===')
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const item of TEACHERS) {
    // A. Upsert User in users_tk
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: item.username },
          { email: item.email },
        ],
      },
    })

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: item.username,
          email: item.email,
          role: item.role,
          status: 'active',
          password_hash: passwordHash,
        },
      })
      console.log(`🔄 Akun diperbarui: ${item.username} (${item.role})`)
    } else {
      user = await prisma.user.create({
        data: {
          username: item.username,
          email: item.email,
          role: item.role,
          status: 'active',
          password_hash: passwordHash,
        },
      })
      console.log(`✅ Akun dibuat: ${item.username} (${item.role})`)
    }

    // B. Upsert Teacher in teachers_tk
    let teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { nama: item.nama },
          { user_id: user.id },
        ],
      },
    })

    if (teacher) {
      teacher = await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          nama: item.nama,
          user_id: user.id,
        },
      })
      console.log(`🔄 Profil Guru diperbarui: ${item.nama}`)
    } else {
      teacher = await prisma.teacher.create({
        data: {
          nama: item.nama,
          user_id: user.id,
        },
      })
      console.log(`✅ Profil Guru dibuat: ${item.nama}`)
    }

    // C. Plotting ke Kelas (jika wali kelas)
    if (item.className) {
      const targetClass = await prisma.class.findFirst({
        where: {
          nama: {
            equals: item.className,
            mode: 'insensitive',
          },
        },
      })

      if (targetClass) {
        await prisma.class.update({
          where: { id: targetClass.id },
          data: {
            guru_id: teacher.id,
          },
        })
        console.log(`   🎯 Diplot ke Kelas: [${targetClass.nama}] (ID Kelas: ${targetClass.id})`)
      } else {
        console.warn(`   ⚠️ Kelas tidak ditemukan: ${item.className}`)
      }
    } else {
      console.log(`   🏛️ Jabatan: ${item.jabatan} (Seluruh unit TK)`)
    }
  }

  console.log('\n=== 3. REKAP HASIL PLOTTING KELAS & WALI KELAS ===')
  const classes = await prisma.class.findMany({
    include: {
      teachers_tk: {
        include: {
          users_tk: true,
        },
      },
    },
    orderBy: { nama: 'asc' },
  })

  classes.forEach((c, idx) => {
    console.log(`${idx + 1}. Kelas ${c.nama} (TA ${c.tahun_ajaran})`)
    console.log(`   Wali Kelas : ${c.teachers_tk?.nama || 'Belum diplot'}`)
    console.log(`   Akun Login : ${c.teachers_tk?.users_tk?.username || '-'} (${c.teachers_tk?.users_tk?.email || '-'})`)
  })
}

run()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })
