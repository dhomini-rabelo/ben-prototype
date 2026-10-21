import {
  USER_LANGUAGES,
  UserLanguage,
  UserProps,
} from '@ben/domain-user/enterprise/entities/user'

export const DEFAULT_MORNING_TIME = '08:00'
export const DEFAULT_DAILY_SUMMARY_ENABLED = true
export const DEFAULT_DAILY_SUMMARY_TIME = '08:00'

export type UserPreferences = Pick<UserProps, 'language' | 'showUsdCost'> & {
  morningTime: string
  dailySummaryEnabled: boolean
  dailySummaryTime: string
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value)
}

export function isUserLanguage(value: unknown): value is UserLanguage {
  return USER_LANGUAGES.some((language) => language === value)
}

export function resolveUserPreferences(
  props: Partial<UserProps>,
): UserPreferences {
  return {
    language: props.language ?? null,
    showUsdCost: props.showUsdCost ?? false,
    morningTime: props.morningTime ?? DEFAULT_MORNING_TIME,
    dailySummaryEnabled:
      props.dailySummaryEnabled ?? DEFAULT_DAILY_SUMMARY_ENABLED,
    dailySummaryTime: props.dailySummaryTime ?? DEFAULT_DAILY_SUMMARY_TIME,
  }
}
