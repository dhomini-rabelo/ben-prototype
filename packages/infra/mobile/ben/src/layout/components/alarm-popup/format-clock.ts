import { LANGUAGE_LOCALES, type Language } from '@/core/languages'

export function formatClock(iso: string, language: Language): string {
  return new Date(iso).toLocaleTimeString(LANGUAGE_LOCALES[language], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isTomorrow(iso: string): boolean {
  const target = new Date(iso)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return target.toDateString() === tomorrow.toDateString()
}
