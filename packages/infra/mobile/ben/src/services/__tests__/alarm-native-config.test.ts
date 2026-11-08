import { describe, expect, it, vi } from 'vitest'

import config from '../../../app.config'
import {
  type AlarmManifest,
  applyAlarmActivityAttributes,
} from '../../../plugins/with-alarm-activity'

const alarmSound = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  leaveLockScreen: vi.fn(),
}))

vi.mock('react-native', () => ({ Platform: { OS: 'android' } }))
vi.mock('react-native-notify-kit', () => ({
  default: { createChannel: vi.fn() },
  AndroidImportance: { HIGH: 4 },
  AndroidCategory: { ALARM: 'alarm' },
}))
vi.mock('../../../modules/alarm-sound', () => ({ AlarmSound: alarmSound }))

type PluginEntry = string | [string, Record<string, unknown>]

function findPlugin(name: string): PluginEntry | undefined {
  return (config.plugins as PluginEntry[]).find((entry) =>
    Array.isArray(entry) ? entry[0] === name : entry === name,
  )
}

describe('alarm native config', () => {
  it('declares the full-screen intent and boot permissions on Android only (T15)', () => {
    expect(config.android?.permissions).toEqual(
      expect.arrayContaining([
        'android.permission.USE_FULL_SCREEN_INTENT',
        'android.permission.RECEIVE_BOOT_COMPLETED',
      ]),
    )
    expect(config.ios).not.toHaveProperty('permissions')
    expect(findPlugin('react-native-notify-kit')).toBeDefined()
    expect(findPlugin('./plugins/with-alarm-activity')).toBeDefined()
  })

  it('puts showWhenLocked and turnScreenOn on MainActivity (T16)', () => {
    const manifest: AlarmManifest = {
      manifest: {
        application: [
          {
            activity: [
              { $: { 'android:name': '.OtherActivity' } },
              { $: { 'android:name': '.MainActivity' } },
            ],
          },
        ],
      },
    }

    const result = applyAlarmActivityAttributes(manifest)
    const [other, main] = result.manifest.application?.[0]?.activity ?? []

    expect(main?.$['android:showWhenLocked']).toBe('true')
    expect(main?.$['android:turnScreenOn']).toBe('true')
    expect(other?.$['android:showWhenLocked']).toBeUndefined()
  })

  it('exposes a high-importance alarm channel that bypasses DND with the bundled sound (T17)', async () => {
    const { ALARM_CATEGORY, ALARM_CHANNEL } =
      await import('@/services/alarm-service')
    const notifications = findPlugin('expo-notifications') as [
      string,
      { sounds: string[] },
    ]

    expect(ALARM_CHANNEL).toMatchObject({
      id: 'ben-alarme',
      importance: 4,
      sound: 'ben_alarm',
      bypassDnd: true,
    })
    expect(ALARM_CATEGORY).toBe('alarm')
    expect(notifications[1].sounds).toEqual(['./assets/sounds/ben_alarm.wav'])
  })

  it('registers the notify-kit plugin and the boot permission for rescheduling (T18)', () => {
    expect(findPlugin('react-native-notify-kit')).toBeDefined()
    expect(config.android?.permissions).toContain(
      'android.permission.RECEIVE_BOOT_COMPLETED',
    )
  })
})
