import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'

const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma: PrismaClient = (connectionString
  ? (globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString }) }))
  : null) as unknown as PrismaClient

if (connectionString && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as PrismaClient
}
