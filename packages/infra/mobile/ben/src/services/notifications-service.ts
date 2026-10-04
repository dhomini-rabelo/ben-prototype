import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import type { Reminder } from '@/api/models/reminder'

const ANDROID_CHANNEL_ID = 'default'

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
  if (reminder.status === 'fired' || reminder.firesAt === null) {
    return null
  }
  const fireDate = new Date(reminder.firesAt)
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
  const scheduledIds = new Set(scheduled.map((item) => item.identifier))
  const schedulableIds = new Set<string>()

  for (const reminder of reminders) {
    if (getSchedulableFireDate(reminder) === null) {
      continue
    }
    schedulableIds.add(reminder.id)
    if (!scheduledIds.has(reminder.id)) {
      await scheduleReminderNotification(reminder)
    } else {
      await rescheduleReminderNotification(reminder)
    }
  }

  for (const scheduledId of scheduledIds) {
    if (!schedulableIds.has(scheduledId)) {
      await cancelReminderNotification(scheduledId)
    }
  }
}
