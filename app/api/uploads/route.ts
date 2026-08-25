import { NextRequest, NextResponse } from 'next/server'
import { saveStoredFile } from '@/lib/storage'
import { getRequestUser } from '@/lib/auth/request'

const publicBuckets = new Set(['payment-proof', 'payment-proofs', 'ppdb-documents'])
const allowedBuckets = new Set([
  'bucket_tk',
  'payment-proof',
  'payment-proofs',
  'ppdb-documents',
  'materials',
  'materials_tk',
  'galleries',
  'galleries_tk',
  'announcements',
  'announcements_tk',
  'testimonials',
  'testimonials_tk',
  'teachers',
  'teachers_tk',
])
const maxUploadBytes = 15 * 1024 * 1024

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const bucket = String(formData.get('bucket') || '').trim()
  const objectPath = String(formData.get('path') || '').trim()
  const file = formData.get('file')

  if (!bucket || !objectPath || !(file instanceof File)) {
    return NextResponse.json({ error: 'Permintaan upload tidak valid.' }, { status: 400 })
  }

  if (!publicBuckets.has(bucket)) {
    const user = await getRequestUser(request)
    if (!user) return NextResponse.json({ error: 'Sesi login diperlukan.' }, { status: 401 })
  }

  if (file.size <= 0 || file.size > maxUploadBytes) {
    return NextResponse.json({ error: 'Ukuran file harus antara 1 byte dan 15 MB.' }, { status: 413 })
  }

  try {
    const url = await saveStoredFile(bucket, objectPath, Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ path: objectPath, publicUrl: url })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Upload gagal.' }, { status: 400 })
  }
}
