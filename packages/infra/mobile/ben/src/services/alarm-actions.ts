import {
  requestAcknowledgeReminder,
  requestUpdateReminder,
} from '@/api/requests/reminders'
import {
  getFiredKey,
  type FiredAlarm,
  useAlarmStore,
} from '@/layout/stores/alarm-store'
import {
  cancelReminderAlarm,
  getFullScreenPermission,
  leaveLockScreen,
  scheduleReminderAlarm,
  stopAlarmSound,
  type AlarmNotificationData,
} from '@/services/alarm-service'
import {
  addPendingAlarmAction,
  listPendingAlarmActions,
  listPendingAlarmKeys,
  removePendingAlarmAction,
  type PendingAlarmAction,
} from '@/storage/pending-alarm-actions-storage'

const DEFAULT_SNOOZE_MS = 10 * 60 * 1000

let flushing: Promise<void> | null = null

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

export function toFiredAlarm(data: AlarmNotificationData): FiredAlarm {
  return { ...data, reminder: null, sound: 'off' }
}

function closeAlarm(alarm: FiredAlarm): void {
  const store = useAlarmStore.getState()
  if (store.current && getFiredKey(store.current) === getFiredKey(alarm)) {
    store.dismissCurrent()
  } else {
    store.markFired([getFiredKey(alarm)])
  }
  leaveLockScreen()
}

async function sendPendingAction(action: PendingAlarmAction): Promise<boolean> {
  try {
    if (action.type === 'done') {
      await requestUpdateReminder(action.reminderId, {
        status: 'done',
        firedAt: action.firedAt,
        actedAt: action.actedAt,
      })
    } else {
      await requestAcknowledgeReminder(action.reminderId, {
        firedAt: action.firedAt,
        actedAt: action.actedAt,
        ...(action.snoozeUntil ? { snoozeUntil: action.snoozeUntil } : {}),
      })
    }
    await removePendingAlarmAction(action)
    return true
  } catch {
    return false
  }
}

async function settleAlarmAction(action: PendingAlarmAction): Promise<void> {
  await addPendingAlarmAction(action)
  await sendPendingAction(action)
}

export async function stopAlarm(alarm: FiredAlarm): Promise<void> {
  await stopAlarmSound()
  await cancelReminderAlarm(alarm.reminderId)
  closeAlarm(alarm)
  await settleAlarmAction({
    reminderId: alarm.reminderId,
    type: 'stop',
    firedAt: alarm.firedAt,
    actedAt: new Date().toISOString(),
  })
}

export async function snoozeAlarm(
  alarm: FiredAlarm,
  snoozeUntil: Date | null,
): Promise<void> {
  const acted = new Date()
  const until = snoozeUntil ?? new Date(acted.getTime() + DEFAULT_SNOOZE_MS)
  await stopAlarmSound()
  await scheduleReminderAlarm(
    {
      reminderId: alarm.reminderId,
      firedAt: until.toISOString(),
      title: alarm.title,
      kind: alarm.kind,
    },
    await getFullScreenPermission(),
  )
  closeAlarm(alarm)
  await settleAlarmAction({
    reminderId: alarm.reminderId,
    type: 'snooze',
    firedAt: alarm.firedAt,
    actedAt: acted.toISOString(),
    snoozeUntil: until.toISOString(),
  })
}

export async function completeAlarm(alarm: FiredAlarm): Promise<void> {
  await stopAlarmSound()
  await cancelReminderAlarm(alarm.reminderId)
  closeAlarm(alarm)
  await settleAlarmAction({
    reminderId: alarm.reminderId,
    type: 'done',
    firedAt: alarm.firedAt,
    actedAt: new Date().toISOString(),
  })
}

export function flushPendingAlarmActions(): Promise<void> {
  if (flushing) {
    return flushing
  }
  flushing = (async () => {
    const actions = await listPendingAlarmActions()
    for (const action of actions) {
      await sendPendingAction(action)
    }
  })().finally(() => {
    flushing = null
  })
  return flushing
}

export async function restorePendingAlarmKeys(): Promise<void> {
  const keys = await listPendingAlarmKeys()
  if (keys.size > 0) {
    useAlarmStore.getState().markFired(keys)
  }
}
