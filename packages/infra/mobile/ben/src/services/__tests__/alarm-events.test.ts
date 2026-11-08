import { beforeEach, describe, expect, it, vi } from 'vitest'

const notifee = vi.hoisted(() => ({
  onForegroundEvent: vi.fn(),
}))

vi.mock('react-native', () => ({ Platform: { OS: 'android' } }))
vi.mock('react-native-notify-kit', () => ({
  default: notifee,
  AlarmType: { SET_ALARM_CLOCK: 4 },
  AndroidCategory: { ALARM: 'alarm' },
  AndroidImportance: { HIGH: 4 },
  AndroidNotificationSetting: { DISABLED: 0, ENABLED: 1 },
  EventType: { PRESS: 1, ACTION_PRESS: 2, DELIVERED: 3 },
  TriggerType: { TIMESTAMP: 0 },
}))
vi.mock('../../../modules/alarm-sound', () => ({ AlarmSound: null }))
vi.mock('@/layout/stores/language-store', () => ({
  useLanguageStore: { getState: () => ({ language: 'en' }) },
}))

const DATA = {
  reminderId: 'reminder-1',
  firedAt: '2026-11-08T10:00:00.000Z',
  title: 'Buscar o Leo',
  kind: 'alarm',
}

function buildEvent(type: number, id: string) {
  return { type, detail: { notification: { id, data: DATA } } }
}

describe('subscribeToAlarmEvents', () => {
  let emit: (event: unknown) => void
  const handler = vi.fn()

  beforeEach(async () => {
    handler.mockReset()
    notifee.onForegroundEvent.mockImplementation((listener) => {
      emit = listener
      return () => {}
    })
    const { subscribeToAlarmEvents } = await import('@/services/alarm-service')
    subscribeToAlarmEvents(handler)
  })

  it('opens the alarm when the missed-alarm notification is pressed', () => {
    emit(buildEvent(1, 'missed:reminder-1'))

    expect(handler).toHaveBeenCalledWith({ type: 'press', data: DATA })
  })

  it('ignores other events on the missed-alarm notification', () => {
    emit(buildEvent(3, 'missed:reminder-1'))
    emit(buildEvent(2, 'missed:reminder-1'))

    expect(handler).not.toHaveBeenCalled()
  })
})
