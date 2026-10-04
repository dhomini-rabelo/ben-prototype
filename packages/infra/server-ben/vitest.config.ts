import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

import { benPackageAliases } from '../../../vitest.ben-aliases.ts'

const srcDir = fileURLToPath(new URL('./src/', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: srcDir }, ...benPackageAliases],
  },
  test: {
    environment: 'node',
    passWithNoTests: false,
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
})
