'use client'

import { createQueryClient, type DatabaseQuery } from '@/lib/database/query-builder'

async function execute(query: DatabaseQuery) {
  const response = await fetch('/api/database', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(query),
  })
  const result = await response.json()
  if (!response.ok && !result.error) {
    result.error = { message: 'Permintaan database gagal.' }
  }
  return result
}

const queryClient = createQueryClient(execute)

const browserClient = {
  ...queryClient,
  auth: {
    async getUser() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        if (!response.ok) return { data: { user: null }, error: null }
        const data = await response.json()
        return { data: { user: data.user ?? null }, error: null }
      } catch (error: any) {
        return { data: { user: null }, error: { message: error?.message || 'Gagal membaca sesi.' } }
      }
    },
    async signOut() {
      return { error: null }
    },
  },
  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: File) {
          const formData = new FormData()
          formData.set('bucket', bucket)
          formData.set('path', path)
          formData.set('file', file)
          const response = await fetch('/api/uploads', { method: 'POST', body: formData })
          const result = await response.json()
          return response.ok ? { data: result, error: null } : { data: null, error: { message: result.error || 'Upload gagal.' } }
        },
        getPublicUrl(path: string) {
          const base = (process.env.NEXT_PUBLIC_STORAGE_URL || 'https://istiqamah.elevore.web.id/uploads').replace(/\/$/, '')
          return { data: { publicUrl: `${base}/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}` } }
        },
      }
    },
  },
}

export function createClient() {
  return browserClient
}
