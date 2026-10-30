import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Reminder } from '@/api/models/reminder'

const platform = vi.hoisted(() => ({ OS: 'android' }))
const constants = vi.hoisted(() => ({
  expoConfig: { extra: { eas: { projectId: 'project-1' } } } as {
    extra?: { eas?: { projectId?: string } }
  } | null,
  easConfig: null as { projectId?: string } | null,
}))
const callOrder = vi.hoisted(() => [] as string[])

const notifications = vi.hoisted(() => ({
  AndroidImportance: { DEFAULT: 3, HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily' },
  setNotificationHandler: vi.fn(),
  setNotificationChannelAsync: vi.fn(),
  deleteNotificationChannelAsync: vi.fn(),
  getPermissionsAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  getExpoPushTokenAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  getAllScheduledNotificationsAsync: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn(),
  getLastNotificationResponse: vi.fn(),
  clearLastNotificationResponse: vi.fn(),
}))

vi.mock('expo-notifications', () => notifications)
vi.mock('expo-constants', () => ({ default: constants }))
vi.mock('react-native', () => ({ Platform: platform }))

type Service = typeof import('@/services/notifications-service')

const FUTURE_DATE = new Date(Date.now() + 60 * 60 * 1000).toISOString()

function buildReminder(): Reminder {
  return {
    id: 'reminder-1',
    title: 'Call mom',
    kind: 'alarm',
    status: 'active',
    firesAt: FUTURE_DATE,
    body: null,
    capturedAt: new Date().toISOString(),
    timeZone: 'UTC',
    alerts: [],
    recurrence: null,
    messages: [],
    checkFrequency: null,
    nextFireAt: FUTURE_DATE,
    snoozedUntil: null,
    acknowledgedUntil: null,
    completedAt: null,
  }
}

function buildResponse(data: Record<string, unknown>, identifier = 'id-1') {
  return {
    notification: {
      date: 1000,
      request: { identifier, content: { data } },
    },
  }
}

async function loadService(): Promise<Service> {
  vi.resetModules()
  return import('@/services/notifications-service')
}

describe('notifications-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    callOrder.length = 0
    platform.OS = 'android'
    constants.expoConfig = { extra: { eas: { projectId: 'project-1' } } }
    constants.easConfig = null
    notifications.getPermissionsAsync.mockResolvedValue({
      granted: true,
      canAskAgain: true,
    })
    notifications.requestPermissionsAsync.mockResolvedValue({ granted: true })
    notifications.setNotificationChannelAsync.mockImplementation(async () => {
      callOrder.push('channel')
    })
    notifications.getPermissionsAsync.mockImplementation(async () => {
      callOrder.push('permission')
      return { granted: true, canAskAgain: true }
    })
    notifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[abc]',
    })
    notifications.getLastNotificationResponse.mockReturnValue(null)
    notifications.addNotificationResponseReceivedListener.mockReturnValue({
      remove: vi.fn(),
    })
  })

  describe('channels and permission', () => {
    it('creates both channels before checking the permission', async () => {
      const service = await loadService()

      await service.requestNotificationPermission()

      expect(notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'alarmes',
        { name: 'Reminders', importance: 4 },
      )
      expect(notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'resumos',
        { name: 'Daily summary', importance: 3 },
      )
      expect(callOrder).toEqual(['channel', 'channel', 'permission'])
    })

    it('deletes the legacy default channel', async () => {
      const service = await loadService()

      await service.requestNotificationPermission()

      expect(notifications.deleteNotificationChannelAsync).toHaveBeenCalledWith(
        'default',
      )
    })

    it('asks for the permission only once across callers', async () => {
      notifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
      })
      const service = await loadService()

      const results = await Promise.all([
        service.requestNotificationPermission(),
        service.requestNotificationPermission(),
      ])
      await service.requestNotificationPermission()

      expect(results).toEqual([true, true])
      expect(notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1)
    })
  })

  describe('scheduling', () => {
    it('schedules the reminder on the alarmes channel', async () => {
      const service = await loadService()

      await service.scheduleReminderNotification(buildReminder())

      expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'reminder-1',
          trigger: expect.objectContaining({ channelId: 'alarmes' }),
        }),
      )
    })

    it('schedules the daily summary on the resumos channel', async () => {
      const service = await loadService()

      await service.scheduleDailySummaryNotification('08:30', 'Title', 'Body')

      expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'daily-summary',
          trigger: expect.objectContaining({
            channelId: 'resumos',
            hour: 8,
            minute: 30,
          }),
        }),
      )
    })
  })

  describe('notification taps', () => {
    it('dispatches the cold start response and clears it', async () => {
      notifications.getLastNotificationResponse.mockReturnValue(
        buildResponse({ reminderId: 'reminder-1', nextFireAt: FUTURE_DATE }),
      )
      const service = await loadService()
      const onTap = vi.fn()

      service.subscribeToNotificationTaps(onTap)

      expect(onTap).toHaveBeenCalledWith({
        reminderId: 'reminder-1',
        nextFireAt: FUTURE_DATE,
      })
      expect(notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(
        1,
      )
    })

    it('ignores a cold start response without reminder data', async () => {
      notifications.getLastNotificationResponse.mockReturnValue(
        buildResponse({ type: 'test' }),
      )
      const service = await loadService()
      const onTap = vi.fn()

      service.subscribeToNotificationTaps(onTap)

      expect(onTap).not.toHaveBeenCalled()
    })

    it('dispatches a duplicated tap only once', async () => {
      const service = await loadService()
      const onTap = vi.fn()
      service.subscribeToNotificationTaps(onTap)
      const listener =
        notifications.addNotificationResponseReceivedListener.mock.calls[0][0]
      const response = buildResponse({
        reminderId: 'reminder-1',
        nextFireAt: FUTURE_DATE,
      })

      listener(response)
      listener(response)

      expect(onTap).toHaveBeenCalledTimes(1)
    })

    it('dispatches the listener tap after a different cold start tap', async () => {
      notifications.getLastNotificationResponse.mockReturnValue(
        buildResponse(
          { reminderId: 'reminder-1', nextFireAt: FUTURE_DATE },
          'id-1',
        ),
      )
      const service = await loadService()
      const onTap = vi.fn()
      service.subscribeToNotificationTaps(onTap)
      const listener =
        notifications.addNotificationResponseReceivedListener.mock.calls[0][0]

      listener(
        buildResponse(
          { reminderId: 'reminder-2', nextFireAt: FUTURE_DATE },
          'id-2',
        ),
      )

      expect(onTap).toHaveBeenCalledTimes(2)
    })
  })

  describe('getExpoPushToken', () => {
    it('returns the Expo push token on Android', async () => {
      const service = await loadService()

      const token = await service.getExpoPushToken()

      expect(token).toBe('ExponentPushToken[abc]')
      expect(notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'project-1',
      })
    })

    it('falls back to the easConfig project id', async () => {
      constants.expoConfig = null
      constants.easConfig = { projectId: 'project-2' }
      const service = await loadService()

      await service.getExpoPushToken()

      expect(notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
        projectId: 'project-2',
      })
    })

    it('returns null outside Android', async () => {
      platform.OS = 'ios'
      const service = await loadService()

      expect(await service.getExpoPushToken()).toBeNull()
      expect(notifications.getExpoPushTokenAsync).not.toHaveBeenCalled()
    })

    it('returns null without the permission granted', async () => {
      notifications.getPermissionsAsync.mockResolvedValue({
        granted: false,
        canAskAgain: true,
      })
      const service = await loadService()

      expect(await service.getExpoPushToken()).toBeNull()
      expect(notifications.getExpoPushTokenAsync).not.toHaveBeenCalled()
    })

    it('returns null without a project id', async () => {
      constants.expoConfig = null
      const service = await loadService()

      expect(await service.getExpoPushToken()).toBeNull()
      expect(notifications.getExpoPushTokenAsync).not.toHaveBeenCalled()
    })

    it('returns null when the library throws', async () => {
      notifications.getExpoPushTokenAsync.mockRejectedValue(new Error('fcm'))
      const service = await loadService()

      expect(await service.getExpoPushToken()).toBeNull()
    })
  })
})
