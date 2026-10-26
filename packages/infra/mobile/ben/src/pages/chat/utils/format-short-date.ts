import { LANGUAGE_LOCALES, type Language } from '@/core/languages'

export function formatShortDate(date: Date, language: Language): string {
  return date.toLocaleDateString(LANGUAGE_LOCALES[language], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
