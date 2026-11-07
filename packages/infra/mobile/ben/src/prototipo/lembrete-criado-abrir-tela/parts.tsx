import { Clock } from 'phosphor-react-native'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  formatClock,
  isTomorrow,
} from '@/layout/components/alarm-popup/format-clock'
import { ReminderKindBadge } from '@/layout/components/menu-reminders/reminder-kind-badge'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import { menuDetailStrings } from '@/layout/strings/menu-detail-strings'
import { menuStrings } from '@/layout/strings/menu-strings'
import { brandDeep } from '@/layout/utils/colors'
import { absoluteDateTime, firesAtRelative } from '@/layout/utils/format-time'
import { cn } from '@/layout/utils/styles'
import { formatShortDate } from '@/pages/chat/utils/format-short-date'
import type { DemoReminder } from './shared'

export function TappableCard({
  children,
  pressed = false,
}: {
  children: ReactNode
  pressed?: boolean
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn('self-start active:opacity-60', pressed && 'opacity-60')}
    >
      {children}
    </Pressable>
  )
}

function useCardTime(iso: string) {
  const language = useLanguage()
  const strings = useStrings(alarmStrings)
  const clock = formatClock(iso, language)
  if (isTomorrow(iso)) {
    return strings.snoozeTomorrow(clock)
  }
  if (new Date(iso).toDateString() === new Date().toDateString()) {
    return clock
  }
  return `${formatShortDate(new Date(iso), language)}, ${clock}`
}

export function CardTimePill({
  iso,
  suffix,
}: {
  iso: string
  suffix?: string
}) {
  const time = useCardTime(iso)

  return (
    <View className="mt-[3px] flex-row items-center gap-1 self-start rounded-full bg-brand-50 py-0.5 pl-1.5 pr-2">
      <Clock size={13} color={brandDeep} />
      <Text className="font-sans-semibold text-xs text-brand-deep">
        {suffix ? `${time} · ${suffix}` : time}
      </Text>
    </View>
  )
}

export function KindPill({ label }: { label: string }) {
  return (
    <View className="mt-[3px] self-start rounded-full bg-surface-container-high px-2 py-0.5">
      <Text className="font-mono text-[11px] text-on-surface-variant">
        {label}
      </Text>
    </View>
  )
}

export function useConditionalLabel() {
  return useStrings(menuStrings).reminderKinds.conditional
}

type DetailMetaProps = {
  reminder: DemoReminder
  timeSuffix?: string
  inlineTrail?: ReactNode
  below?: ReactNode
}

export function DetailMeta({
  reminder,
  timeSuffix,
  inlineTrail,
  below,
}: DetailMetaProps) {
  const language = useLanguage()
  const strings = useStrings(menuDetailStrings)
  const relative = firesAtRelative(reminder.iso, language)
  const isDone = reminder.status === 'done'

  return (
    <View className="gap-1 rounded-xl bg-surface-container-low px-3.5 py-3">
      <View className="flex-row flex-wrap items-center gap-2">
        <Typography
          variant="body-md"
          className={cn(
            'font-sans-semibold',
            isDone ? 'text-on-surface-variant' : 'text-on-surface',
          )}
        >
          {timeSuffix ? `${relative} · ${timeSuffix}` : relative}
        </Typography>
        <View
          className={cn(
            'rounded-full px-1.5 py-px',
            isDone ? 'bg-surface-container-high' : 'bg-primary/10',
          )}
        >
          <Typography
            variant="label-caps"
            className={cn(
              'font-mono',
              isDone ? 'text-on-surface-variant/70' : 'text-on-surface',
            )}
          >
            {isDone ? strings.statusDone : strings.statusActive}
          </Typography>
        </View>
        <ReminderKindBadge kind={reminder.kind} />
        {inlineTrail}
      </View>
      {reminder.iso && (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {absoluteDateTime(reminder.iso, language)}
        </Typography>
      )}
      {below}
      {!isDone && reminder.iso && (
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {strings.nextAlert(absoluteDateTime(reminder.iso, language))}
        </Typography>
      )}
    </View>
  )
}
