'use server'

import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireSessionRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export interface StudentImportRow {
  nama_siswa: string
  tanggal_lahir: string
  jenis_kelamin: string
  nama_ayah?: string
  nama_ibu?: string
  nama_orang_tua?: string
  nik?: string
  nisn?: string
  tempat_lahir?: string
  agama?: string
  alamat?: string
  no_hp?: string
  email_ortu?: string
  pekerjaan_ortu?: string
  nama_kelas?: string
  kelompok?: string
  tanggal_sekolah?: string
  umur_juli?: string
  keterangan?: string
  nominal_bayar?: string | number
  metode_bayar?: string
  tanggal_bayar?: string
}

export interface ImportResultItem {
  rowNumber: number
  studentName: string
  status: 'success' | 'error' | 'skipped'
  username?: string
  password?: string
  studentId?: string
  className?: string
  error?: string
}

export interface ImportStudentsResponse {
  success: boolean
  totalProcessed: number
  totalSuccess: number
  totalFailed: number
  results: ImportResultItem[]
  error?: string
}

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null
  const clean = dateStr.toString().trim()
  if (!clean) return null

  // If already standard ISO or YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const d = new Date(clean)
    if (!isNaN(d.getTime())) return d
  }

  // If DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    const year = parseInt(dmyMatch[3], 10)
    const d = new Date(year, month, day)
    if (!isNaN(d.getTime())) return d
  }

  // Handle Excel serial date if numeric string
  const num = Number(clean)
  if (!isNaN(num) && num > 30000 && num < 60000) {
    // Excel base date Dec 30 1899
    const d = new Date((num - 25569) * 86400 * 1000)
    if (!isNaN(d.getTime())) return d
  }

  const fallback = new Date(clean)
  return isNaN(fallback.getTime()) ? null : fallback
}

function formatPasswordFromDate(date: Date | null): string {
  if (!date || isNaN(date.getTime())) return 'Istiqamah2026!'
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}${mm}${yyyy}`
}

export async function getExistingClassesAction() {
  try {
    await requireSessionRole(['super_admin', 'admin'])
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        nama: true,
        tahun_ajaran: true,
      },
      orderBy: { nama: 'asc' },
    })
    return { success: true, classes }
  } catch (err: any) {
    return { success: false, classes: [], error: err.message }
  }
}

export async function importPaidStudentsAction(
  rows: StudentImportRow[]
): Promise<ImportStudentsResponse> {
  try {
    await requireSessionRole(['super_admin', 'admin'])

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        success: false,
        totalProcessed: 0,
        totalSuccess: 0,
        totalFailed: 0,
        results: [],
        error: 'Tidak ada data siswa yang dikirim untuk diimport.',
      }
    }

    // Preload available classes for fuzzy/name mapping
    const allClasses = await prisma.class.findMany({
      select: { id: true, nama: true },
    })

    const results: ImportResultItem[] = []
    let totalSuccess = 0
    let totalFailed = 0

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]
      const rowNumber = index + 1
      const studentName = (row.nama_siswa || '').trim()

      // --- VALIDATION: MANDATORY FIELDS ---
      // 1. nama_siswa is required
      if (!studentName || studentName.length < 2) {
        totalFailed++
        results.push({
          rowNumber,
          studentName: studentName || `Baris #${rowNumber}`,
          status: 'error',
          error: 'Nama siswa wajib diisi (minimal 2 karakter).',
        })
        continue
      }

      // 2. tanggal_lahir is required
      const birthDate = parseDate(row.tanggal_lahir)
      if (!birthDate) {
        totalFailed++
        results.push({
          rowNumber,
          studentName,
          status: 'error',
          error: 'Tanggal lahir wajib diisi dengan format valid (YYYY-MM-DD atau DD/MM/YYYY).',
        })
        continue
      }

      // 3. jenis_kelamin is required
      const rawGender = (row.jenis_kelamin || '').trim().toUpperCase()
      const gender = rawGender.startsWith('P') ? 'P' : rawGender.startsWith('L') ? 'L' : null
      if (!gender) {
        totalFailed++
        results.push({
          rowNumber,
          studentName,
          status: 'error',
          error: 'Jenis kelamin wajib diisi ("L" untuk Laki-laki atau "P" untuk Perempuan).',
        })
        continue
      }

      // 4. nama_ayah OR nama_ibu OR nama_orang_tua: minimal salah satu diisi
      const parentCombined = (row.nama_orang_tua || '').trim()
      let fatherName = (row.nama_ayah || '').trim()
      let motherName = (row.nama_ibu || '').trim()

      if (!fatherName && !motherName) {
        if (parentCombined) {
          fatherName = parentCombined
        } else {
          totalFailed++
          results.push({
            rowNumber,
            studentName,
            status: 'error',
            error: 'Wajib mengisi Nama Orang Tua (atau Nama Ayah / Nama Ibu).',
          })
          continue
        }
      }

      // --- OPTIONAL FIELDS EXTRACTION ---
      const cleanNik = (row.nik || '').toString().trim().replace(/[^0-9]/g, '').slice(0, 16) || null
      const cleanNisn = (row.nisn || '').toString().trim().replace(/[^0-9]/g, '').slice(0, 10) || null
      const birthPlace = (row.tempat_lahir || '').trim() || null
      const religion = (row.agama || '').trim() || 'Islam'
      const address = (row.alamat || '').trim() || null
      const phone = (row.no_hp || '').trim() || null
      const rawEmail = (row.email_ortu || '').trim().toLowerCase()
      const job = (row.pekerjaan_ortu || '').trim() || null

      // Target class / KLP lookup
      const rawClass = (row.nama_kelas || row.kelompok || '').trim()
      let targetClassId: string | null = null
      let assignedClassName = rawClass || 'Belum di-plot'

      if (rawClass) {
        const queryClass = rawClass.toLowerCase()
        const matched = allClasses.find((c) => {
          const cName = c.nama.toLowerCase()
          return (
            cName === queryClass ||
            cName.includes(queryClass) ||
            queryClass.includes(cName) ||
            (queryClass === 'a' && cName.includes('tk a')) ||
            (queryClass === 'b' && cName.includes('tk b'))
          )
        })
        if (matched) {
          targetClassId = matched.id
          assignedClassName = matched.nama
        }
      }

      // Payment details
      const paymentAmount = row.nominal_bayar ? Number(row.nominal_bayar) : 1500000
      const paymentMethod = (row.metode_bayar || 'Transfer Bank').trim()
      const paymentDate = parseDate(row.tanggal_bayar || row.tanggal_sekolah) || new Date()

      try {
        // --- STEP 1: Generate Unique Username for Parent ---
        const cleanRaw = studentName.toLowerCase().replace(/[^a-z0-9]/g, '')
        const nameParts = studentName
          .trim()
          .split(/\s+/)
          .map((p) => p.toLowerCase().replace(/[^a-z0-9]/g, ''))
          .filter(Boolean)
        const firstName = nameParts[0] || 'murid'

        let baseName = firstName
        if (['m', 'muh', 'md', 'muhammad'].includes(firstName) && nameParts[1]) {
          baseName = `${firstName}${nameParts[1]}`
        } else if (firstName.length < 3 && cleanRaw.length >= 3) {
          baseName = cleanRaw
        }
        baseName = baseName.slice(0, 15) || 'murid'

        let candidateUsername = `ortu_${baseName}`
        let counter = 1

        while (true) {
          const exists = await prisma.user.findUnique({
            where: { username: candidateUsername },
            select: { id: true },
          })
          if (!exists) break
          candidateUsername = `ortu_${baseName}${counter.toString().padStart(2, '0')}`
          counter++
        }
        const username = candidateUsername

        // Unique Email
        let finalEmail = ''
        if (rawEmail && rawEmail.includes('@') && !rawEmail.includes(' ')) {
          finalEmail = rawEmail
          let emailCounter = 1
          while (true) {
            const existsEmail = await prisma.user.findUnique({
              where: { email: finalEmail },
              select: { id: true },
            })
            if (!existsEmail) break
            const atIdx = rawEmail.indexOf('@')
            finalEmail = `${rawEmail.slice(0, atIdx)}+${emailCounter}${rawEmail.slice(atIdx)}`
            emailCounter++
          }
        } else {
          finalEmail = `${username}@ortu.istiqamah.sch.id`
        }

        // --- STEP 2: Password Generation (DDMMYYYY) ---
        const passwordStr = formatPasswordFromDate(birthDate)
        const passwordHash = await bcrypt.hash(passwordStr, 10)
        const newUserId = randomUUID()

        // Create Parent User in users_tk
        const newUser = await prisma.user.create({
          data: {
            id: newUserId,
            username,
            email: finalEmail,
            password_hash: passwordHash,
            initial_password: passwordStr,
            role: 'orang_tua',
            status: 'active',
          },
        })

        // --- STEP 3: Create PPDB Record (Status: Diterima, payment_status: Verified) ---
        const ppdbId = randomUUID()
        const childDetailsJson = {
          student_name: studentName,
          birth_date: birthDate.toISOString().slice(0, 10),
          jenis_kelamin: gender,
          tempat_lahir: birthPlace,
          agama: religion,
          alamat: address,
          nik: cleanNik,
          nisn: cleanNisn,
          nama_panggilan: nameParts[0] || studentName,
          kelompok: rawClass || null,
          umur_juli: row.umur_juli || null,
          tanggal_sekolah: row.tanggal_sekolah || null,
          keterangan: row.keterangan || null,
          nama_orang_tua: parentCombined || null,
          imported: true,
          import_date: new Date().toISOString(),
        }

        const fatherDetailsJson = {
          nama_ayah: fatherName || parentCombined || null,
          pekerjaan_ayah: job,
          hp_ayah: phone,
          alamat_ayah: address,
          email_ayah: rawEmail || finalEmail,
        }

        const motherDetailsJson = {
          nama_ibu: motherName || null,
          pekerjaan_ibu: job,
          hp_ibu: phone,
          alamat_ibu: address,
          email_ibu: rawEmail || finalEmail,
        }

        const ppdbRecord = await prisma.ppdb.create({
          data: {
            id: ppdbId,
            student_name: studentName,
            birth_date: birthDate,
            child_details: childDetailsJson,
            father_details: fatherDetailsJson,
            mother_details: motherDetailsJson,
            status: 'Diterima',
            payment_status: 'Verified',
          },
        })

        // --- STEP 4: Create Payment Record (Verified) ---
        await prisma.payment.create({
          data: {
            id: randomUUID(),
            ppdb_id: ppdbRecord.id,
            method: paymentMethod,
            amount: paymentAmount,
            status: 'Verified',
            created_at: paymentDate,
          },
        })

        // --- STEP 5: Create Student Record (students_tk) ---
        const studentId = randomUUID()
        const studentRecord = await prisma.student.create({
          data: {
            id: studentId,
            nama: studentName,
            nik: cleanNik,
            nisn: cleanNisn,
            tempat_lahir: birthPlace,
            tanggal_lahir: birthDate,
            jenis_kelamin: gender,
            agama: religion,
            alamat: address,
            kelas_id: targetClassId,
            status: 'active',
            user_id: newUser.id,
          },
        })

        // --- STEP 6: Create Parent Record (parents_tk) ---
        await prisma.parent.create({
          data: {
            id: randomUUID(),
            student_id: studentRecord.id,
            user_id: newUser.id,
            nama_ayah: fatherName || null,
            nama_ibu: motherName || null,
            hp: phone,
            email: finalEmail,
            alamat: address,
            pekerjaan: job,
          },
        })

        totalSuccess++
        results.push({
          rowNumber,
          studentName,
          status: 'success',
          username,
          password: passwordStr,
          studentId: studentRecord.id,
          className: assignedClassName,
        })
      } catch (insertError: any) {
        console.error(`Error importing row #${rowNumber} (${studentName}):`, insertError)
        totalFailed++
        results.push({
          rowNumber,
          studentName,
          status: 'error',
          error: insertError.message || 'Gagal menyimpan ke basis data.',
        })
      }
    }

    // Log Activity
    try {
      await prisma.activityLog.create({
        data: {
          id: randomUUID(),
          activity: `Import data siswa lunas selesai: ${totalSuccess} siswa berhasil didaftarkan & akun portal dibuat, ${totalFailed} gagal.`,
        },
      })
    } catch {}

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/admin/ppdb')
    revalidatePath('/dashboard/admin/payments')
    revalidatePath('/dashboard/super-admin/students')
    revalidatePath('/dashboard/admin/import-students')

    return {
      success: true,
      totalProcessed: rows.length,
      totalSuccess,
      totalFailed,
      results,
    }
  } catch (globalError: any) {
    console.error('importPaidStudentsAction global error:', globalError)
    return {
      success: false,
      totalProcessed: rows.length,
      totalSuccess: 0,
      totalFailed: rows.length,
      results: [],
      error: globalError.message || 'Terjadi kesalahan sistem saat memproses import.',
    }
  }
}
