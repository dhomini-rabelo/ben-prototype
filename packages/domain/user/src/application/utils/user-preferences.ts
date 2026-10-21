import {
  USER_LANGUAGES,
  UserLanguage,
  UserProps,
} from '@ben/domain-user/enterprise/entities/user'

export type UserPreferenceKey = 'language' | 'showUsdCost'

export type UserPreferences = Pick<UserProps, UserPreferenceKey>

export function isUserLanguage(value: unknown): value is UserLanguage {
  return USER_LANGUAGES.some((language) => language === value)
}

export function resolveUserPreferences(
  props: Partial<UserPreferences>,
): UserPreferences {
  return {
    language: props.language ?? null,
    showUsdCost: props.showUsdCost ?? false,
  }
}
