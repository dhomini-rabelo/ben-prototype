import { create } from 'zustand'
import type { Reminder } from '@/api/models/reminder'

export interface FiredAlarm {
  reminder: Reminder
  firedAt: string
}

interface AlarmStore {
  queue: FiredAlarm[]
  firedKeys: Set<string>
  current: FiredAlarm | null
  enqueue: (alarm: FiredAlarm) => boolean
  dismissCurrent: () => void
  reset: () => void
}

export function getFiredKey(alarm: FiredAlarm): string {
  return `${alarm.reminder.id}:${alarm.firedAt}`
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
      const queue = [...state.queue, alarm]
      return {
        queue,
        current: queue[0] ?? null,
        firedKeys: new Set(state.firedKeys).add(key),
      }
    })
    return true
  },
  dismissCurrent: () =>
    set((state) => {
      const queue = state.queue.slice(1)
      return { queue, current: queue[0] ?? null }
    }),
  reset: () => set({ queue: [], firedKeys: new Set<string>(), current: null }),
}))
