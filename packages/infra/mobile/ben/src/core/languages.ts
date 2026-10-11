export const LANGUAGES = ['en', 'pt-BR'] as const

export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'en'

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language === value)
}

export const LANGUAGE_LOCALES: Record<Language, string> = {
  en: 'en-US',
  'pt-BR': 'pt-BR',
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  'pt-BR': 'Português',
}

export type Localized<Value> = Record<Language, Value>
