import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('.', import.meta.url))

const benPackages = [
  ['@ben/domain-base', 'packages/domain/base'],
  ['@ben/domain-user', 'packages/domain/user'],
  ['@ben/domain-task', 'packages/domain/task'],
  ['@ben/domain-chat', 'packages/domain/chat'],
  ['@ben/domain-topic', 'packages/domain/topic'],
  ['@ben/domain-notification', 'packages/domain/notification'],
  ['@ben/domain-transcription', 'packages/domain/transcription'],
  ['@ben/adapters', 'packages/adapters'],
  ['@ben/modules-utils', 'packages/modules/utils'],
  ['@ben/modules-env', 'packages/modules/env'],
  ['@ben/modules-tests', 'packages/modules/tests'],
  ['@ben/infra-db', 'packages/infra/db'],
  ['@ben/infra-adapters', 'packages/infra/adapters'],
  ['@ben/server-ben', 'packages/infra/server-ben'],
] as const

export const benPackageAliases = benPackages.flatMap(
  ([packageName, packageDir]) => {
    const sourceDir = path.join(repoRoot, packageDir, 'src')
    return [
      {
        find: new RegExp(`^${packageName}$`),
        replacement: path.join(sourceDir, 'index.ts'),
      },
      { find: `${packageName}/`, replacement: `${sourceDir}/` },
    ]
  },
)
