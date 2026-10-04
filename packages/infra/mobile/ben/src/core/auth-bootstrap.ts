import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { setUnauthorizedHandler } from '@/api/client'
import { ROUTES } from '@/core/routes'
import { useAuthStore } from '@/layout/stores/auth-store'
import { requestNotificationPermission } from '@/services/notifications-service'
import { loadTokenIntoMemory } from '@/storage/token-storage'

export function useAuthBootstrap() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let isActive = true

    setUnauthorizedHandler(() => {
      useAuthStore.getState().clear()
      router.replace(ROUTES.login)
    })

    async function bootstrap() {
      await loadTokenIntoMemory()
      await useAuthStore.getState().hydrate()
      if (isActive) {
        setIsReady(true)
      }
      void requestNotificationPermission()
    }

    void bootstrap()

    return () => {
      isActive = false
      setUnauthorizedHandler(() => {})
    }
  }, [])

  return { isReady }
}
