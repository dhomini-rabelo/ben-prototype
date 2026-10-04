import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

import { resolveDatabaseUrl } from '@ben/infra-db/client/database-url'
import { PrismaClient } from '@ben/infra-db/generated/prisma/client'

export function createPrismaClient(url: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })
}

let client: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  if (!client) {
    client = createPrismaClient(resolveDatabaseUrl())
  }
  return client
}
