import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import type { Reminder } from '@/api/models/reminder'
import { requestActiveReminders } from '@/api/requests/reminders'
import { useAlarmStore } from '@/layout/stores/alarm-store'

const ANDROID_CHANNEL_ID = 'default'
const DAILY_SUMMARY_ID = 'daily-summary'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  })
}

function getSchedulableFireDate(reminder: Reminder): Date | null {
  if (reminder.status !== 'active' || reminder.nextFireAt === null) {
    return null
  }
  const fireDate = new Date(reminder.nextFireAt)
  const fireTime = fireDate.getTime()
  if (Number.isNaN(fireTime) || fireTime <= Date.now()) {
    return null
  }
  return fireDate
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) {
    return true
  }
  if (!current.canAskAgain) {
    return false
  }
  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}

export async function scheduleReminderNotification(
  reminder: Reminder,
): Promise<void> {
  const fireDate = getSchedulableFireDate(reminder)
  if (fireDate === null) {
    return
  }
  await ensureAndroidChannel()
  await Notifications.scheduleNotificationAsync({
    identifier: reminder.id,
    content: {
      title: reminder.title,
      body: reminder.body ?? undefined,
      data: { reminderId: reminder.id, nextFireAt: reminder.nextFireAt },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  })
}

export async function cancelReminderNotification(
  reminderId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(reminderId)
}

export async function rescheduleReminderNotification(
  reminder: Reminder,
): Promise<void> {
  await cancelReminderNotification(reminder.id)
  await scheduleReminderNotification(reminder)
}

export async function syncReminderNotifications(
  reminders: Reminder[],
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const schedulableIds = new Set<string>()

  for (const reminder of reminders) {
    if (getSchedulableFireDate(reminder) === null) {
      continue
    }
    schedulableIds.add(reminder.id)
    await rescheduleReminderNotification(reminder)
  }

  for (const item of scheduled) {
    if (
      item.identifier !== DAILY_SUMMARY_ID &&
      !schedulableIds.has(item.identifier)
    ) {
      await cancelReminderNotification(item.identifier)
    }
  }
}

export async function scheduleDailySummaryNotification(
  time: string,
  title: string,
  body: string,
): Promise<void> {
  const [hour, minute] = time.split(':').map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return
  }
  await ensureAndroidChannel()
  await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID)
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_SUMMARY_ID,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

export async function cancelDailySummaryNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID)
}

export function subscribeToNotificationTaps(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data
      const reminderId = data?.reminderId
      const nextFireAt = data?.nextFireAt
      if (typeof reminderId !== 'string' || typeof nextFireAt !== 'string') {
        return
      }
      void requestActiveReminders()
        .then((items) => {
          const reminder = items.find((item) => item.id === reminderId)
          if (reminder) {
            useAlarmStore.getState().enqueue({ reminder, firedAt: nextFireAt })
          }
        })
        .catch(() => {})
    },
  )

  return () => subscription.remove()
}
