const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended')

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettier,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
])
