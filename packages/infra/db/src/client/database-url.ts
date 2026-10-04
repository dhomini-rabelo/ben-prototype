import { createRequire } from 'node:module'
import path from 'node:path'

const requireFromInfraDb = createRequire(import.meta.url)
const infraDbRoot = path.dirname(
  requireFromInfraDb.resolve('@ben/infra-db/package.json'),
)

export const DEFAULT_DATABASE_URL = `file:${path.join(infraDbRoot, 'prisma', 'dev.db')}`

export function resolveDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL
}
