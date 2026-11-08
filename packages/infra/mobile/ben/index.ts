import 'expo-router/entry'

import { getRemainingSoundMs } from '@/layout/stores/alarm-store'
import {
  registerAlarmBackgroundHandler,
  startAlarmSound,
} from '@/services/alarm-service'

registerAlarmBackgroundHandler(async (event) => {
  if (event.type === 'delivered') {
    await startAlarmSound(getRemainingSoundMs(event.data.firedAt, Date.now()))
  }
})
