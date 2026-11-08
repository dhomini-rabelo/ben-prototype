import { useEffect } from 'react'
import { requestRegisterPushDevice } from '@/api/requests/push-devices'
import { useAuthStore } from '@/layout/stores/auth-store'
import {
  getExpoPushToken,
  requestNotificationPermission,
} from '@/services/notifications-service'

export function usePushDeviceRegistration() {
  const userId = useAuthStore((store) => store.user?.id)

  useEffect(() => {
    if (!userId) {
      return
    }

    async function registerPushDevice() {
      try {
        await requestNotificationPermission()
        const token = await getExpoPushToken()
        if (token === null) {
          return
        }
        await requestRegisterPushDevice(token)
      } catch {
        return
      }
    }

    registerPushDevice()
  }, [userId])
}
