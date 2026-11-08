import { create } from 'zustand'
import type { FullScreenPermission } from '@/services/alarm-service'

type NotificationPermission = 'granted' | 'denied'

interface AlarmPermissionStore {
  fullScreen: FullScreenPermission
  notifications: NotificationPermission
  setFullScreen: (fullScreen: FullScreenPermission) => void
  setNotifications: (notifications: NotificationPermission) => void
}

export const useAlarmPermissionStore = create<AlarmPermissionStore>((set) => ({
  fullScreen: 'unsupported',
  notifications: 'granted',
  setFullScreen: (fullScreen) => set({ fullScreen }),
  setNotifications: (notifications) => set({ notifications }),
}))
