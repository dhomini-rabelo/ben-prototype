import { Text } from 'react-native'
import { LANGUAGE_LOCALES } from '@/core/languages'
import type { Language } from '@/core/languages'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type DayDividerProps = {
  createdAt: string
  filedCount: number
}

type DayLabelStrings = {
  dayToday: string
  dayYesterday: string
}

function formatDayLabel(
  createdAt: string,
  language: Language,
  strings: DayLabelStrings,
) {
  const day = new Date(createdAt)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (day.toDateString() === today.toDateString()) return strings.dayToday
  if (day.toDateString() === yesterday.toDateString()) {
    return strings.dayYesterday
  }

  return day.toLocaleDateString(LANGUAGE_LOCALES[language], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function DayDivider({ createdAt, filedCount }: DayDividerProps) {
  const strings = useStrings(chatStrings)
  const language = useLanguage()
  const dayLabel = formatDayLabel(createdAt, language, strings)
  const label =
    filedCount > 0 ? `${dayLabel} · ${strings.dayFiled(filedCount)}` : dayLabel

  return (
    <Text className="mb-2.5 self-center text-[12px] font-semibold leading-4 text-on-surface-variant">
      {label}
    </Text>
  )
}
