import 'server-only'

import { prisma } from '@/lib/prisma'
import type { DatabaseQuery, DatabaseResult } from '@/lib/database/query-builder'

const modelByTable = {
  users_tk: 'user',
  teachers_tk: 'teacher',
  classes_tk: 'class',
  students_tk: 'student',
  parents_tk: 'parent',
  ppdb_tk: 'ppdb',
  ppdb_documents_tk: 'ppdbDocument',
  galleries_tk: 'gallery',
  testimonials_tk: 'testimonial',
  announcements_tk: 'announcement',
  payments_tk: 'payment',
  attendance_tk: 'attendance',
  grades_tk: 'grade',
  activity_logs_tk: 'activityLog',
  chats_tk: 'chat',
  materials_tk: 'material',
  schedules_tk: 'schedule',
  settings_tk: 'setting',
} as const

type TableName = keyof typeof modelByTable

const primaryKeyByTable: Record<TableName, string> = {
  users_tk: 'id',
  teachers_tk: 'id',
  classes_tk: 'id',
  students_tk: 'id',
  parents_tk: 'id',
  ppdb_tk: 'id',
  ppdb_documents_tk: 'id',
  galleries_tk: 'id',
  testimonials_tk: 'id',
  announcements_tk: 'id',
  payments_tk: 'id',
  attendance_tk: 'id',
  grades_tk: 'id',
  activity_logs_tk: 'id',
  chats_tk: 'id',
  materials_tk: 'id',
  schedules_tk: 'id',
  settings_tk: 'key',
}

const fieldsByTable: Record<TableName, ReadonlySet<string>> = {
  users_tk: new Set(['id', 'username', 'email', 'password_hash', 'role', 'status', 'created_at']),
  teachers_tk: new Set(['id', 'user_id', 'nama', 'nip', 'hp', 'alamat']),
  classes_tk: new Set(['id', 'nama', 'guru_id', 'tahun_ajaran']),
  students_tk: new Set(['id', 'user_id', 'nama', 'nik', 'nisn', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 'alamat', 'kelas_id', 'status']),
  parents_tk: new Set(['id', 'user_id', 'student_id', 'nama_ayah', 'nama_ibu', 'hp', 'email', 'alamat', 'pekerjaan']),
  ppdb_tk: new Set([
    'id', 'student_name', 'birth_date', 'child_details', 'father_details',
    'mother_details', 'development_health', 'status', 'payment_status', 'created_at',
  ]),
  ppdb_documents_tk: new Set(['id', 'ppdb_id', 'type', 'file_url']),
  galleries_tk: new Set(['id', 'title', 'image', 'category', 'created_at']),
  testimonials_tk: new Set(['id', 'name', 'photo', 'job', 'content', 'published']),
  announcements_tk: new Set(['id', 'title', 'content', 'target', 'published']),
  payments_tk: new Set(['id', 'ppdb_id', 'method', 'amount', 'proof', 'status']),
  attendance_tk: new Set(['id', 'student_id', 'date', 'status']),
  grades_tk: new Set(['id', 'student_id', 'teacher_id', 'subject', 'score', 'description']),
  activity_logs_tk: new Set(['id', 'user_id', 'activity', 'created_at']),
  chats_tk: new Set(['id', 'sender_id', 'receiver_id', 'message', 'created_at']),
  materials_tk: new Set(['id', 'title', 'description', 'file_url', 'class_id', 'teacher_id', 'created_at']),
  schedules_tk: new Set(['id', 'class_id', 'day', 'subject', 'start_time', 'end_time']),
  settings_tk: new Set(['key', 'value', 'updated_at']),
}

const relationTarget: Partial<Record<TableName, Record<string, TableName>>> = {
  teachers_tk: { users_tk: 'users_tk' },
  classes_tk: { teachers_tk: 'teachers_tk' },
  students_tk: { users_tk: 'users_tk', classes_tk: 'classes_tk' },
  parents_tk: { users_tk: 'users_tk', students_tk: 'students_tk' },
  ppdb_documents_tk: { ppdb_tk: 'ppdb_tk' },
  payments_tk: { ppdb_tk: 'ppdb_tk' },
  attendance_tk: { students_tk: 'students_tk' },
  grades_tk: { students_tk: 'students_tk', teachers_tk: 'teachers_tk' },
  activity_logs_tk: { users_tk: 'users_tk' },
  materials_tk: { classes_tk: 'classes_tk', teachers_tk: 'teachers_tk' },
  schedules_tk: { classes_tk: 'classes_tk' },
}

const dateFields: Partial<Record<TableName, ReadonlySet<string>>> = {
  students_tk: new Set(['tanggal_lahir']),
  ppdb_tk: new Set(['birth_date']),
  attendance_tk: new Set(['date']),
}

const timeFields: Partial<Record<TableName, ReadonlySet<string>>> = {
  schedules_tk: new Set(['start_time', 'end_time']),
}

function assertTable(table: string): asserts table is TableName {
  if (!(table in modelByTable)) {
    throw new Error(`Tabel tidak diizinkan: ${table}`)
  }
}

function assertField(table: TableName, field: string) {
  if (!fieldsByTable[table].has(field)) {
    throw new Error(`Kolom tidak diizinkan: ${table}.${field}`)
  }
}

function splitSelection(selection: string) {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const character of selection) {
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (character === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function buildSelection(table: TableName, selection?: string) {
  if (!selection || selection.trim() === '*') return {}

  const tokens = splitSelection(selection)
  const wildcard = tokens.includes('*')
  const relations: Record<string, unknown> = {}
  const scalars: Record<string, true> = {}

  for (const token of tokens) {
    if (token === '*') continue
    const relationMatch = token.match(/^([a-z_]+)\((.*)\)$/)
    if (relationMatch) {
      const [, relation, nestedSelection] = relationMatch
      const target = relationTarget[table]?.[relation]
      if (!target) throw new Error(`Relasi tidak diizinkan: ${table}.${relation}`)
      const nested = buildSelection(target, nestedSelection)
      relations[relation] = Object.keys(nested).length ? nested : true
      continue
    }
    assertField(table, token)
    scalars[token] = true
  }

  if (wildcard) return Object.keys(relations).length ? { include: relations } : {}
  return { select: { ...scalars, ...relations } }
}

function coerceValue(table: TableName, field: string, value: unknown) {
  if (value === null || value === undefined) return value
  if (dateFields[table]?.has(field) && typeof value === 'string') {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  }
  if (timeFields[table]?.has(field) && typeof value === 'string') {
    const time = value.includes('T') ? value.split('T')[1].replace('Z', '') : value
    return new Date(`1970-01-01T${time}Z`)
  }
  return value
}

function coerceData(table: TableName, value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Data mutasi harus berupa objek.')
  }
  return Object.fromEntries(Object.entries(value).map(([field, fieldValue]) => {
    assertField(table, field)
    return [field, coerceValue(table, field, fieldValue)]
  }))
}

function buildWhere(table: TableName, query: DatabaseQuery) {
  const where: Record<string, unknown> = {}
  if (query.filters.length) {
    where.AND = query.filters.map(({ field, operator, value }) => {
      assertField(table, field)
      if (operator === 'in') {
        const values = Array.isArray(value) ? value : []
        return { [field]: { in: values.map((item) => coerceValue(table, field, item)) } }
      }
      const coerced = coerceValue(table, field, value)
      return { [field]: operator === 'neq' ? { not: coerced } : coerced }
    })
  }
  if (query.rawOr) {
    const groups = [...query.rawOr.matchAll(/and\(([^)]+)\)/g)].map((match) => {
      const conditions = match[1].split(',').map((condition) => {
        const parts = condition.split('.')
        if (parts.length < 3 || parts[1] !== 'eq') throw new Error('Ekspresi OR tidak didukung.')
        const field = parts[0]
        assertField(table, field)
        return { [field]: coerceValue(table, field, parts.slice(2).join('.')) }
      })
      return { AND: conditions }
    })
    if (!groups.length) throw new Error('Ekspresi OR tidak valid.')
    where.OR = groups
  }
  return where
}

function normalizeValue(value: any): any {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(normalizeValue)
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') {
    if (typeof value.toNumber === 'function') return value.toNumber()
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeValue(item)]))
  }
  return value
}

function normalizeRow(table: TableName, row: any): any {
  const normalized = normalizeValue(row)
  if (!normalized || typeof normalized !== 'object') return normalized
  for (const field of dateFields[table] ?? []) {
    if (typeof normalized[field] === 'string') normalized[field] = normalized[field].slice(0, 10)
  }
  for (const field of timeFields[table] ?? []) {
    if (typeof normalized[field] === 'string') normalized[field] = normalized[field].slice(11, 19)
  }
  return normalized
}

function shapeResult(table: TableName, rows: any[], mode?: DatabaseQuery['resultMode']) {
  const normalized = rows.map((row) => normalizeRow(table, row))
  if (!mode) return normalized
  if (mode === 'single' && normalized.length !== 1) {
    throw new Error(`Query mengharapkan satu baris, tetapi menemukan ${normalized.length}.`)
  }
  if (mode === 'maybeSingle' && normalized.length > 1) {
    throw new Error(`Query mengharapkan maksimal satu baris, tetapi menemukan ${normalized.length}.`)
  }
  return normalized[0] ?? null
}

export async function executeDatabaseQuery(query: DatabaseQuery): Promise<DatabaseResult> {
  try {
    assertTable(query.table)
    const table = query.table
    const delegate = (prisma as any)[modelByTable[table]]
    const where = buildWhere(table, query)
    const selection = buildSelection(table, query.selection)
    const orderBy = query.orders.map(({ field, ascending }) => {
      assertField(table, field)
      return { [field]: ascending ? 'asc' : 'desc' }
    })

    if (query.operation === 'select') {
      const count = query.count ? await delegate.count({ where }) : undefined
      if (query.head) return { data: null, error: null, count }
      const rows = await delegate.findMany({
        where,
        ...(orderBy.length ? { orderBy } : {}),
        ...(query.offset !== undefined ? { skip: query.offset } : {}),
        ...(query.limit !== undefined ? { take: query.limit } : {}),
        ...selection,
      })
      return { data: shapeResult(table, rows, query.resultMode), error: null, count }
    }

    if ((query.operation === 'update' || query.operation === 'delete') && !query.filters.length) {
      throw new Error('Mutasi tanpa filter ditolak untuk mencegah perubahan seluruh tabel.')
    }

    const inputRows = query.operation === 'delete'
      ? []
      : (Array.isArray(query.values) ? query.values : [query.values])
    const values = inputRows.map((value) => coerceData(table, value))
    let affectedRows: any[] = []

    if (query.operation === 'insert') {
      for (const data of values) affectedRows.push(await delegate.create({ data, ...selection }))
    } else if (query.operation === 'upsert') {
      const conflictField = query.onConflict || primaryKeyByTable[table]
      assertField(table, conflictField)
      for (const data of values) {
        const conflictValue = data[conflictField]
        if (conflictValue === undefined) throw new Error(`Nilai konflik ${conflictField} wajib diisi.`)
        affectedRows.push(await delegate.upsert({
          where: { [conflictField]: conflictValue },
          create: data,
          update: data,
          ...selection,
        }))
      }
    } else if (query.operation === 'update') {
      await delegate.updateMany({ where, data: values[0] })
      if (query.selection) affectedRows = await delegate.findMany({ where, ...selection })
    } else if (query.operation === 'delete') {
      if (query.selection) affectedRows = await delegate.findMany({ where, ...selection })
      await delegate.deleteMany({ where })
    }

    const data = query.selection ? shapeResult(table, affectedRows, query.resultMode) : null
    return { data, error: null }
  } catch (error: any) {
    return {
      data: null,
      error: {
        message: error?.message || 'Operasi database gagal.',
        code: error?.code,
      },
    }
  }
}
