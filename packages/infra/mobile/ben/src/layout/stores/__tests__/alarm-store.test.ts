import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getFiredKey,
  getRemainingSoundMs,
  selectVisiblePopup,
  useAlarmStore,
  type FiredAlarm,
} from '@/layout/stores/alarm-store'

const service = vi.hoisted(() => ({
  stopAlarmSound: vi.fn(),
  showMissedAlarmNotification: vi.fn(),
}))

vi.mock('@/services/alarm-service', () => service)

const NOW = new Date('2026-01-01T10:00:00.000Z').getTime()

function buildAlarm(overrides: Partial<FiredAlarm> = {}): FiredAlarm {
  return {
    reminderId: 'reminder-1',
    title: 'Pick up Leo',
    kind: 'alarm',
    firedAt: new Date(NOW).toISOString(),
    reminder: null,
    sound: 'on',
    ...overrides,
  }
}

describe('alarm store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAlarmStore.getState().reset()
  })

  it('shows the oldest alarm first and the next after acting (T09)', () => {
    const store = useAlarmStore.getState()
    store.enqueue(
      buildAlarm({
        reminderId: 'later',
        firedAt: new Date(NOW + 60000).toISOString(),
      }),
    )
    store.enqueue(buildAlarm({ reminderId: 'older' }))

    expect(useAlarmStore.getState().current?.reminderId).toBe('older')

    useAlarmStore.getState().dismissCurrent()

    expect(useAlarmStore.getState().current?.reminderId).toBe('later')
  })

  it('enqueues the same fire once across notification and 15 s check (T10)', () => {
    const store = useAlarmStore.getState()

    const first = store.enqueue(buildAlarm())
    const second = useAlarmStore
      .getState()
      .enqueue(buildAlarm({ sound: 'off' }))

    expect(first).toBe(true)
    expect(second).toBe(false)
    expect(useAlarmStore.getState().queue).toHaveLength(1)
    expect(getFiredKey(buildAlarm())).toBe(
      `reminder-1:${new Date(NOW).toISOString()}`,
    )
  })

  it('puts the alarm ahead of the daily summary (T11)', () => {
    expect(selectVisiblePopup(buildAlarm(), true)).toBe('alarm')
    expect(selectVisiblePopup(null, true)).toBe('summary')
    expect(selectVisiblePopup(null, false)).toBeNull()
  })

  it('stops the sound and leaves a missed notification after 10 min (T12)', () => {
    useAlarmStore.getState().enqueue(buildAlarm())

    useAlarmStore.getState().expireCurrent(NOW + 599000)
    expect(service.stopAlarmSound).not.toHaveBeenCalled()

    useAlarmStore.getState().expireCurrent(NOW + 600000)

    expect(service.stopAlarmSound).toHaveBeenCalledTimes(1)
    expect(service.showMissedAlarmNotification).toHaveBeenCalledTimes(1)
    expect(useAlarmStore.getState().current?.sound).toBe('off')
  })

  it('computes the remaining sound time without going below zero (T12)', () => {
    const firedAt = new Date(NOW).toISOString()

    expect(getRemainingSoundMs(firedAt, NOW + 1000)).toBe(599000)
    expect(getRemainingSoundMs(firedAt, NOW + 900000)).toBe(0)
  })

  it('drops already fired keys from the queue and silences the current (T09)', () => {
    const store = useAlarmStore.getState()
    store.enqueue(buildAlarm())

    useAlarmStore.getState().markFired([getFiredKey(buildAlarm())])

    expect(useAlarmStore.getState().current).toBeNull()
    expect(service.stopAlarmSound).toHaveBeenCalledTimes(1)
  })
})
