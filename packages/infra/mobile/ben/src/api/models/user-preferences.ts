import type { Language } from '@/core/languages'

export interface UserPreferences {
  language: Language | null
  showUsdCost: boolean
  morningTime: string
  dailySummaryEnabled: boolean
  dailySummaryTime: string
}
