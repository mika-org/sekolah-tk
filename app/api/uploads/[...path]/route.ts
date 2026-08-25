import { NextRequest, NextResponse } from 'next/server'
import { getStoredFileStat, readStoredFile } from '@/lib/storage'

const mimeByExtension: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

async function serve(parts: string[], includeBody: boolean) {
  if (parts.length < 2) return new NextResponse('Not found', { status: 404 })
  const [bucket, ...objectParts] = parts
  const objectPath = objectParts.join('/')
  try {
    const fileStat = await getStoredFileStat(bucket, objectPath)
    if (!fileStat.isFile()) return new NextResponse('Not found', { status: 404 })
    const extension = objectPath.split('.').pop()?.toLowerCase() || ''
    const headers = {
      'content-type': mimeByExtension[extension] || 'application/octet-stream',
      'content-length': String(fileStat.size),
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    }
    return new NextResponse(includeBody ? await readStoredFile(bucket, objectPath) : null, { headers })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return serve((await context.params).path, true)
}

export async function HEAD(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return serve((await context.params).path, false)
}
