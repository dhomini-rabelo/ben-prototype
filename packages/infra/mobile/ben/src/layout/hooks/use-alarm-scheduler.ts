import { useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/layout/stores/auth-store'
import { useAlarmStore } from '@/layout/stores/alarm-store'
import { useActiveRemindersData } from '@/layout/hooks/api/use-active-reminders-data'
import { useAlarmPermissionStore } from '@/layout/stores/alarm-permission-store'
import { openAlarmFromNotification } from '@/services/alarm-actions'
import {
  cancelDisplayedAlarm,
  getInitialAlarm,
  subscribeToAlarmEvents,
} from '@/services/alarm-service'
import {
  subscribeToNotificationTaps,
  syncReminderNotifications,
} from '@/services/notifications-service'

const CHECK_INTERVAL_MS = 15 * 1000
const EXPIRE_INTERVAL_MS = 15 * 1000

export function useAlarmScheduler() {
  const userId = useAuthStore((store) => store.user?.id)
  const { state, actions } = useActiveRemindersData({ enabled: !!userId })
  const items = state.data?.items
  const invalidate = actions.invalidate
  const itemsRef = useRef(items)
  itemsRef.current = items
  const fullScreen = useAlarmPermissionStore((store) => store.fullScreen)

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
          enqueue({
            reminderId: reminder.id,
            title: reminder.title,
            kind: reminder.kind,
            firedAt: reminder.nextFireAt,
            reminder,
            sound: 'on',
          })
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
    void syncReminderNotifications(items, fullScreen)
  }, [items, fullScreen])

  useEffect(() => {
    if (items) {
      useAlarmStore.getState().attachReminders(items)
    }
  }, [items])

  useEffect(() => {
    const interval = setInterval(
      () => useAlarmStore.getState().expireCurrent(Date.now()),
      EXPIRE_INTERVAL_MS,
    )
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!userId) {
      return
    }
    const unsubscribeTaps = subscribeToNotificationTaps(
      ({ reminderId, nextFireAt, title, kind }) =>
        openAlarmFromNotification({
          reminderId,
          firedAt: nextFireAt,
          title,
          kind,
        }),
    )
    const unsubscribeAlarm = subscribeToAlarmEvents((event) => {
      if (event.type === 'delivered') {
        useAlarmStore.getState().enqueue({
          ...event.data,
          reminder: null,
          sound: 'on',
        })
        if (itemsRef.current) {
          useAlarmStore.getState().attachReminders(itemsRef.current)
        }
        void cancelDisplayedAlarm(event.data.reminderId)
        return
      }
      if (event.type === 'press') {
        openAlarmFromNotification(event.data)
      }
    })
    void getInitialAlarm().then((data) => {
      if (data) {
        openAlarmFromNotification(data)
      }
    })
    const unsubscribe = () => {
      unsubscribeTaps()
      unsubscribeAlarm()
    }
    return unsubscribe
  }, [userId])

  useEffect(() => {
    if (!userId) {
      useAlarmStore.getState().reset()
    }
  }, [userId])

  return { refreshActiveReminders }
}
