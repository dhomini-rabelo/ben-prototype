import { Clock } from 'phosphor-react-native'
import { Text, View } from 'react-native'
import {
  formatClock,
  isTomorrow,
} from '@/layout/components/alarm-popup/format-clock'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import { brandDeep } from '@/layout/utils/colors'
import type { Language } from '@/core/languages'
import { formatShortDate } from '@/pages/chat/utils/format-short-date'
import { useCaptureCard } from './contexts/capture-card-context'

type CaptureCardMetaProps = { children: string }

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString()
}

function formatRemindAt(
  iso: string,
  language: Language,
  formatTomorrow: (time: string) => string,
) {
  if (Number.isNaN(new Date(iso).getTime())) {
    return iso
  }
  const clock = formatClock(iso, language)
  if (isTomorrow(iso)) {
    return formatTomorrow(clock)
  }
  if (isToday(iso)) {
    return clock
  }
  return `${formatShortDate(new Date(iso), language)}, ${clock}`
}

export function CaptureCardMeta({ children }: CaptureCardMetaProps) {
  const { kind, state } = useCaptureCard()
  const language = useLanguage()
  const strings = useStrings(alarmStrings)

  if (state === 'error' || kind !== 'reminder') {
    return null
  }

  return (
    <View className="mt-[3px] flex-row items-center gap-1 self-start rounded-full bg-brand-50 py-0.5 pl-1.5 pr-2">
      <Clock size={13} color={brandDeep} />
      <Text className="font-sans-semibold text-xs text-brand-deep">
        {formatRemindAt(children, language, strings.snoozeTomorrow)}
      </Text>
    </View>
  )
}
