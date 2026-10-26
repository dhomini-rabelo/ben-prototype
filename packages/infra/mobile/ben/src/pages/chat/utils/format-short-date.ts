import { LANGUAGE_LOCALES, type Language } from '@/core/languages'

export function formatShortDate(date: Date, language: Language): string {
  const isCurrentYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(LANGUAGE_LOCALES[language], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  })
}
