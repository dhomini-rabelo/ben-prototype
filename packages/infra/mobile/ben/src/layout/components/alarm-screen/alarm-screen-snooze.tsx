import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import type { SnoozeOptionItem } from '@/api/models/reminder'
import { requestSnoozeOptions } from '@/api/requests/reminders'
import {
  formatClock,
  isTomorrow,
} from '@/layout/components/alarm-popup/format-clock'
import { DurationSlider } from '@/layout/components/alarm-screen/duration-slider'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'

const DEFAULT_CUSTOM_MINUTES = 15
const MINUTES_PER_HOUR = 60
const MS_PER_MINUTE = 60 * 1000

type OptionsState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; items: SnoozeOptionItem[] }

type AlarmScreenSnoozeProps = {
  reminderId: string
  onPick: (snoozeUntil: Date) => void
  onBack: () => void
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const rest = minutes % MINUTES_PER_HOUR
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export function AlarmScreenSnooze({
  reminderId,
  onPick,
  onBack,
}: AlarmScreenSnoozeProps) {
  const strings = useStrings(alarmStrings)
  const language = useLanguage()
  const [minutes, setMinutes] = useState(DEFAULT_CUSTOM_MINUTES)
  const [options, setOptions] = useState<OptionsState>({ status: 'loading' })
  const duration = formatDuration(minutes)
  const customDate = new Date(Date.now() + minutes * MS_PER_MINUTE)

  useEffect(() => {
    let isActive = true
    requestSnoozeOptions(reminderId, new Date().toISOString())
      .then((items) => {
        if (isActive) setOptions({ status: 'ready', items })
      })
      .catch(() => {
        if (isActive) setOptions({ status: 'failed' })
      })
    return () => {
      isActive = false
    }
  }, [reminderId])

  function describe(iso: string): string {
    const clock = formatClock(iso, language)
    return isTomorrow(iso) ? strings.snoozeTomorrow(clock) : clock
  }

  return (
    <View className="flex-1 bg-background px-5 pt-14 pb-6">
      <View className="gap-5">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {strings.snoozeTitle}
        </Typography>

        <View className="gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
          <Typography variant="label-caps" className="text-on-surface-variant">
            {strings.customTitle}
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
              {strings.ringsAt(formatClock(customDate.toISOString(), language))}
            </Typography>
          </View>
          <DurationSlider
            value={minutes}
            label={strings.sliderLabel}
            onChange={setMinutes}
          />
          <View className="-mt-1 flex-row justify-between">
            <Typography variant="body-md" className="text-on-surface-variant">
              {strings.sliderMin}
            </Typography>
            <Typography variant="body-md" className="text-on-surface-variant">
              {strings.sliderMax}
            </Typography>
          </View>
          <Button
            onPress={() =>
              onPick(new Date(Date.now() + minutes * MS_PER_MINUTE))
            }
          >
            {strings.snoozeFor(duration)}
          </Button>
        </View>

        {options.status === 'ready' ? (
          <View className="gap-2">
            <Typography
              variant="label-caps"
              className="text-on-surface-variant"
            >
              {strings.orPick}
            </Typography>
            {options.items.map((item) => (
              <Pressable
                key={item.option}
                accessibilityRole="button"
                onPress={() => onPick(new Date(item.at))}
                className="min-h-11 flex-row items-center justify-between rounded-lg bg-surface-container px-4 py-3 active:bg-surface-container-high"
              >
                <Typography variant="button-text" className="text-on-surface">
                  {strings.snoozeOptions[item.option]}
                </Typography>
                <Typography
                  variant="body-md"
                  className="text-on-surface-variant"
                >
                  {describe(item.at)}
                </Typography>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          className="min-h-11 items-center justify-center"
        >
          <Typography variant="button-text" className="text-on-surface-variant">
            {strings.snoozeBack}
          </Typography>
        </Pressable>
      </View>
    </View>
  )
}
