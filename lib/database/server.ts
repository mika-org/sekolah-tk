import 'server-only'

import { randomUUID } from 'node:crypto'
import { createQueryClient, type DatabaseError } from '@/lib/database/query-builder'
import { executeDatabaseQuery } from '@/lib/database/execute'
import { prisma } from '@/lib/prisma'
import { ensureStorageBucket, listStorageBuckets } from '@/lib/storage'
import { getSessionUser } from '@/lib/auth/session'

function baseClient() {
  return {
    ...createQueryClient(executeDatabaseQuery),
    storage: {
      async listBuckets(): Promise<{ data: Array<{ id: string; name: string }>; error: DatabaseError | null }> {
        return { data: await listStorageBuckets(), error: null }
      },
      async createBucket(id: string, _options?: { public?: boolean }): Promise<{ data: { id: string; name: string }; error: DatabaseError | null }> {
        await ensureStorageBucket(id)
        return { data: { id, name: id }, error: null }
      },
    },
  }
}

export function createAdminClient() {
  return {
    ...baseClient(),
    auth: {
      admin: {
        async createUser(input: { email: string; password?: string; email_confirm?: boolean; user_metadata?: Record<string, unknown> }): Promise<{ data: { user: { id: string; email: string } }; error: DatabaseError | null }> {
          return { data: { user: { id: randomUUID(), email: input.email } }, error: null }
        },
        async listUsers() {
          const users = await prisma.user.findMany({
            select: { id: true, email: true, created_at: true },
          })
          return { data: { users, total: users.length }, error: null }
        },
      },
    },
  }
}

export async function createClient() {
  return {
    ...baseClient(),
    auth: {
      async getUser() {
        const payload = await getSessionUser()
        return { data: { user: payload ? {
          id: payload.id,
          email: payload.email,
          user_metadata: { role: payload.role, username: payload.username },
        } : null }, error: null }
      },
      async signOut() {
        return { error: null }
      },
    },
  }
}
