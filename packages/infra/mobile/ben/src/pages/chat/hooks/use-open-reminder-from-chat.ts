import { router } from 'expo-router'
import { useCallback } from 'react'
import { ROUTES } from '@/core/routes'
import { useMenuStore } from '@/layout/stores/menu-store'

export function useOpenReminderFromChat() {
  return useCallback((reminderId: string) => {
    if (useMenuStore.getState().origin === 'chat') return
    useMenuStore.getState().openReminderFromChat(reminderId)
    router.push(ROUTES.menu)
  }, [])
}
