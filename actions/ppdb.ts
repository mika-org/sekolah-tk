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

export type PPDBActionState = {
  success: boolean
  error: string
  ppdbId: string
  token?: string
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

// Generate kode akses formulir unik, misal: TK-8F2A19
export async function generateFormToken(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `TK-${code}`
}

// ─── TAHAP 1: PEMBELIAN FORMULIR (DATA AWAL & BUKTI BAYAR TRANSFER) ───
export async function purchasePPDBForm(
  _prevState: PPDBActionState,
  formData: FormData
): Promise<PPDBActionState> {
  try {
    const studentName = formText(formData, 'student_name')
    const parentName = formText(formData, 'parent_name')
    const alamat = formText(formData, 'alamat')
    const phone = formText(formData, 'phone')
    const email = formText(formData, 'email')

    if (!studentName) return failure('Nama calon anak wajib diisi.', 1)
    if (!parentName) return failure('Nama orang tua / wali wajib diisi.', 1)
    if (!alamat) return failure('Alamat tempat tinggal wajib diisi.', 1)
    if (!phone) return failure('Kontak WhatsApp / HP yang bisa dihubungi wajib diisi.', 1)

    const proofFile = getUpload(formData, 'bukti_pembayaran')
    if (!proofFile) {
      return failure('Bukti transfer pembayaran uang pendaftaran wajib dilampirkan.', 1)
    }
    const proofError = validateUpload(proofFile, 'Bukti transfer pembayaran')
    if (proofError) return failure(proofError, 1)

    const database = createAdminClient()
    const token = await generateFormToken()

    const childDetails = {
      student_name: studentName,
      parent_name: parentName,
      alamat,
      phone,
      email,
      form_token: token,
      registration_phase: 'purchased',
      purchased_at: new Date().toISOString(),
    }

    const fatherDetails = {
      nama_ayah: parentName,
      hp_ayah: phone,
      email_ayah: email,
      alamat_ayah: alamat,
    }

    const { data: ppdbData, error: ppdbError } = await database
      .from('ppdb_tk')
      .insert({
        student_name: studentName,
        birth_date: new Date().toISOString().split('T')[0],
        child_details: childDetails,
        father_details: fatherDetails,
        mother_details: {},
        development_health: {},
        status: 'Submitted',
        payment_status: 'Pending',
      })
      .select()
      .single()

    if (ppdbError || !ppdbData) {
      console.error('PPDB Purchase insertion error:', ppdbError)
      return failure(`Gagal menyimpan pembelian formulir: ${ppdbError?.message || 'data tidak ditemukan'}`, 1)
    }

    const ppdbId = ppdbData.id

    // Simpan file bukti pembayaran ke storage
    const fileExtension = proofFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const proofUrl = await saveStoredFile(
      'payment-proof',
      `${ppdbId}/proof_${Date.now()}.${fileExtension}`,
      Buffer.from(await proofFile.arrayBuffer())
    )

    await database.from('payments_tk').insert({
      ppdb_id: ppdbId,
      method: 'Transfer',
      amount: 250000,
      proof: proofUrl,
      status: 'Pending',
    })

    revalidatePath('/dashboard/admin/ppdb')
    return {
      success: true,
      error: '',
      ppdbId,
      token,
    }
  } catch (e: any) {
    console.error('Error in purchasePPDBForm:', e)
    return failure(`Terjadi kesalahan: ${e.message || e}`, 1)
  }
}

// ─── VERIFIKASI KODE AKSES FORMULIR ───
export async function verifyPpdbToken(tokenInput: string) {
  try {
    const raw = tokenInput?.trim().toUpperCase()
    if (!raw) {
      return { success: false, error: 'Silakan masukkan kode akses formulir Anda.' }
    }

    const database = createAdminClient()
    const { data, error } = await database
      .from('ppdb_tk')
      .select('*')

    if (error || !data) {
      return { success: false, error: 'Gagal memeriksa kode akses. Silakan coba lagi.' }
    }

    // Match by form_token in child_details or by application ID prefix
    const matched = data.find((row: any) => {
      const child = (row.child_details as Record<string, any>) || {}
      const curToken = (child.form_token || '').toUpperCase().trim()
      const rowId = (row.id || '').toUpperCase().trim()
      return curToken === raw || rowId === raw || rowId.startsWith(raw)
    })

    if (!matched) {
      return {
        success: false,
        error: 'Kode akses tidak ditemukan. Pastikan Anda memasukkan kode akses yang benar dari panitia SPMB.',
      }
    }

    const child = (matched.child_details as Record<string, any>) || {}
    const father = (matched.father_details as Record<string, any>) || {}
    const mother = (matched.mother_details as Record<string, any>) || {}

    // Check payment status
    if (matched.payment_status !== 'Verified') {
      return {
        success: false,
        isPending: true,
        error: 'Pembayaran formulir Anda belum diverifikasi oleh Panitia. Mohon tunggu verifikasi atau hubungi narahubung kami via WhatsApp.',
        data: {
          ppdbId: matched.id,
          token: child.form_token || raw,
          studentName: matched.student_name,
          parentName: child.parent_name || father.nama_ayah || mother.nama_ibu || 'Orang Tua',
          phone: child.phone || father.hp_ayah || mother.hp_ibu || '',
        },
      }
    }

    return {
      success: true,
      isVerified: true,
      data: {
        ppdbId: matched.id,
        token: child.form_token || raw,
        studentName: matched.student_name,
        parentName: child.parent_name || father.nama_ayah || mother.nama_ibu || 'Orang Tua',
        alamat: child.alamat || father.alamat_ayah || '',
        phone: child.phone || father.hp_ayah || mother.hp_ibu || '',
        email: child.email || father.email_ayah || '',
        childDetails: child,
        fatherDetails: father,
        motherDetails: mother,
      },
    }
  } catch (err: any) {
    console.error('Error verifying token:', err)
    return { success: false, error: 'Terjadi kesalahan sistem: ' + err.message }
  }
}

// ─── ADMIN: VERIFIKASI PEMBAYARAN & GENERATE KODE AKSES FORMULIR ───
export async function verifyPpdbPayment(ppdbId: string) {
  try {
    const database = createAdminClient()

    const { data: currentApp, error: fetchErr } = await database
      .from('ppdb_tk')
      .select('*')
      .eq('id', ppdbId)
      .single()

    if (fetchErr || !currentApp) {
      return { error: 'Data pendaftar tidak ditemukan.' }
    }

    const child = (currentApp.child_details as Record<string, any>) || {}
    const father = (currentApp.father_details as Record<string, any>) || {}
    const mother = (currentApp.mother_details as Record<string, any>) || {}

    // Reuse existing form token or generate new one
    let token = child.form_token
    if (!token) {
      token = await generateFormToken()
    }

    const updatedChild = {
      ...child,
      form_token: token,
      payment_verified_at: new Date().toISOString(),
    }

    const { data: updated, error: updateErr } = await database
      .from('ppdb_tk')
      .update({
        payment_status: 'Verified',
        child_details: updatedChild,
      })
      .eq('id', ppdbId)
      .select()
      .single()

    if (updateErr) throw updateErr

    // Update payment record
    await database
      .from('payments_tk')
      .update({ status: 'Verified' })
      .eq('ppdb_id', ppdbId)

    revalidatePath('/dashboard/admin/ppdb')
    revalidatePath('/dashboard/orang-tua/ppdb-status')
    revalidatePath('/ppdb')

    return {
      success: true,
      token,
      studentName: currentApp.student_name,
      parentName: child.parent_name || father.nama_ayah || mother.nama_ibu || 'Orang Tua',
      phone: child.phone || father.hp_ayah || mother.hp_ibu || '',
    }
  } catch (err: any) {
    console.error('Error verifying PPDB payment:', err)
    return { error: 'Gagal memverifikasi pembayaran: ' + err.message }
  }
}

// ─── FINALISASI PENDAFTARAN LENGKAP (BIODATA & BERKAS) ───
export async function submitPPDB(
  _prevState: PPDBActionState,
  formData: FormData
): Promise<PPDBActionState> {
  try {
    const currentStep = formText(formData, 'current_step')
    let existingPpdbId = formText(formData, 'ppdb_id')
    const formToken = formText(formData, 'form_token')

    const database = createAdminClient()
    let existingApp: any = null

    // Cari data existing jika ada ID atau Token
    if (existingPpdbId) {
      const { data } = await database
        .from('ppdb_tk')
        .select('*')
        .eq('id', existingPpdbId)
        .maybeSingle()
      existingApp = data
    }

    if (!existingApp && formToken) {
      const { data: allApps } = await database.from('ppdb_tk').select('*')
      existingApp = allApps?.find((r: any) => {
        const c = (r.child_details as Record<string, any>) || {}
        return (c.form_token || '').toUpperCase().trim() === formToken.toUpperCase().trim()
      })
      if (existingApp) {
        existingPpdbId = existingApp.id
      }
    }

    const existingChild = (existingApp?.child_details as Record<string, any>) || {}
    const existingFather = (existingApp?.father_details as Record<string, any>) || {}
    const existingMother = (existingApp?.mother_details as Record<string, any>) || {}

    // Initial Data dengan fallback aman
    const initialStudentName =
      formText(formData, 'student_name') ||
      formText(formData, 'nama_lengkap') ||
      formText(formData, 'initial_student_name') ||
      existingApp?.student_name ||
      existingChild?.student_name ||
      existingChild?.nama_lengkap ||
      ''

    const initialParentName =
      formText(formData, 'parent_name') ||
      formText(formData, 'nama_ayah') ||
      formText(formData, 'nama_ibu') ||
      existingChild?.parent_name ||
      existingFather?.nama_ayah ||
      existingMother?.nama_ibu ||
      ''

    const initialAddress =
      formText(formData, 'alamat') ||
      existingChild?.alamat ||
      existingFather?.alamat_ayah ||
      existingMother?.alamat_ibu ||
      ''

    const initialPhone =
      formText(formData, 'phone') ||
      formText(formData, 'hp_ayah') ||
      formText(formData, 'hp_ibu') ||
      existingChild?.phone ||
      existingFather?.hp_ayah ||
      existingMother?.hp_ibu ||
      ''

    const initialEmail =
      formText(formData, 'email') ||
      formText(formData, 'email_ayah') ||
      formText(formData, 'email_ibu') ||
      existingChild?.email ||
      existingFather?.email_ayah ||
      existingMother?.email_ibu ||
      ''

    if (!initialStudentName) return failure('Nama calon murid wajib diisi.', 1)
    if (!initialParentName) return failure('Nama orang tua / wali wajib diisi.', 1)
    if (!initialAddress) return failure('Alamat tempat tinggal wajib diisi.', 1)
    if (!initialPhone) return failure('Kontak No. HP / WhatsApp wajib diisi.', 1)

    // Detailed Child, Father, Mother (Health is CLOSED as requested)
    const childDetails = collectSnapshot(formData, CHILD_FORM_SECTIONS)
    childDetails.student_name = initialStudentName
    if (!childDetails.alamat) childDetails.alamat = initialAddress
    if (formToken) childDetails.form_token = formToken

    const fatherDetails = collectSnapshot(formData, FATHER_FORM_SECTIONS)
    const motherDetails = collectSnapshot(formData, MOTHER_FORM_SECTIONS)
    // 3. Riwayat Tumbuh Kembang & Kesehatan ditutup/jangan masuk ke biodata lengkap
    const developmentHealth = {}

    if (!fatherDetails.nama_ayah && !motherDetails.nama_ibu) {
      fatherDetails.nama_ayah = initialParentName
      fatherDetails.hp_ayah = initialPhone
      fatherDetails.email_ayah = initialEmail
      fatherDetails.alamat_ayah = initialAddress
    }

    // Dokumen Pendukung (Akta & KTP)
    const documentDefinitions = [
      { name: 'akta', label: 'Akta Kelahiran Anak', required: true },
      { name: 'ktp_ortu', label: 'KTP Orang Tua', required: true },
    ] as const

    const documents = documentDefinitions.map((definition) => ({
      ...definition,
      file: getUpload(formData, definition.name),
    }))

    for (const document of documents) {
      if (document.required && !document.file) {
        return failure(`${document.label} wajib dilampirkan.`, 3)
      }
      const uploadError = validateUpload(document.file, document.label)
      if (uploadError) return failure(uploadError, 3)
    }

    let ppdbId = existingPpdbId

    // Jika sudah ada record dari pembelian formulir sebelumnya, lakukan UPDATE
    if (existingPpdbId) {
      if (existingApp) {
        const mergedChild = {
          ...((existingApp.child_details as Record<string, any>) || {}),
          ...childDetails,
        }
        await database
          .from('ppdb_tk')
          .update({
            student_name: initialStudentName,
            birth_date: childDetails.birth_date || existingApp.birth_date,
            child_details: mergedChild,
            father_details: fatherDetails,
            mother_details: motherDetails,
            development_health: developmentHealth,
            status: 'Verifikasi Berkas',
          })
          .eq('id', existingPpdbId)
      }
    } else {
      // Jika pendaftaran langsung lengkap
      const proofFile = getUpload(formData, 'bukti_pembayaran')
      if (!proofFile) {
        return failure('Bukti transfer pembayaran uang pendaftaran wajib dilampirkan.', 1)
      }
      const proofError = validateUpload(proofFile, 'Bukti transfer pembayaran')
      if (proofError) return failure(proofError, 1)

      const token = await generateFormToken()
      childDetails.form_token = token

      const { data: ppdbData, error: ppdbError } = await database
        .from('ppdb_tk')
        .insert({
          student_name: initialStudentName,
          birth_date: childDetails.birth_date || new Date().toISOString().split('T')[0],
          child_details: childDetails,
          father_details: fatherDetails,
          mother_details: motherDetails,
          development_health: developmentHealth,
          status: 'Verifikasi Berkas',
          payment_status: 'Pending',
        })
        .select()
        .single()

      if (ppdbError || !ppdbData) {
        return failure(`Gagal menyimpan data pendaftaran: ${ppdbError?.message || 'data tidak ditemukan'}`, 3)
      }
      ppdbId = ppdbData.id

      // Simpan bukti transfer
      const fileExtension = proofFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const proofUrl = await saveStoredFile(
        'payment-proof',
        `${ppdbId}/proof_${Date.now()}.${fileExtension}`,
        Buffer.from(await proofFile.arrayBuffer())
      )

      await database.from('payments_tk').insert({
        ppdb_id: ppdbId,
        method: 'Transfer',
        amount: 250000,
        proof: proofUrl,
        status: 'Pending',
      })
    }

    // Upload dokumen Akta & KTP
    const uploadedDocuments: Array<{ type: string; file_url: string }> = []
    for (const document of documents) {
      if (!document.file) continue
      const fileExtension = document.file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const objectPath = `${ppdbId}/${document.name}_${Date.now()}.${fileExtension}`
      const fileUrl = await saveStoredFile(
        'ppdb-documents',
        objectPath,
        Buffer.from(await document.file.arrayBuffer())
      )
      uploadedDocuments.push({ type: document.name, file_url: fileUrl })
    }

    for (const document of uploadedDocuments) {
      await database.from('ppdb_documents_tk').insert({
        ppdb_id: ppdbId,
        type: document.type,
        file_url: document.file_url,
      })
    }

    revalidatePath('/dashboard/admin/ppdb')
    revalidatePath('/dashboard/orang-tua/ppdb-status')
    return {
      success: true,
      error: '',
      ppdbId,
    }
  } catch (err: any) {
    console.error('Error submitting PPDB:', err)
    return failure(`Gagal mengirimkan pendaftaran: ${err.message || err}`, 3)
  }
}

// ─── UPDATE JADWAL SPMB (Observasi & Seragam) ───
export async function updatePpdbSchedule(payload: {
  ppdbId: string
  observationDate?: string
  observationTime?: string
  observationNotes?: string
  uniformMeasureDate?: string
  uniformSize?: string
  uniformMeasureNotes?: string
  uniformPickupDate?: string
  uniformPickupStatus?: string
  uniformPickupNotes?: string
}) {
  try {
    const supabase = createAdminClient()

    const { data: currentApp, error: fetchErr } = await supabase
      .from('ppdb_tk')
      .select('id, child_details')
      .eq('id', payload.ppdbId)
      .single()

    if (fetchErr || !currentApp) {
      return { error: 'Data pendaftar tidak ditemukan.' }
    }

    const childDetails = (currentApp.child_details as Record<string, any>) || {}
    const schedules = {
      ...(childDetails.schedules || {}),
      observation_date: payload.observationDate !== undefined ? payload.observationDate : childDetails.schedules?.observation_date,
      observation_time: payload.observationTime !== undefined ? payload.observationTime : childDetails.schedules?.observation_time,
      observation_notes: payload.observationNotes !== undefined ? payload.observationNotes : childDetails.schedules?.observation_notes,
      uniform_measure_date: payload.uniformMeasureDate !== undefined ? payload.uniformMeasureDate : childDetails.schedules?.uniform_measure_date,
      uniform_size: payload.uniformSize !== undefined ? payload.uniformSize : childDetails.schedules?.uniform_size,
      uniform_measure_notes: payload.uniformMeasureNotes !== undefined ? payload.uniformMeasureNotes : childDetails.schedules?.uniform_measure_notes,
      uniform_pickup_date: payload.uniformPickupDate !== undefined ? payload.uniformPickupDate : childDetails.schedules?.uniform_pickup_date,
      uniform_pickup_status: payload.uniformPickupStatus !== undefined ? payload.uniformPickupStatus : (childDetails.schedules?.uniform_pickup_status || 'Belum Siap'),
      uniform_pickup_notes: payload.uniformPickupNotes !== undefined ? payload.uniformPickupNotes : childDetails.schedules?.uniform_pickup_notes,
    }

    const updatedChildDetails = {
      ...childDetails,
      schedules,
    }

    const { data: updated, error: updateErr } = await supabase
      .from('ppdb_tk')
      .update({
        child_details: updatedChildDetails,
      })
      .eq('id', payload.ppdbId)
      .select()
      .single()

    if (updateErr) throw updateErr

    revalidatePath('/dashboard/admin/ppdb')
    revalidatePath('/dashboard/orang-tua/ppdb-status')
    return { success: true, data: updated }
  } catch (err: any) {
    console.error('Error updating PPDB schedule:', err)
    return { error: 'Gagal memperbarui jadwal: ' + err.message }
  }
}
