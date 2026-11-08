import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FiredAlarm } from '@/layout/stores/alarm-store'

const pending = vi.hoisted(() => ({ list: [] as Record<string, string>[] }))

vi.mock('@/services/alarm-service', () => ({
  showMissedAlarmNotification: vi.fn(),
  stopAlarmSound: vi.fn(),
  cancelReminderAlarm: vi.fn(),
  scheduleReminderAlarm: vi.fn(),
  getFullScreenPermission: vi.fn(async () => 'granted'),
  leaveLockScreen: vi.fn(),
}))
const queryClient = vi.hoisted(() => ({ invalidateQueries: vi.fn() }))

vi.mock('@/core/query-client', () => ({ queryClient }))
vi.mock('@/api/routes', () => ({
  API_ROUTES: { reminders: { list: '/reminders' } },
}))
vi.mock('@/api/requests/reminders', () => ({
  ACTIVE_REMINDERS_PARAMS: { status: 'active' },
  requestAcknowledgeReminder: vi.fn(),
  requestUpdateReminder: vi.fn(),
}))
vi.mock('@/storage/pending-alarm-actions-storage', () => ({
  addPendingAlarmAction: vi.fn(async (action: Record<string, string>) => {
    pending.list.push(action)
  }),
  removePendingAlarmAction: vi.fn(async (action: Record<string, string>) => {
    pending.list = pending.list.filter((item) => item !== action)
  }),
  listPendingAlarmActions: vi.fn(async () => [...pending.list]),
  listPendingAlarmKeys: vi.fn(
    async () =>
      new Set(pending.list.map((item) => `${item.reminderId}:${item.firedAt}`)),
  ),
}))

const ALARM: FiredAlarm = {
  reminderId: 'reminder-1',
  firedAt: '2026-01-01T10:00:00.000Z',
  title: 'Pick up Leo',
  kind: 'alarm',
  reminder: null,
  sound: 'on',
}

async function load() {
  const actions = await import('@/services/alarm-actions')
  const service = await import('@/services/alarm-service')
  const requests = await import('@/api/requests/reminders')
  const { useAlarmStore } = await import('@/layout/stores/alarm-store')
  return { actions, service, requests, useAlarmStore }
}

describe('alarm actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    pending.list = []
    const { useAlarmStore } = await load()
    useAlarmStore.getState().reset()
  })

  it('opens the alarm from the notification without sound or network (T19)', async () => {
    const { actions, useAlarmStore } = await load()

    actions.openAlarmFromNotification({
      reminderId: 'reminder-1',
      firedAt: '2026-01-01T10:00:00.000Z',
      title: 'Pick up Leo',
      kind: 'alarm',
    })

    expect(useAlarmStore.getState().current).toEqual({
      reminderId: 'reminder-1',
      firedAt: '2026-01-01T10:00:00.000Z',
      title: 'Pick up Leo',
      kind: 'alarm',
      reminder: null,
      sound: 'off',
    })
  })

  it('stop offline silences before the network, keeps the action and resends it later (T06)', async () => {
    const { actions, service, requests, useAlarmStore } = await load()
    useAlarmStore.getState().enqueue(ALARM)
    vi.mocked(requests.requestAcknowledgeReminder).mockRejectedValueOnce(
      new Error('offline'),
    )

    await actions.stopAlarm(ALARM)

    expect(
      vi.mocked(service.stopAlarmSound).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(requests.requestAcknowledgeReminder).mock
        .invocationCallOrder[0],
    )
    expect(useAlarmStore.getState().current).toBeNull()
    expect(pending.list).toHaveLength(1)

    await actions.flushPendingAlarmActions()

    expect(requests.requestAcknowledgeReminder).toHaveBeenCalledTimes(2)
    expect(requests.requestAcknowledgeReminder).toHaveBeenLastCalledWith(
      'reminder-1',
      expect.objectContaining({ firedAt: ALARM.firedAt }),
    )
    expect(pending.list).toHaveLength(0)
    expect(service.stopAlarmSound).toHaveBeenCalledTimes(1)
  })

  it('a pending action keeps the alarm from coming back after restore (T06)', async () => {
    const { actions, useAlarmStore } = await load()
    pending.list = [
      {
        reminderId: 'reminder-1',
        type: 'stop',
        firedAt: ALARM.firedAt,
        actedAt: ALARM.firedAt,
      },
    ]

    await actions.restorePendingAlarmKeys()

    expect(useAlarmStore.getState().enqueue(ALARM)).toBe(false)
    expect(useAlarmStore.getState().queue).toEqual([])
  })

  it('snooze reschedules at once with the system permission, 10 min without options (T07)', async () => {
    const { actions, service, requests, useAlarmStore } = await load()
    useAlarmStore.getState().enqueue(ALARM)
    vi.mocked(requests.requestAcknowledgeReminder).mockRejectedValue(
      new Error('offline'),
    )
    const before = Date.now()

    await actions.snoozeAlarm(ALARM, null)

    const [input, permission] = vi.mocked(service.scheduleReminderAlarm).mock
      .calls[0]
    expect(permission).toBe('granted')
    const delay = new Date(input.firedAt).getTime() - before
    expect(delay).toBeGreaterThanOrEqual(10 * 60 * 1000)
    expect(delay).toBeLessThan(10 * 60 * 1000 + 5000)
    expect(useAlarmStore.getState().current).toBeNull()
    expect(pending.list[0]).toMatchObject({
      type: 'snooze',
      snoozeUntil: input.firedAt,
    })
  })

  it('refetches the active reminders after the snooze is sent so the new firedAt can enter the queue', async () => {
    const { actions, requests, useAlarmStore } = await load()
    vi.mocked(requests.requestAcknowledgeReminder).mockResolvedValue(
      undefined as never,
    )
    const nextFiredAt = '2026-01-01T10:10:00.000Z'

    await actions.snoozeAlarm(ALARM, new Date(nextFiredAt))
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1)

    const second = { ...ALARM, firedAt: nextFiredAt }
    expect(useAlarmStore.getState().enqueue(second)).toBe(true)
    expect(useAlarmStore.getState().current).toEqual(second)
  })

  it('each new snooze reschedules again (T07)', async () => {
    const { actions, service } = await load()
    const until = new Date('2026-01-01T10:15:00.000Z')

    await actions.snoozeAlarm(ALARM, until)
    await actions.snoozeAlarm(
      { ...ALARM, firedAt: until.toISOString() },
      new Date('2026-01-01T10:30:00.000Z'),
    )

    expect(service.scheduleReminderAlarm).toHaveBeenCalledTimes(2)
  })

  it('complete offline closes and silences at once and resends later (T08)', async () => {
    const { actions, service, requests, useAlarmStore } = await load()
    useAlarmStore.getState().enqueue(ALARM)
    vi.mocked(requests.requestUpdateReminder).mockRejectedValueOnce(
      new Error('offline'),
    )

    await actions.completeAlarm(ALARM)

    expect(service.stopAlarmSound).toHaveBeenCalled()
    expect(useAlarmStore.getState().current).toBeNull()
    expect(pending.list).toHaveLength(1)

    await actions.flushPendingAlarmActions()

    expect(requests.requestUpdateReminder).toHaveBeenLastCalledWith(
      'reminder-1',
      expect.objectContaining({ status: 'done', firedAt: ALARM.firedAt }),
    )
    expect(pending.list).toHaveLength(0)
  })
})
