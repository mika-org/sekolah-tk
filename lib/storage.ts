import 'server-only'

import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const storageRoot = path.resolve(process.env.STORAGE_PATH || path.join(process.cwd(), 'storage'))

function safeSegment(segment: string) {
  if (!/^[a-zA-Z0-9._-]+$/.test(segment) || segment === '.' || segment === '..') {
    throw new Error('Nama path storage tidak valid.')
  }
  return segment
}

function resolveStoragePath(bucket: string, objectPath = '') {
  const safeBucket = safeSegment(bucket)
  const parts = objectPath.replace(/\\/g, '/').split('/').filter(Boolean).map(safeSegment)
  const resolved = path.resolve(storageRoot, safeBucket, ...parts)
  const bucketRoot = path.resolve(storageRoot, safeBucket)
  if (resolved !== bucketRoot && !resolved.startsWith(`${bucketRoot}${path.sep}`)) {
    throw new Error('Path storage berada di luar direktori yang diizinkan.')
  }
  return resolved
}

export async function ensureStorageBucket(bucket: string) {
  await mkdir(resolveStoragePath(bucket), { recursive: true })
}

export async function listStorageBuckets() {
  await mkdir(storageRoot, { recursive: true })
  const entries = await readdir(storageRoot, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => ({ id: entry.name, name: entry.name }))
}

export function getStorageUrl(bucket: string, objectPath: string) {
  const base = (process.env.NEXT_PUBLIC_STORAGE_URL || '/api/uploads').replace(/\/$/, '')
  const encodedPath = objectPath.replace(/\\/g, '/').split('/').filter(Boolean).map(encodeURIComponent).join('/')
  return `${base}/${encodeURIComponent(bucket)}/${encodedPath}`
}

export async function saveStoredFile(bucket: string, objectPath: string, data: Buffer | Uint8Array) {
  const target = resolveStoragePath(bucket, objectPath)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, data)
  return getStorageUrl(bucket, objectPath)
}

export async function readStoredFile(bucket: string, objectPath: string) {
  return readFile(resolveStoragePath(bucket, objectPath))
}

export async function getStoredFileStat(bucket: string, objectPath: string) {
  return stat(resolveStoragePath(bucket, objectPath))
}

export async function deleteStoredFile(bucket: string, objectPath: string) {
  await rm(resolveStoragePath(bucket, objectPath), { force: true })
}

export function storagePathFromUrl(url: string) {
  if (!url) return null
  const marker = '/api/uploads/'
  const index = url.indexOf(marker)
  if (index < 0) return null
  const parts = url.slice(index + marker.length).split('/').filter(Boolean).map(decodeURIComponent)
  if (parts.length < 2) return null
  return { bucket: parts[0], objectPath: parts.slice(1).join('/') }
}
