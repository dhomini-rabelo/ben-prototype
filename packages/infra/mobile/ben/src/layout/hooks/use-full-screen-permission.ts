import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useAlarmPermissionStore } from '@/layout/stores/alarm-permission-store'
import { getFullScreenPermission } from '@/services/alarm-service'
import { getNotificationPermissionStatus } from '@/services/notifications-service'

export function useFullScreenPermission() {
  useEffect(() => {
    async function check() {
      try {
        const [fullScreen, notifications] = await Promise.all([
          getFullScreenPermission(),
          getNotificationPermissionStatus(),
        ])
        const store = useAlarmPermissionStore.getState()
        store.setFullScreen(fullScreen)
        store.setNotifications(notifications)
      } catch {
        // keeps the last known permission
      }
    }

    void check()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void check()
      }
    })
    return () => subscription.remove()
  }, [])
}
