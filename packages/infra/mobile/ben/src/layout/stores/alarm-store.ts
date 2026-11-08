import { create } from 'zustand'
import type { Reminder } from '@/api/models/reminder'
import {
  showMissedAlarmNotification,
  stopAlarmSound,
} from '@/services/alarm-service'

export interface FiredAlarm {
  reminderId: string
  title: string
  kind: Reminder['kind']
  firedAt: string
  reminder: Reminder | null
  sound: 'on' | 'off'
}

export type VisiblePopup = 'alarm' | 'popup' | 'summary' | null

export const ALARM_SOUND_LIMIT_MS = 600000

interface AlarmStore {
  queue: FiredAlarm[]
  firedKeys: Set<string>
  current: FiredAlarm | null
  enqueue: (alarm: FiredAlarm) => boolean
  attachReminders: (reminders: Reminder[]) => void
  expireCurrent: (now: number) => void
  markFired: (keys: Iterable<string>) => void
  dismissCurrent: () => void
  reset: () => void
}

export function getFiredKey(alarm: {
  reminderId: string
  firedAt: string
}): string {
  return `${alarm.reminderId}:${alarm.firedAt}`
}

export function getRemainingSoundMs(firedAt: string, now: number): number {
  return Math.max(0, new Date(firedAt).getTime() + ALARM_SOUND_LIMIT_MS - now)
}

export function selectVisiblePopup(
  current: FiredAlarm | null,
  summaryOpen: boolean,
): VisiblePopup {
  if (current !== null) {
    return current.kind === 'alarm' ? 'alarm' : 'popup'
  }
  return summaryOpen ? 'summary' : null
}

function insertByFiredAt(queue: FiredAlarm[], alarm: FiredAlarm): FiredAlarm[] {
  const time = new Date(alarm.firedAt).getTime()
  const index = queue.findIndex(
    (item) => new Date(item.firedAt).getTime() > time,
  )
  if (index === -1) {
    return [...queue, alarm]
  }
  return [...queue.slice(0, index), alarm, ...queue.slice(index)]
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  queue: [],
  firedKeys: new Set<string>(),
  current: null,
  enqueue: (alarm) => {
    const key = getFiredKey(alarm)
    if (get().firedKeys.has(key)) {
      return false
    }
    set((state) => {
      const queue = insertByFiredAt(state.queue, alarm)
      return {
        queue,
        current: queue[0] ?? null,
        firedKeys: new Set(state.firedKeys).add(key),
      }
    })
    return true
  },
  attachReminders: (reminders) =>
    set((state) => {
      const queue = state.queue.map((alarm) => {
        const reminder = reminders.find((item) => item.id === alarm.reminderId)
        return alarm.reminder === null && reminder
          ? { ...alarm, reminder }
          : alarm
      })
      return { queue, current: queue[0] ?? null }
    }),
  expireCurrent: (now) => {
    const current = get().current
    if (current === null || current.sound === 'off') {
      return
    }
    if (getRemainingSoundMs(current.firedAt, now) > 0) {
      return
    }
    void stopAlarmSound()
    void showMissedAlarmNotification(current)
    set((state) => {
      const queue = state.queue.map((alarm, index) =>
        index === 0 ? { ...alarm, sound: 'off' as const } : alarm,
      )
      return { queue, current: queue[0] ?? null }
    })
  },
  markFired: (keys) => {
    const fired = new Set(keys)
    const previous = get().current
    set((state) => {
      const queue = state.queue.filter(
        (alarm) => !fired.has(getFiredKey(alarm)),
      )
      return {
        queue,
        current: queue[0] ?? null,
        firedKeys: new Set([...state.firedKeys, ...fired]),
      }
    })
    if (previous !== null && get().current !== previous) {
      void stopAlarmSound()
    }
  },
  dismissCurrent: () =>
    set((state) => {
      const queue = state.queue.slice(1)
      return { queue, current: queue[0] ?? null }
    }),
  reset: () => set({ queue: [], firedKeys: new Set<string>(), current: null }),
}))
