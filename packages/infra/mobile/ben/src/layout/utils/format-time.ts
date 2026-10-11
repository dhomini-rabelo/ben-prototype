import { LANGUAGE_LOCALES, type Language } from '@/core/languages'
import { formatTimeStrings } from '@/layout/strings/format-time-strings'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function relativeTime(iso: string, language: Language): string {
  const strings = formatTimeStrings[language]
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < MINUTE) {
    return strings.justNow
  }
  if (diff < HOUR) {
    return strings.minutesAgo(Math.floor(diff / MINUTE))
  }
  if (diff < DAY) {
    return strings.hoursAgo(Math.floor(diff / HOUR))
  }
  const days = Math.floor(diff / DAY)
  if (days === 1) {
    return strings.yesterday
  }
  if (days < 7) {
    return strings.daysAgo(days)
  }
  if (days < 14) {
    return strings.weeksAgo(1)
  }
  return strings.weeksAgo(Math.floor(days / 7))
}

export function absoluteDateTime(iso: string, language: Language): string {
  return new Date(iso).toLocaleString(LANGUAGE_LOCALES[language], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function firesAtRelative(
  iso: string | null,
  language: Language,
): string {
  const strings = formatTimeStrings[language]
  if (!iso) {
    return strings.noTimeSet
  }
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) {
    return relativeTime(iso, language)
  }
  if (diff < HOUR) {
    return strings.inMinutes(Math.max(1, Math.floor(diff / MINUTE)))
  }
  if (diff < DAY) {
    return strings.inHours(Math.floor(diff / HOUR))
  }
  return absoluteDateTime(iso, language)
}
