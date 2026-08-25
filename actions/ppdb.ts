'use server'

import { createAdminClient } from '@/lib/database/server'
import {
  allFields,
  CHILD_FORM_SECTIONS,
  FATHER_FORM_SECTIONS,
  HEALTH_FORM_SECTIONS,
  MOTHER_FORM_SECTIONS,
  type PPDBFormSection,
} from '@/lib/ppdb/form-definition'
import { saveStoredFile } from '@/lib/storage'
import { revalidatePath } from 'next/cache'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf'])
const ALLOWED_FILE_EXTENSION = /\.(jpe?g|png|pdf)$/i

type PPDBActionState = {
  success: boolean
  error: string
  ppdbId: string
  errorStep?: number
}

type FormSnapshot = Record<string, string>

function failure(error: string, errorStep: number): PPDBActionState {
  return { success: false, error, ppdbId: '', errorStep }
}

function formText(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function collectSnapshot(formData: FormData, sections: PPDBFormSection[]): FormSnapshot {
  return Object.fromEntries(allFields(sections).map((field) => {
    let value = formText(formData, field.name)
    if (field.uppercase) value = value.toLocaleUpperCase('id-ID')
    if (field.type === 'email') value = value.toLocaleLowerCase('id-ID')
    return [field.name, value]
  }))
}

function firstMissingRequired(snapshot: FormSnapshot, sections: PPDBFormSection[]) {
  return allFields(sections).find((field) => field.required && !snapshot[field.name])
}

function getUpload(formData: FormData, name: string) {
  const value = formData.get(name)
  return value instanceof File && value.size > 0 ? value : null
}

function validateUpload(file: File | null, label: string) {
  if (!file) return null
  if (file.size > MAX_FILE_SIZE) return `${label} melebihi ukuran maksimum 2 MB.`
  if (!ALLOWED_FILE_TYPES.has(file.type) && !ALLOWED_FILE_EXTENSION.test(file.name)) {
    return `${label} harus berformat JPG, PNG, atau PDF.`
  }
  return null
}

export async function submitPPDB(_prevState: PPDBActionState, formData: FormData): Promise<PPDBActionState> {
  try {
    const currentStep = formText(formData, 'current_step')
    if (currentStep !== '4') {
      return failure('Formulir belum lengkap. Ikuti semua langkah hingga Langkah 4 sebelum mengirim.', 4)
    }

    const childDetails = collectSnapshot(formData, CHILD_FORM_SECTIONS)
    const fatherDetails = collectSnapshot(formData, FATHER_FORM_SECTIONS)
    const motherDetails = collectSnapshot(formData, MOTHER_FORM_SECTIONS)
    const developmentHealth = collectSnapshot(formData, HEALTH_FORM_SECTIONS)

    const missingChildField = firstMissingRequired(childDetails, CHILD_FORM_SECTIONS)
    if (missingChildField) {
      return failure(`${missingChildField.label} wajib diisi.`, 1)
    }

    const fatherName = fatherDetails.nama_ayah
    const motherName = motherDetails.nama_ibu
    if (!fatherName && !motherName) {
      return failure('Isi minimal satu identitas orang tua/wali.', 2)
    }
    if (fatherName && !fatherDetails.hp_ayah) {
      return failure('No. Telepon/HP Ayah wajib diisi bila identitas ayah diisi.', 2)
    }
    if (motherName && !motherDetails.hp_ibu) {
      return failure('No. Telepon/HP Ibu wajib diisi bila identitas ibu diisi.', 2)
    }

    if (formText(formData, 'pernyataan_kebenaran') !== 'setuju') {
      return failure('Centang pernyataan kebenaran dan kelengkapan data sebelum mengirim.', 4)
    }

    const documentDefinitions = [
      { name: 'kk', label: 'Kartu Keluarga', required: true },
      { name: 'akta', label: 'Akta Kelahiran', required: true },
      { name: 'foto_anak', label: 'Foto Anak', required: false },
      { name: 'ktp_ayah', label: 'KTP Ayah', required: false },
      { name: 'ktp_ibu', label: 'KTP Ibu', required: false },
      {
        name: 'surat_mutasi',
        label: 'Surat Mutasi',
        required: childDetails.status_pendaftaran === 'Siswa pindahan',
      },
      {
        name: 'surat_lulus_kb',
        label: 'Surat Keterangan Lulus Daycare/KB',
        required: ['Daycare', 'Kelompok Bermain (KB)'].includes(childDetails.riwayat_pendidikan),
      },
    ] as const

    const documents = documentDefinitions.map((definition) => ({
      ...definition,
      file: getUpload(formData, definition.name),
    }))
    for (const document of documents) {
      if (document.required && !document.file) {
        return failure(`${document.label} wajib dilampirkan.`, 4)
      }
      const uploadError = validateUpload(document.file, document.label)
      if (uploadError) return failure(uploadError, 4)
    }

    const paymentMethod = formText(formData, 'payment_method') || 'Transfer'
    if (!['Transfer', 'QRIS', 'Cash'].includes(paymentMethod)) {
      return failure('Metode pembayaran tidak valid.', 4)
    }
    const proofFile = getUpload(formData, 'bukti_pembayaran')
    const proofError = validateUpload(proofFile, 'Bukti pembayaran')
    if (proofError) return failure(proofError, 4)

    const database = createAdminClient()
    const { data: ppdbData, error: ppdbError } = await database
      .from('ppdb_tk')
      .insert({
        student_name: childDetails.student_name,
        birth_date: childDetails.birth_date,
        child_details: childDetails,
        father_details: fatherDetails,
        mother_details: motherDetails,
        development_health: developmentHealth,
        status: 'Submitted',
        payment_status: 'Pending',
      })
      .select()
      .single()

    if (ppdbError || !ppdbData) {
      console.error('PPDB insertion error:', ppdbError)
      return failure(`Gagal menyimpan data pendaftaran: ${ppdbError?.message || 'data tidak ditemukan'}`, 4)
    }

    const ppdbId = ppdbData.id
    const uploadedDocuments: Array<{ type: string; file_url: string }> = []
    for (const document of documents) {
      if (!document.file) continue
      const fileExtension = document.file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const objectPath = `${ppdbId}/${document.name}_${Date.now()}.${fileExtension}`
      const fileUrl = await saveStoredFile(
        'ppdb-documents',
        objectPath,
        Buffer.from(await document.file.arrayBuffer()),
      )
      uploadedDocuments.push({ type: document.name, file_url: fileUrl })
    }

    for (const document of uploadedDocuments) {
      const { error } = await database.from('ppdb_documents_tk').insert({
        ppdb_id: ppdbId,
        type: document.type,
        file_url: document.file_url,
      })
      if (error) throw new Error(`Gagal mencatat dokumen ${document.type}: ${error.message}`)
    }

    let proofUrl: string | null = null
    if (proofFile) {
      const fileExtension = proofFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      proofUrl = await saveStoredFile(
        'payment-proof',
        `${ppdbId}/proof_${Date.now()}.${fileExtension}`,
        Buffer.from(await proofFile.arrayBuffer()),
      )
    }

    const { error: paymentError } = await database.from('payments_tk').insert({
      ppdb_id: ppdbId,
      method: paymentMethod,
      amount: 250000,
      proof: proofUrl,
      status: 'Pending',
    })
    if (paymentError) throw new Error(`Gagal menyimpan pembayaran: ${paymentError.message}`)

    const { data: studentData, error: studentError } = await database
      .from('students_tk')
      .insert({
        nama: childDetails.student_name,
        nik: childDetails.nik || null,
        nisn: null,
        tempat_lahir: childDetails.tempat_lahir || null,
        tanggal_lahir: childDetails.birth_date,
        jenis_kelamin: childDetails.jenis_kelamin || null,
        agama: childDetails.agama || null,
        alamat: childDetails.alamat || null,
        status: 'inactive',
      })
      .select()
      .single()

    if (studentError) {
      console.error('Student snapshot insertion error:', studentError)
    } else if (studentData) {
      const { error: parentError } = await database.from('parents_tk').insert({
        student_id: studentData.id,
        nama_ayah: fatherName || null,
        nama_ibu: motherName || null,
        hp: fatherDetails.hp_ayah || motherDetails.hp_ibu || null,
        email: fatherDetails.email_ayah || motherDetails.email_ibu || null,
        alamat: fatherDetails.alamat_ayah || motherDetails.alamat_ibu || childDetails.alamat || null,
        pekerjaan: `${fatherDetails.pekerjaan_ayah || ''} / ${motherDetails.pekerjaan_ibu || ''}`,
      })
      if (parentError) console.error('Parent snapshot insertion error:', parentError)
    }

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard/admin/ppdb')
    return { success: true, error: '', ppdbId }
  } catch (error: unknown) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui.'
    return failure(`Terjadi kesalahan sistem: ${message}`, 4)
  }
}
