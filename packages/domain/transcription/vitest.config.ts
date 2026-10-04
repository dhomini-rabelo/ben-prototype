import { defineConfig } from 'vitest/config'

import { benPackageAliases } from '../../../vitest.ben-aliases.ts'

export default defineConfig({
  resolve: { alias: benPackageAliases },
  test: {
    environment: 'node',
    passWithNoTests: false,
    include: ['src/**/*.test.ts'],
  },
})
