import type { Reminder } from '@/api/models/reminder'
import type { FiredAlarm } from '@/layout/stores/alarm-store'

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

const ALARM_SOUND_URL = require('../../assets/sounds/ben_alarm.wav') as string

let audio: HTMLAudioElement | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null

export const ALARM_CHANNEL = {
  id: 'ben-alarme',
  name: 'Alarms',
  importance: 4,
  sound: 'ben_alarm',
  bypassDnd: true,
} as const

export const ALARM_CATEGORY = 'alarm'

export async function ensureAlarmChannel(): Promise<void> {}

export async function startAlarmSound(
  maxDurationMs: number,
): Promise<'playing' | 'blocked'> {
  if (typeof Audio === 'undefined') {
    return 'blocked'
  }
  if (audio !== null) {
    return 'playing'
  }
  const element = new Audio(ALARM_SOUND_URL)
  element.loop = true
  try {
    await element.play()
  } catch {
    return 'blocked'
  }
  audio = element
  stopTimer = setTimeout(() => {
    void stopAlarmSound()
  }, maxDurationMs)
  return 'playing'
}

export async function stopAlarmSound(): Promise<void> {
  if (stopTimer !== null) {
    clearTimeout(stopTimer)
    stopTimer = null
  }
  audio?.pause()
  audio = null
}

export function leaveLockScreen(): void {}

export async function getFullScreenPermission(): Promise<FullScreenPermission> {
  return 'unsupported'
}

export async function openFullScreenSettings(): Promise<void> {}

export async function scheduleReminderAlarm(
  _input: AlarmNotificationData,
  _fullScreen: FullScreenPermission,
): Promise<void> {}

export async function cancelReminderAlarm(_reminderId: string): Promise<void> {}

export async function cancelDisplayedAlarm(
  _reminderId: string,
): Promise<void> {}

export async function showMissedAlarmNotification(
  _alarm: FiredAlarm,
): Promise<void> {}

export function subscribeToAlarmEvents(
  _handler: (event: AlarmEvent) => void,
): () => void {
  return () => {}
}

export function registerAlarmBackgroundHandler(
  _handler: (event: AlarmEvent) => Promise<void>,
): void {}

export async function getInitialAlarm(): Promise<AlarmNotificationData | null> {
  return null
}

export async function getScheduledAlarmReminderIds(): Promise<string[]> {
  return []
}
