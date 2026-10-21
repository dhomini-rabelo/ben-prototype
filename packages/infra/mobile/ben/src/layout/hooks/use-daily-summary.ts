import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import type { DailySummary } from '@/api/models/reminder'
import { requestDailySummary } from '@/api/requests/reminders'
import { useStrings } from '@/layout/hooks/use-strings'
import { useAuthStore } from '@/layout/stores/auth-store'
import { useUserPreferencesStore } from '@/layout/stores/user-preferences-store'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import {
  cancelDailySummaryNotification,
  scheduleDailySummaryNotification,
} from '@/services/notifications-service'
import {
  markDailySummaryShown,
  wasDailySummaryShown,
} from '@/storage/daily-summary-storage'

const CHECK_INTERVAL_MS = 15 * 1000

interface DailySummaryStore {
  summary: DailySummary | null
  show: (summary: DailySummary) => void
  dismiss: () => void
}

export const useDailySummaryStore = create<DailySummaryStore>((set) => ({
  summary: null,
  show: (summary) => set({ summary }),
  dismiss: () => set({ summary: null }),
}))

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function localDate(now: Date): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function localTime(now: Date): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function useDailySummary() {
  const userId = useAuthStore((store) => store.user?.id)
  const enabled = useUserPreferencesStore((store) => store.dailySummaryEnabled)
  const time = useUserPreferencesStore((store) => store.dailySummaryTime)
  const hasSynced = useUserPreferencesStore(
    (store) => store.hasSyncedFromServer,
  )
  const strings = useStrings(alarmStrings)
  const isChecking = useRef(false)

  useEffect(() => {
    if (!userId || !hasSynced || !enabled) {
      return
    }

    async function check() {
      if (isChecking.current) {
        return
      }
      const now = new Date()
      if (localTime(now) < time) {
        return
      }
      const date = localDate(now)
      isChecking.current = true
      try {
        if (await wasDailySummaryShown(date)) {
          return
        }
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const summary = await requestDailySummary(date, timeZone)
        const latest = useUserPreferencesStore.getState()
        if (
          !latest.dailySummaryEnabled ||
          localTime(new Date()) < latest.dailySummaryTime
        ) {
          return
        }
        await markDailySummaryShown(date)
        useDailySummaryStore.getState().show(summary)
      } catch {
        // retried on the next tick
      } finally {
        isChecking.current = false
      }
    }

    void check()
    const interval = setInterval(() => void check(), CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [userId, hasSynced, enabled, time])

  const { summaryNotificationTitle, summaryNotificationBody } = strings

  useEffect(() => {
    if (!userId || !hasSynced) {
      return
    }
    if (enabled) {
      void scheduleDailySummaryNotification(
        time,
        summaryNotificationTitle,
        summaryNotificationBody,
      ).catch(() => {})
    } else {
      void cancelDailySummaryNotification().catch(() => {})
    }
  }, [
    userId,
    hasSynced,
    enabled,
    time,
    summaryNotificationTitle,
    summaryNotificationBody,
  ])

  useEffect(() => {
    if (!userId) {
      useDailySummaryStore.getState().dismiss()
    }
  }, [userId])
}
