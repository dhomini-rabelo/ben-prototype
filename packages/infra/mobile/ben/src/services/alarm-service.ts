import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidNotificationSetting,
  EventType,
  TriggerType,
  type Event,
} from 'react-native-notify-kit'
import { Platform } from 'react-native'

import { AlarmSound } from '../../modules/alarm-sound'
import type { Reminder } from '@/api/models/reminder'
import { useLanguageStore } from '@/layout/stores/language-store'
import type { FiredAlarm } from '@/layout/stores/alarm-store'
import { alarmStrings } from '@/layout/strings/alarm-strings'

export type FullScreenPermission = 'granted' | 'denied' | 'unsupported'

export type AlarmNotificationData = {
  reminderId: string
  firedAt: string
  title: string
  kind: Reminder['kind']
}

export type AlarmEvent = {
  type: 'delivered' | 'press' | 'stop' | 'snooze'
  data: AlarmNotificationData
}

const ALARM_ID_PREFIX = 'alarm:'
const MISSED_ALARM_DELAY_MS = 10 * 60 * 1000
const STOP_ACTION_ID = 'alarm-stop'
const SNOOZE_ACTION_ID = 'alarm-snooze'
const DEFAULT_PRESS_ACTION = { id: 'default', launchActivity: 'default' }

export const ALARM_CHANNEL = {
  id: 'ben-alarme',
  name: 'Alarms',
  importance: AndroidImportance.HIGH,
  sound: 'ben_alarm',
  bypassDnd: true,
} as const

export const ALARM_CATEGORY = AndroidCategory.ALARM

export async function ensureAlarmChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await notifee.createChannel({ ...ALARM_CHANNEL })
}

export async function startAlarmSound(
  maxDurationMs: number,
): Promise<'playing' | 'blocked'> {
  if (Platform.OS !== 'android' || AlarmSound === null) {
    return 'blocked'
  }
  await AlarmSound.start(maxDurationMs)
  return 'playing'
}

export async function stopAlarmSound(): Promise<void> {
  if (Platform.OS !== 'android' || AlarmSound === null) {
    return
  }
  AlarmSound.stop()
}

export function leaveLockScreen(): void {
  if (Platform.OS !== 'android' || AlarmSound === null) {
    return
  }
  AlarmSound.leaveLockScreen()
}

function getAlarmId(reminderId: string): string {
  return `${ALARM_ID_PREFIX}${reminderId}`
}

function getMissedId(reminderId: string): string {
  return `missed:${reminderId}`
}

function getStrings() {
  return alarmStrings[useLanguageStore.getState().language]
}

function toStringRecord(data: AlarmNotificationData): Record<string, string> {
  return {
    reminderId: data.reminderId,
    firedAt: data.firedAt,
    title: data.title,
    kind: data.kind,
  }
}

function parseAlarmData(
  raw: Record<string, unknown> | undefined,
): AlarmNotificationData | null {
  if (
    typeof raw?.reminderId !== 'string' ||
    typeof raw.firedAt !== 'string' ||
    typeof raw.title !== 'string' ||
    (raw.kind !== 'alarm' && raw.kind !== 'goal' && raw.kind !== 'conditional')
  ) {
    return null
  }
  return {
    reminderId: raw.reminderId,
    firedAt: raw.firedAt,
    title: raw.title,
    kind: raw.kind,
  }
}

function toAlarmEvent(event: Event): AlarmEvent | null {
  const data = parseAlarmData(event.detail.notification?.data)
  if (
    data === null ||
    event.detail.notification?.id !== getAlarmId(data.reminderId)
  ) {
    return null
  }
  if (event.type === EventType.DELIVERED) {
    return { type: 'delivered', data }
  }
  if (event.type === EventType.PRESS) {
    return { type: 'press', data }
  }
  if (event.type === EventType.ACTION_PRESS) {
    const actionId = event.detail.pressAction?.id
    if (actionId === STOP_ACTION_ID) {
      return { type: 'stop', data }
    }
    if (actionId === SNOOZE_ACTION_ID) {
      return { type: 'snooze', data }
    }
  }
  return null
}

export async function getFullScreenPermission(): Promise<FullScreenPermission> {
  if (Platform.OS !== 'android') {
    return 'unsupported'
  }
  const settings = await notifee.getNotificationSettings()
  return settings.android.fullScreenIntent ===
    AndroidNotificationSetting.DISABLED
    ? 'denied'
    : 'granted'
}

export async function openFullScreenSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await notifee.openNotificationSettings()
}

export async function scheduleReminderAlarm(
  input: AlarmNotificationData,
  fullScreen: FullScreenPermission,
): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await ensureAlarmChannel()
  const firedAtMs = new Date(input.firedAt).getTime()
  const strings = getStrings()
  await notifee.createTriggerNotification(
    {
      id: getAlarmId(input.reminderId),
      title: input.title,
      data: toStringRecord(input),
      android: {
        channelId: ALARM_CHANNEL.id,
        category: ALARM_CATEGORY,
        pressAction: DEFAULT_PRESS_ACTION,
        ...(fullScreen === 'granted'
          ? { fullScreenAction: { id: 'default', launchActivity: 'default' } }
          : {}),
        actions: [
          { title: strings.stop, pressAction: { id: STOP_ACTION_ID } },
          { title: strings.snooze, pressAction: { id: SNOOZE_ACTION_ID } },
        ],
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: firedAtMs,
      alarmManager: { type: AlarmType.SET_ALARM_CLOCK },
    },
  )
  await notifee.createTriggerNotification(
    {
      id: getMissedId(input.reminderId),
      title: strings.missedAlarm,
      body: input.title,
      data: toStringRecord(input),
      android: {
        channelId: ALARM_CHANNEL.id,
        pressAction: DEFAULT_PRESS_ACTION,
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: firedAtMs + MISSED_ALARM_DELAY_MS,
    },
  )
}

export async function cancelReminderAlarm(reminderId: string): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await notifee.cancelTriggerNotifications([
    getAlarmId(reminderId),
    getMissedId(reminderId),
  ])
}

export async function cancelDisplayedAlarm(reminderId: string): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await notifee.cancelDisplayedNotification(getAlarmId(reminderId))
}

export async function showMissedAlarmNotification(
  alarm: FiredAlarm,
): Promise<void> {
  if (Platform.OS !== 'android') {
    return
  }
  await ensureAlarmChannel()
  await notifee.displayNotification({
    id: getMissedId(alarm.reminderId),
    title: getStrings().missedAlarm,
    body: alarm.title,
    data: toStringRecord(alarm),
    android: {
      channelId: ALARM_CHANNEL.id,
      pressAction: DEFAULT_PRESS_ACTION,
    },
  })
}

export function subscribeToAlarmEvents(
  handler: (event: AlarmEvent) => void,
): () => void {
  if (Platform.OS !== 'android') {
    return () => {}
  }
  return notifee.onForegroundEvent((event) => {
    const alarmEvent = toAlarmEvent(event)
    if (alarmEvent !== null) {
      handler(alarmEvent)
    }
  })
}

export function registerAlarmBackgroundHandler(
  handler: (event: AlarmEvent) => Promise<void>,
): void {
  if (Platform.OS !== 'android') {
    return
  }
  notifee.onBackgroundEvent(async (event) => {
    const alarmEvent = toAlarmEvent(event)
    if (alarmEvent !== null) {
      await handler(alarmEvent)
    }
  })
}

export async function getInitialAlarm(): Promise<AlarmNotificationData | null> {
  if (Platform.OS !== 'android') {
    return null
  }
  const initial = await notifee.getInitialNotification()
  return parseAlarmData(initial?.notification.data)
}

export async function getScheduledAlarmReminderIds(): Promise<string[]> {
  if (Platform.OS !== 'android') {
    return []
  }
  const ids = await notifee.getTriggerNotificationIds()
  return ids
    .filter((id) => id.startsWith(ALARM_ID_PREFIX))
    .map((id) => id.slice(ALARM_ID_PREFIX.length))
}
