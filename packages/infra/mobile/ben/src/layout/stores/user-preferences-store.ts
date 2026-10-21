import { create } from 'zustand'

const DEFAULTS = {
  showUsdCost: false,
  morningTime: '08:00',
  dailySummaryEnabled: true,
  dailySummaryTime: '08:00',
  hasSyncedFromServer: false,
}

interface UserPreferencesStore {
  showUsdCost: boolean
  morningTime: string
  dailySummaryEnabled: boolean
  dailySummaryTime: string
  hasSyncedFromServer: boolean
  markSyncedFromServer: () => void
  setShowUsdCost: (showUsdCost: boolean) => void
  setMorningTime: (morningTime: string) => void
  setDailySummaryEnabled: (dailySummaryEnabled: boolean) => void
  setDailySummaryTime: (dailySummaryTime: string) => void
  reset: () => void
}

export const useUserPreferencesStore = create<UserPreferencesStore>((set) => ({
  ...DEFAULTS,
  markSyncedFromServer: () => set({ hasSyncedFromServer: true }),
  setShowUsdCost: (showUsdCost) => set({ showUsdCost }),
  setMorningTime: (morningTime) => set({ morningTime }),
  setDailySummaryEnabled: (dailySummaryEnabled) => set({ dailySummaryEnabled }),
  setDailySummaryTime: (dailySummaryTime) => set({ dailySummaryTime }),
  reset: () => set(DEFAULTS),
}))
