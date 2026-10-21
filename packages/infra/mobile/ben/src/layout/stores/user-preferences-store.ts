import { create } from 'zustand'

interface UserPreferencesStore {
  showUsdCost: boolean
  setShowUsdCost: (showUsdCost: boolean) => void
  reset: () => void
}

export const useUserPreferencesStore = create<UserPreferencesStore>((set) => ({
  showUsdCost: false,
  setShowUsdCost: (showUsdCost) => set({ showUsdCost }),
  reset: () => set({ showUsdCost: false }),
}))
