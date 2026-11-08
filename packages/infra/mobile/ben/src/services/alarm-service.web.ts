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
