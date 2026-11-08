import notifee, {
  AndroidCategory,
  AndroidImportance,
} from 'react-native-notify-kit'
import { Platform } from 'react-native'

import { AlarmSound } from '../../modules/alarm-sound'

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
