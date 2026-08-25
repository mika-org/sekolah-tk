import { loadEnvFile } from 'node:process'
import { defineConfig } from 'prisma/config'

if (!process.env.DATABASE_URL) {
  try {
    loadEnvFile('.env')
  } catch {
    // Production environments normally provide DATABASE_URL directly.
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // `prisma generate` must also work during dependency installation before
    // production secrets are injected. Runtime and migrations still require a real URL.
    url: process.env.DATABASE_URL || 'postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public',
  },
})
