'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
})

export async function submitPPDB(prevState: any, formData: FormData) {
  try {
    const supabase = createAdminClient()

    // 1. Gather child data
    const student_name = formData.get('student_name') as string
    const birth_date = formData.get('birth_date') as string
    const nik = formData.get('nik') as string
    const nisn = formData.get('nisn') as string
    const tempat_lahir = formData.get('tempat_lahir') as string
    const jenis_kelamin = formData.get('jenis_kelamin') as string
    const agama = formData.get('agama') as string
    const alamat = formData.get('alamat') as string
    const anak_ke = formData.get('anak_ke') as string
    const jml_saudara = formData.get('jml_saudara') as string

    // 2. Gather parent data
    const nama_ayah = formData.get('nama_ayah') as string
    const pekerjaan_ayah = formData.get('pekerjaan_ayah') as string
    const hp_ayah = formData.get('hp_ayah') as string
    const email_ayah = formData.get('email_ayah') as string
    const penghasilan_ayah = formData.get('penghasilan_ayah') as string
    const alamat_ayah = formData.get('alamat_ayah') as string

    const nama_ibu = formData.get('nama_ibu') as string
    const pekerjaan_ibu = formData.get('pekerjaan_ibu') as string
    const hp_ibu = formData.get('hp_ibu') as string
    const email_ibu = formData.get('email_ibu') as string
    const penghasilan_ibu = formData.get('penghasilan_ibu') as string
    const alamat_ibu = formData.get('alamat_ibu') as string

    // 3. Gather payment method
    const payment_method = formData.get('payment_method') as string
    const payment_amount = parseFloat(formData.get('payment_amount') as string || '0')

    // Validate main required fields
    if (!student_name || !birth_date) {
      return { success: false, error: 'Nama Lengkap dan Tanggal Lahir anak wajib diisi.', ppdbId: '' }
    }

    // Insert PPDB Application
    const { data: ppdbData, error: ppdbError } = await supabase
      .from('ppdb_tk')
      .insert({
        student_name,
        birth_date,
        status: 'Submitted',
        payment_status: 'Pending'
      })
      .select()
      .single()

    if (ppdbError || !ppdbData) {
      console.error('PPDB Insertion Error:', ppdbError)
      return { success: false, error: 'Gagal menyimpan data pendaftaran: ' + ppdbError?.message, ppdbId: '' }
    }

    const ppdbId = ppdbData.id

    // Helper to upload file to S3
    const uploadFile = async (file: File, bucket: string, path: string) => {
      if (!file || file.size === 0) return null
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: buffer,
        ContentType: file.type,
      })

      try {
        await s3Client.send(command)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const match = supabaseUrl.match(/https:\/\/(.*?)\.supabase/)
        const projectId = match ? match[1] : 'rgccflnozdvdmmxnshqv'
        return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${path}`
      } catch (error: any) {
        console.error(`S3 upload failed for bucket ${bucket}:`, error)
        throw new Error(`Gagal mengunggah berkas ${file.name}: ${error.message}`)
      }
    }

    // Document types to process
    const docTypes = ['kk', 'akta', 'foto_anak', 'ktp_ayah', 'ktp_ibu']
    for (const type of docTypes) {
      const file = formData.get(type) as File
      if (file && file.size > 0) {
        const fileExtension = file.name.split('.').pop() || 'pdf'
        const path = `${ppdbId}/${type}_${Date.now()}.${fileExtension}`
        try {
          const fileUrl = await uploadFile(file, 'ppdb-documents', path)
          if (fileUrl) {
            await supabase.from('ppdb_documents_tk').insert({
              ppdb_id: ppdbId,
              type: type.toUpperCase(),
              file_url: fileUrl
            })
          }
        } catch (e: any) {
          console.error(e)
        }
      }
    }

    // Process payment proof
    const proofFile = formData.get('bukti_pembayaran') as File
    let proofUrl = ''
    if (proofFile && proofFile.size > 0) {
      const fileExtension = proofFile.name.split('.').pop() || 'jpg'
      const path = `${ppdbId}/proof_${Date.now()}.${fileExtension}`
      try {
        const fileUrl = await uploadFile(proofFile, 'payment-proof', path)
        if (fileUrl) {
          proofUrl = fileUrl
        }
      } catch (e: any) {
        console.error(e)
      }
    }

    // Insert payment record
    if (payment_method) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const match = supabaseUrl.match(/https:\/\/(.*?)\.supabase/)
      const projectId = match ? match[1] : 'rgccflnozdvdmmxnshqv'
      const fallbackProof = `https://${projectId}.supabase.co/storage/v1/object/public/payment-proof/mock_proof.jpg`

      await supabase.from('payments_tk').insert({
        ppdb_id: ppdbId,
        method: payment_method,
        amount: payment_amount || 250000, // PPDB registration fee
        proof: proofUrl || fallbackProof,
        status: 'Pending'
      })
    }

    // Save associated student and parent structure as inactive
    const { data: studentData } = await supabase
      .from('students_tk')
      .insert({
        nama: student_name,
        nik,
        nisn,
        tempat_lahir,
        tanggal_lahir: birth_date,
        jenis_kelamin: jenis_kelamin || 'L',
        agama,
        alamat,
        status: 'inactive'
      })
      .select()
      .single()

    if (studentData) {
      await supabase.from('parents_tk').insert({
        student_id: studentData.id,
        nama_ayah,
        nama_ibu,
        hp: hp_ayah || hp_ibu,
        email: email_ayah || email_ibu,
        alamat: alamat_ayah || alamat_ibu || alamat,
        pekerjaan: `${pekerjaan_ayah || ''} / ${pekerjaan_ibu || ''}`
      })
    }

    revalidatePath('/dashboard/admin')
    return { success: true, error: '', ppdbId }
  } catch (e: any) {
    console.error(e)
    return { success: false, error: 'Terjadi kesalahan sistem: ' + e.message, ppdbId: '' }
  }
}
