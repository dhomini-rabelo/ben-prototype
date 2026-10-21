import { useCallback, useEffect } from 'react'
import { useAuthStore } from '@/layout/stores/auth-store'
import { useAlarmStore } from '@/layout/stores/alarm-store'
import { requestActiveReminders } from '@/api/requests/reminders'
import { useActiveRemindersData } from '@/layout/hooks/api/use-active-reminders-data'
import {
  subscribeToNotificationTaps,
  syncReminderNotifications,
} from '@/services/notifications-service'

const CHECK_INTERVAL_MS = 15 * 1000

export function useAlarmScheduler() {
  const userId = useAuthStore((store) => store.user?.id)
  const { state, actions } = useActiveRemindersData({ enabled: !!userId })
  const items = state.data?.items
  const invalidate = actions.invalidate

  const refreshActiveReminders = useCallback(() => invalidate(), [invalidate])

  useEffect(() => {
    if (!items) {
      return
    }

    function enqueueDue() {
      const now = Date.now()
      const enqueue = useAlarmStore.getState().enqueue
      for (const reminder of items ?? []) {
        if (reminder.status !== 'active' || reminder.nextFireAt === null) {
          continue
        }
        if (new Date(reminder.nextFireAt).getTime() <= now) {
          enqueue({ reminder, firedAt: reminder.nextFireAt })
        }
      }
    }

    enqueueDue()
    const interval = setInterval(enqueueDue, CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [items])

  useEffect(() => {
    if (!items) {
      return
    }
    void syncReminderNotifications(items)
  }, [items])

  useEffect(() => {
    if (!userId) {
      return
    }
    const unsubscribe = subscribeToNotificationTaps(
      ({ reminderId, nextFireAt }) => {
        void requestActiveReminders()
          .then((reminders) => {
            const reminder = reminders.find((item) => item.id === reminderId)
            if (reminder) {
              useAlarmStore
                .getState()
                .enqueue({ reminder, firedAt: nextFireAt })
            }
          })
          .catch(() => {})
      },
    )
    return unsubscribe
  }, [userId])

  useEffect(() => {
    if (!userId) {
      useAlarmStore.getState().reset()
    }
  }, [userId])

  return { refreshActiveReminders }
}
