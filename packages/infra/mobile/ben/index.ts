import 'expo-router/entry'

import { getRemainingSoundMs } from '@/layout/stores/alarm-store'
import { snoozeAlarm, stopAlarm, toFiredAlarm } from '@/services/alarm-actions'
import {
  registerAlarmBackgroundHandler,
  startAlarmSound,
} from '@/services/alarm-service'

registerAlarmBackgroundHandler(async (event) => {
  if (event.type === 'delivered') {
    await startAlarmSound(getRemainingSoundMs(event.data.firedAt, Date.now()))
    return
  }
  if (event.type === 'stop') {
    await stopAlarm(toFiredAlarm(event.data))
    return
  }
  if (event.type === 'snooze') {
    await snoozeAlarm(toFiredAlarm(event.data), null)
  }
})
