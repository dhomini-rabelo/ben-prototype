import { Serialize } from '@ben/domain-base'
import { UserPreferences } from '@ben/domain-user/application/utils/user-preferences'

export class UserPreferencesPresenter {
  static toHttp(preferences: UserPreferences): Serialize<UserPreferences> {
    return {
      language: preferences.language,
      showUsdCost: preferences.showUsdCost,
      morningTime: preferences.morningTime,
      dailySummaryEnabled: preferences.dailySummaryEnabled,
      dailySummaryTime: preferences.dailySummaryTime,
    }
  }
}
