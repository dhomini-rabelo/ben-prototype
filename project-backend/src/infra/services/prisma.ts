import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import { PrismaClient } from '@/generated/prisma/client'

const DEFAULT_DATABASE_URL = 'file:./prisma/dev.db'

export function createPrismaClient(url: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })
}

let client: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  if (!client) {
    client = createPrismaClient(
      process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
    )
  }
  return client
}
