import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Reminder } from '@/api/models/reminder'

const platform = vi.hoisted(() => ({ OS: 'android' }))

const notifee = vi.hoisted(() => ({
  createChannel: vi.fn(),
  createTriggerNotification: vi.fn(),
  cancelTriggerNotifications: vi.fn(),
  getTriggerNotificationIds: vi.fn(),
}))

const notifications = vi.hoisted(() => ({
  AndroidImportance: { DEFAULT: 3, HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
  setNotificationHandler: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  deleteNotificationChannelAsync: vi.fn(),
  getPermissionsAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  getAllScheduledNotificationsAsync: vi.fn(),
}))

vi.mock('react-native', () => ({ Platform: platform }))
vi.mock('expo-constants', () => ({ default: {} }))
vi.mock('expo-notifications', () => notifications)
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

type Service = typeof import('@/services/notifications-service')

const FIRE_AT = new Date(Date.now() + 60 * 60 * 1000).toISOString()
const EARLIER = new Date(Date.now() + 30 * 60 * 1000).toISOString()

function buildReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: 'reminder-1',
    title: 'Pick up Leo',
    kind: 'alarm',
    status: 'active',
    firesAt: FIRE_AT,
    body: null,
    capturedAt: new Date().toISOString(),
    timeZone: 'UTC',
    alerts: [],
    recurrence: null,
    messages: [],
    checkFrequency: null,
    nextFireAt: FIRE_AT,
    snoozedUntil: null,
    acknowledgedUntil: null,
    completedAt: null,
    actions: [],
    ...overrides,
  }
}

async function loadService(): Promise<Service> {
  vi.resetModules()
  return import('@/services/notifications-service')
}

describe('alarm scheduling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    platform.OS = 'android'
    notifications.getAllScheduledNotificationsAsync.mockResolvedValue([])
    notifee.getTriggerNotificationIds.mockResolvedValue([])
  })

  it('schedules a time reminder as a full-screen alarm clock (T01)', async () => {
    const service = await loadService()

    await service.syncReminderNotifications([buildReminder()], 'granted')

    const [notification, trigger] =
      notifee.createTriggerNotification.mock.calls[0]
    expect(notification.id).toBe('alarm:reminder-1')
    expect(notification.android).toMatchObject({
      channelId: 'ben-alarme',
      category: 'alarm',
      fullScreenAction: expect.objectContaining({ id: 'default' }),
    })
    expect(trigger).toMatchObject({
      timestamp: new Date(FIRE_AT).getTime(),
      alarmManager: { type: 4 },
    })
    expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  it('schedules the missed alarm notification 10 minutes later', async () => {
    const service = await loadService()

    await service.syncReminderNotifications([buildReminder()], 'granted')

    const [notification, trigger] =
      notifee.createTriggerNotification.mock.calls[1]
    expect(notification.id).toBe('missed:reminder-1')
    expect(trigger.timestamp).toBe(new Date(FIRE_AT).getTime() + 600000)
  })

  it('falls back to the alarmes channel without the full screen (T02)', async () => {
    const service = await loadService()

    await service.syncReminderNotifications([buildReminder()], 'denied')

    expect(notifee.createTriggerNotification).not.toHaveBeenCalled()
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'reminder-1',
        trigger: expect.objectContaining({ channelId: 'alarmes' }),
      }),
    )
  })

  it('keeps an early alert as a regular notification (T03)', async () => {
    const service = await loadService()

    await service.syncReminderNotifications(
      [buildReminder({ nextFireAt: EARLIER })],
      'granted',
    )

    expect(notifee.createTriggerNotification).not.toHaveBeenCalled()
    expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          data: expect.objectContaining({
            title: 'Pick up Leo',
            kind: 'alarm',
          }),
        }),
      }),
    )
  })

  it('unschedules the old alarm of a removed or completed reminder (T05)', async () => {
    notifee.getTriggerNotificationIds.mockResolvedValue([
      'alarm:gone',
      'missed:gone',
      'alarm:done',
    ])
    const service = await loadService()

    await service.syncReminderNotifications(
      [buildReminder({ id: 'done', status: 'done' })],
      'granted',
    )

    expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith([
      'alarm:gone',
      'missed:gone',
    ])
    expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith([
      'alarm:done',
      'missed:done',
    ])
  })

  it('replaces the alarm when the time changes (T05)', async () => {
    notifee.getTriggerNotificationIds.mockResolvedValue(['alarm:reminder-1'])
    const service = await loadService()

    await service.syncReminderNotifications(
      [buildReminder({ nextFireAt: EARLIER })],
      'granted',
    )

    expect(notifee.cancelTriggerNotifications).toHaveBeenCalledWith([
      'alarm:reminder-1',
      'missed:reminder-1',
    ])
  })
})
