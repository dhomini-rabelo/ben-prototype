import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/alarm-service', () => ({
  showMissedAlarmNotification: vi.fn(),
  stopAlarmSound: vi.fn(),
}))

describe('alarm actions', () => {
  beforeEach(async () => {
    const { useAlarmStore } = await import('@/layout/stores/alarm-store')
    useAlarmStore.getState().reset()
  })

  it('opens the alarm from the notification without sound or network (T19)', async () => {
    const { openAlarmFromNotification } =
      await import('@/services/alarm-actions')
    const { useAlarmStore } = await import('@/layout/stores/alarm-store')

    openAlarmFromNotification({
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
})
