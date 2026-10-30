import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import type { Reminder } from '@/api/models/reminder'

const NOTIFICATION_CHANNELS = {
  alarms: 'alarmes',
  summaries: 'resumos',
} as const

type NotificationChannelId =
  (typeof NOTIFICATION_CHANNELS)[keyof typeof NOTIFICATION_CHANNELS]

const NOTIFICATION_CHANNEL_SETTINGS: Record<
  NotificationChannelId,
  { name: string; importance: Notifications.AndroidImportance }
> = {
  alarmes: {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.HIGH,
  },
  resumos: {
    name: 'Daily summary',
    importance: Notifications.AndroidImportance.DEFAULT,
  },
}

const LEGACY_CHANNEL_ID = 'default'
const DAILY_SUMMARY_ID = 'daily-summary'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

let permissionRequest: Promise<boolean> | null = null
let lastDispatchedTapKey: string | null = null

async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  for (const channelId of Object.values(NOTIFICATION_CHANNELS)) {
    await Notifications.setNotificationChannelAsync(
      channelId,
      NOTIFICATION_CHANNEL_SETTINGS[channelId],
    )
  }
  await Notifications.deleteNotificationChannelAsync(LEGACY_CHANNEL_ID)
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

async function resolveNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannels()
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

export function requestNotificationPermission(): Promise<boolean> {
  if (permissionRequest === null) {
    permissionRequest = resolveNotificationPermission().catch((error) => {
      permissionRequest = null
      throw error
    })
  }
  return permissionRequest
}

export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS !== 'android') {
    return null
  }
  try {
    const permissions = await Notifications.getPermissionsAsync()
    if (!permissions.granted) {
      return null
    }
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId
    if (!projectId) {
      return null
    }
    const token = await Notifications.getExpoPushTokenAsync({ projectId })
    return token.data
  } catch {
    return null
  }
}

export async function scheduleReminderNotification(
  reminder: Reminder,
): Promise<void> {
  const fireDate = getSchedulableFireDate(reminder)
  if (fireDate === null) {
    return
  }
  await ensureAndroidChannels()
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
      channelId: NOTIFICATION_CHANNELS.alarms,
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
  await ensureAndroidChannels()
  await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID)
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_SUMMARY_ID,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: NOTIFICATION_CHANNELS.summaries,
    },
  })
}

export async function cancelDailySummaryNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_SUMMARY_ID)
}

export interface NotificationTap {
  reminderId: string
  nextFireAt: string
}

function dispatchNotificationTap(
  response: Notifications.NotificationResponse,
  onTap: (tap: NotificationTap) => void,
): void {
  const data = response.notification.request.content.data
  const reminderId = data?.reminderId
  const nextFireAt = data?.nextFireAt
  if (typeof reminderId !== 'string' || typeof nextFireAt !== 'string') {
    return
  }
  const tapKey = `${response.notification.request.identifier}:${response.notification.date}`
  if (tapKey === lastDispatchedTapKey) {
    return
  }
  lastDispatchedTapKey = tapKey
  onTap({ reminderId, nextFireAt })
}

export function subscribeToNotificationTaps(
  onTap: (tap: NotificationTap) => void,
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => dispatchNotificationTap(response, onTap),
  )

  const lastResponse = Notifications.getLastNotificationResponse()
  if (lastResponse) {
    dispatchNotificationTap(lastResponse, onTap)
    Notifications.clearLastNotificationResponse()
  }

  return () => subscription.remove()
}
