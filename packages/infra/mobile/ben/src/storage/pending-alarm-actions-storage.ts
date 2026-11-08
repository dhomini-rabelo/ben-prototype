import AsyncStorage from '@react-native-async-storage/async-storage'

const PENDING_ALARM_ACTIONS_KEY = '@ben/pending-alarm-actions'

export type PendingAlarmAction = {
  reminderId: string
  type: 'stop' | 'snooze' | 'done'
  firedAt: string
  actedAt: string
  snoozeUntil?: string
}

function getPendingKey(action: PendingAlarmAction): string {
  return `${action.reminderId}:${action.firedAt}:${action.type}`
}

export async function listPendingAlarmActions(): Promise<PendingAlarmAction[]> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_ALARM_ACTIONS_KEY)
    return raw ? (JSON.parse(raw) as PendingAlarmAction[]) : []
  } catch {
    return []
  }
}

async function savePendingAlarmActions(
  actions: PendingAlarmAction[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      PENDING_ALARM_ACTIONS_KEY,
      JSON.stringify(actions),
    )
  } catch {
    // the action stays only in memory until the next attempt
  }
}

export async function addPendingAlarmAction(
  action: PendingAlarmAction,
): Promise<void> {
  const key = getPendingKey(action)
  const actions = await listPendingAlarmActions()
  await savePendingAlarmActions([
    ...actions.filter((item) => getPendingKey(item) !== key),
    action,
  ])
}

export async function removePendingAlarmAction(
  action: PendingAlarmAction,
): Promise<void> {
  const key = getPendingKey(action)
  const actions = await listPendingAlarmActions()
  await savePendingAlarmActions(
    actions.filter((item) => getPendingKey(item) !== key),
  )
}

export async function listPendingAlarmKeys(): Promise<Set<string>> {
  const actions = await listPendingAlarmActions()
  return new Set(
    actions.map((action) => `${action.reminderId}:${action.firedAt}`),
  )
}
