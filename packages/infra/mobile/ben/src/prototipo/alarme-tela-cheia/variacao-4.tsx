import { Moon } from 'phosphor-react-native'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { NOW_CLOCK } from '@/prototipo/alarme-tela-cheia/data'
import { DurationSlider } from '@/prototipo/alarme-tela-cheia/duration-slider'
import { Glow, SnoozeChoiceList } from '@/prototipo/alarme-tela-cheia/parts'
import { alarmProtoStrings } from '@/prototipo/alarme-tela-cheia/strings'
import { alarmV4Strings } from '@/prototipo/alarme-tela-cheia/strings-v4'
import type {
  AlarmScreenProps,
  AlarmVariation,
  SnoozeScreenProps,
} from '@/prototipo/alarme-tela-cheia/variation-types'
import { VARIATION_1 } from '@/prototipo/alarme-tela-cheia/variacao-1'

const DEFAULT_CUSTOM_MINUTES = 15
const MINUTES_PER_HOUR = 60

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const rest = minutes % MINUTES_PER_HOUR
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

function formatClockAfter(minutes: number) {
  const [hours, mins] = NOW_CLOCK.split(':').map(Number)
  const total = hours * MINUTES_PER_HOUR + mins + minutes
  const hh = String(Math.floor(total / MINUTES_PER_HOUR)).padStart(2, '0')
  const mm = String(total % MINUTES_PER_HOUR).padStart(2, '0')
  return `${hh}:${mm}`
}

function AlarmScreen({
  alarm,
  queueIndex,
  queueTotal,
  onStop,
  onSnooze,
  onComplete,
}: AlarmScreenProps) {
  const strings = useStrings(alarmProtoStrings)

  return (
    <View className="flex-1 overflow-hidden bg-tertiary px-6 pt-14 pb-10">
      <Glow top={180} />
      <View className="items-center gap-1">
        <Typography variant="body-md" className="text-white/80">
          {strings.dateLabel}
        </Typography>
        <Typography
          variant="wordmark"
          className="text-[112px] leading-[120px] tracking-tighter text-white"
        >
          {NOW_CLOCK}
        </Typography>
        {queueTotal > 1 ? (
          <Typography variant="label-caps" className="text-white/60">
            {strings.alarmLabel} · {strings.queueLabel(queueIndex, queueTotal)}
          </Typography>
        ) : null}
      </View>

      <View className="flex-1 items-center justify-center gap-8">
        <View className="max-w-[330px] rounded-[32px] bg-surface-container-lowest px-7 py-6 shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
          <Typography
            variant="headline-lg"
            className="text-center text-[28px] leading-[34px] text-on-surface"
          >
            {alarm.title}
          </Typography>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onSnooze}
          className="flex-row items-center gap-2 rounded-full bg-inverse-surface px-7 py-4 active:bg-on-surface"
        >
          <Moon size={20} weight="fill" color="#ffffff" />
          <Typography variant="button-text" className="text-lg text-white">
            {strings.snooze}
          </Typography>
        </Pressable>
      </View>

      <View className="gap-4">
        <Button onPress={onStop} className="h-16 rounded-full">
          <Typography variant="button-text" className="text-xl text-on-primary">
            {strings.stop}
          </Typography>
        </Button>
        <Pressable
          accessibilityRole="button"
          onPress={onComplete}
          className="min-h-11 items-center justify-center"
        >
          <Typography
            variant="button-text"
            className="text-base text-white/80 underline"
          >
            {strings.complete}
          </Typography>
        </Pressable>
      </View>
    </View>
  )
}

function SnoozeScreen({ choices, onPick, onBack }: SnoozeScreenProps) {
  const strings = useStrings(alarmProtoStrings)
  const v4Strings = useStrings(alarmV4Strings)
  const [minutes, setMinutes] = useState(DEFAULT_CUSTOM_MINUTES)
  const duration = formatDuration(minutes)

  return (
    <View className="flex-1 bg-background px-5 pt-14 pb-6">
      <View className="gap-5">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {strings.snoozeTitle}
        </Typography>

        <View className="gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
          <Typography variant="label-caps" className="text-on-surface-variant">
            {v4Strings.customTitle}
          </Typography>
          <View>
            <Typography
              variant="wordmark"
              className="text-[44px] leading-[48px] text-on-surface"
              numberOfLines={1}
            >
              {duration}
            </Typography>
            <Typography variant="body-md" className="text-on-surface-variant">
              {v4Strings.ringsAt(formatClockAfter(minutes))}
            </Typography>
          </View>
          <DurationSlider
            value={minutes}
            label={v4Strings.sliderLabel}
            onChange={setMinutes}
          />
          <View className="-mt-1 flex-row justify-between">
            <Typography variant="body-md" className="text-on-surface-variant">
              {v4Strings.minLabel}
            </Typography>
            <Typography variant="body-md" className="text-on-surface-variant">
              {v4Strings.maxLabel}
            </Typography>
          </View>
          <Button onPress={onPick}>{v4Strings.confirm(duration)}</Button>
        </View>

        <View className="gap-2">
          <Typography variant="label-caps" className="text-on-surface-variant">
            {v4Strings.orPick}
          </Typography>
          <SnoozeChoiceList choices={choices} onPick={onPick} />
        </View>
      </View>

      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          className="min-h-11 items-center justify-center"
        >
          <Typography variant="button-text" className="text-on-surface-variant">
            {strings.back}
          </Typography>
        </Pressable>
      </View>
    </View>
  )
}

export const VARIATION_4: AlarmVariation = {
  settingsRowVariant: VARIATION_1.settingsRowVariant,
  AlarmScreen,
  SnoozeScreen,
  PermissionScreen: VARIATION_1.PermissionScreen,
}
