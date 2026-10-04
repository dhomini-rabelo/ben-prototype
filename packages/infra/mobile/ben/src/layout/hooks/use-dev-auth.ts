import { router } from 'expo-router'
import { env } from '@/core/env'
import { ROUTES } from '@/core/routes'
import { isExpoGo } from '@/core/runtime'
import { persistAccessToken } from '@/storage/token-storage'

export function useDevAuth() {
  const isAvailable = isExpoGo && env.devAccessToken !== null

  async function signIn() {
    if (env.devAccessToken === null) {
      return
    }
    await persistAccessToken(env.devAccessToken)
    router.replace(ROUTES.chat)
  }

  return { isAvailable, signIn }
}
