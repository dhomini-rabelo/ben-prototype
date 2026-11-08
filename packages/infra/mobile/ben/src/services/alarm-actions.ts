import { useAlarmStore } from '@/layout/stores/alarm-store'
import type { AlarmNotificationData } from '@/services/alarm-service'

export function openAlarmFromNotification(data: AlarmNotificationData): void {
  useAlarmStore.getState().enqueue({
    reminderId: data.reminderId,
    title: data.title,
    kind: data.kind,
    firedAt: data.firedAt,
    reminder: null,
    sound: 'off',
  })
}
