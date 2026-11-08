import 'expo-router/entry'

import { getRemainingSoundMs, useAlarmStore } from '@/layout/stores/alarm-store'
import {
  openAlarmFromNotification,
  snoozeAlarm,
  stopAlarm,
  toFiredAlarm,
} from '@/services/alarm-actions'
import {
  registerAlarmBackgroundHandler,
  startAlarmSound,
} from '@/services/alarm-service'

registerAlarmBackgroundHandler(async (event) => {
  if (event.type === 'delivered') {
    useAlarmStore
      .getState()
      .enqueue({ ...toFiredAlarm(event.data), sound: 'on' })
    await startAlarmSound(getRemainingSoundMs(event.data.firedAt, Date.now()))
    return
  }
  if (event.type === 'press') {
    openAlarmFromNotification(event.data)
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
