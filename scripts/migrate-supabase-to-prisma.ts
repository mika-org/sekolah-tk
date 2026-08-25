import { loadEnvFile } from 'node:process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

try { loadEnvFile('.env') } catch {}

const sourceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const sourceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const connectionString = process.env.DATABASE_URL
const dryRun = process.argv.includes('--dry-run')
const skipStorage = process.argv.includes('--skip-storage')

if (!sourceUrl || !sourceKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sumber wajib diisi.')
if (!connectionString) throw new Error('DATABASE_URL target wajib diisi.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
const headers = { apikey: sourceKey, authorization: `Bearer ${sourceKey}` }

const tables = [
  { table: 'users_tk', model: 'user', key: 'id', fields: ['id', 'username', 'email', 'password_hash', 'role', 'status', 'created_at'] },
  { table: 'teachers_tk', model: 'teacher', key: 'id', fields: ['id', 'user_id', 'nama', 'nip', 'hp', 'alamat'] },
  { table: 'classes_tk', model: 'class', key: 'id', fields: ['id', 'nama', 'guru_id', 'tahun_ajaran'] },
  { table: 'students_tk', model: 'student', key: 'id', fields: ['id', 'user_id', 'nama', 'nik', 'nisn', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 'alamat', 'kelas_id', 'status'], dates: ['tanggal_lahir'] },
  { table: 'parents_tk', model: 'parent', key: 'id', fields: ['id', 'user_id', 'student_id', 'nama_ayah', 'nama_ibu', 'hp', 'email', 'alamat', 'pekerjaan'] },
  {
    table: 'ppdb_tk',
    model: 'ppdb',
    key: 'id',
    fields: [
      'id', 'student_name', 'birth_date', 'child_details', 'father_details',
      'mother_details', 'development_health', 'status', 'payment_status', 'created_at',
    ],
    dates: ['birth_date'],
  },
  { table: 'ppdb_documents_tk', model: 'ppdbDocument', key: 'id', fields: ['id', 'ppdb_id', 'type', 'file_url'], urls: ['file_url'] },
  { table: 'galleries_tk', model: 'gallery', key: 'id', fields: ['id', 'title', 'image', 'category', 'created_at'], urls: ['image'] },
  { table: 'testimonials_tk', model: 'testimonial', key: 'id', fields: ['id', 'name', 'photo', 'job', 'content', 'published'], urls: ['photo'] },
  { table: 'announcements_tk', model: 'announcement', key: 'id', fields: ['id', 'title', 'content', 'target', 'published'] },
  { table: 'payments_tk', model: 'payment', key: 'id', fields: ['id', 'ppdb_id', 'method', 'amount', 'proof', 'status'], urls: ['proof'] },
  { table: 'attendance_tk', model: 'attendance', key: 'id', fields: ['id', 'student_id', 'date', 'status'], dates: ['date'] },
  { table: 'grades_tk', model: 'grade', key: 'id', fields: ['id', 'student_id', 'teacher_id', 'subject', 'score', 'description'] },
  { table: 'activity_logs_tk', model: 'activityLog', key: 'id', fields: ['id', 'user_id', 'activity', 'created_at'] },
  { table: 'chats_tk', model: 'chat', key: 'id', fields: ['id', 'sender_id', 'receiver_id', 'message', 'created_at'] },
  { table: 'materials_tk', model: 'material', key: 'id', fields: ['id', 'title', 'description', 'file_url', 'class_id', 'teacher_id', 'created_at'], urls: ['file_url'] },
  { table: 'schedules_tk', model: 'schedule', key: 'id', fields: ['id', 'class_id', 'day', 'subject', 'start_time', 'end_time'], times: ['start_time', 'end_time'] },
  { table: 'settings_tk', model: 'setting', key: 'key', fields: ['key', 'value', 'updated_at'] },
] as const

async function sourceRequest(url: string, init?: RequestInit) {
  let response: Response
  try {
    response = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers || {}) }, signal: AbortSignal.timeout(20_000) })
  } catch (error: any) {
    throw new Error(`Supabase sumber tidak dapat dijangkau (${new URL(sourceUrl!).hostname}): ${error?.cause?.code || error.message}`)
  }
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`)
  return response
}

async function fetchTable(table: string) {
  const rows: Record<string, any>[] = []
  for (let offset = 0; ; offset += 1000) {
    const response = await sourceRequest(`${sourceUrl}/rest/v1/${table}?select=*&limit=1000&offset=${offset}`)
    const page = await response.json() as Record<string, any>[]
    rows.push(...page)
    if (page.length < 1000) break
  }
  return rows
}

function localStorageUrl(value: string) {
  if (skipStorage) return value
  const match = value.match(/\/storage\/v1\/object\/(?:public|authenticated)\/([^/]+)\/(.+)$/)
  if (!match) return value
  const base = (process.env.NEXT_PUBLIC_STORAGE_URL || 'https://istiqamah.elevore.web.id/uploads').replace(/\/$/, '')
  const bucket = decodeURIComponent(match[1])
  const objectName = match[2].split('/').map(decodeURIComponent).join('/')
  return `${base}/${encodeURIComponent(bucket)}/${objectName.split('/').map(encodeURIComponent).join('/')}`
}

function cleanRow(config: typeof tables[number], row: Record<string, any>) {
  const result: Record<string, any> = {}
  for (const field of config.fields) {
    if (!(field in row)) continue
    let value = row[field]
    if (value !== null && 'dates' in config && config.dates.includes(field as never)) value = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`)
    if (value !== null && 'times' in config && config.times.includes(field as never)) value = new Date(`1970-01-01T${String(value).replace('Z', '')}Z`)
    if (typeof value === 'string' && 'urls' in config && config.urls.includes(field as never)) value = localStorageUrl(value)
    result[field] = value
  }
  return result
}

async function listBuckets() {
  return sourceRequest(`${sourceUrl}/storage/v1/bucket`).then((response) => response.json()) as Promise<Array<{ id: string; name: string }>>
}

async function listObjects(bucket: string, prefix = ''): Promise<string[]> {
  const objects: string[] = []
  for (let offset = 0; ; offset += 1000) {
    const response = await sourceRequest(`${sourceUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    })
    const page = await response.json() as Array<{ id: string | null; name: string; metadata?: unknown }>
    for (const item of page) {
      const objectName = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id || item.metadata) objects.push(objectName)
      else objects.push(...await listObjects(bucket, objectName))
    }
    if (page.length < 1000) break
  }
  return objects
}

async function copyStorage() {
  const root = path.resolve(process.env.STORAGE_PATH || path.join(process.cwd(), 'storage'))
  for (const bucket of await listBuckets()) {
    const objects = await listObjects(bucket.name)
    console.log(`storage.${bucket.name}: ${objects.length} objects`)
    if (dryRun) continue
    for (const objectName of objects) {
      const encoded = objectName.split('/').map(encodeURIComponent).join('/')
      const response = await sourceRequest(`${sourceUrl}/storage/v1/object/authenticated/${encodeURIComponent(bucket.name)}/${encoded}`)
      const target = path.resolve(root, bucket.name, ...objectName.split('/'))
      const bucketRoot = path.resolve(root, bucket.name)
      if (!target.startsWith(`${bucketRoot}${path.sep}`)) throw new Error(`Path Storage tidak aman: ${objectName}`)
      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, Buffer.from(await response.arrayBuffer()))
    }
  }
}

async function main() {
  try {
    console.log(`Mode: ${dryRun ? 'dry-run' : 'write'}`)
    const sourceData = new Map<string, Record<string, any>[]>()
    for (const config of tables) {
      const rows = await fetchTable(config.table)
      sourceData.set(config.table, rows)
      console.log(`source.${config.table}: ${rows.length}`)
    }

    if (!dryRun) {
      for (const config of tables) {
        const delegate = (prisma as any)[config.model]
        for (const sourceRow of sourceData.get(config.table) || []) {
          const data = cleanRow(config, sourceRow)
          await delegate.upsert({ where: { [config.key]: data[config.key] }, create: data, update: data })
        }
        const targetCount = await delegate.count()
        const sourceCount = sourceData.get(config.table)?.length || 0
        if (targetCount < sourceCount) throw new Error(`Row count tidak cocok untuk ${config.table}: source=${sourceCount}, target=${targetCount}`)
        console.log(`verified.${config.table}: source=${sourceCount}, target=${targetCount}`)
      }
    }

    if (!skipStorage) await copyStorage()
    console.log(dryRun ? 'Dry-run selesai; target tidak diubah.' : 'Migrasi dan verifikasi selesai.')
  } finally {
    await prisma.$disconnect()
  }
}

void main().catch((error) => { console.error(error.message); process.exitCode = 1 })
