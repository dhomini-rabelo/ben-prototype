import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import type { SnoozeOptionItem } from '@/api/models/reminder'
import { requestSnoozeOptions } from '@/api/requests/reminders'
import {
  formatClock,
  isTomorrow,
} from '@/layout/components/alarm-popup/format-clock'
import { Button } from '@/layout/components/ui/button'
import {
  TimeStepper,
  type TimeValue,
} from '@/layout/components/ui/time-stepper'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'

type AlarmPopupSnoozeProps = {
  reminderId: string
  busy: boolean
  onPick: (snoozeUntil: string) => void
  onBack: () => void
}

type OptionsState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; items: SnoozeOptionItem[] }

const FIVE_MINUTES = 5 * 60 * 1000

function defaultCustomTime(): TimeValue {
  const rounded = new Date(
    Math.ceil((Date.now() + 60 * 60 * 1000) / FIVE_MINUTES) * FIVE_MINUTES,
  )
  return { hour: rounded.getHours(), minute: rounded.getMinutes() }
}

function resolveCustomDate(time: TimeValue): Date {
  const target = new Date()
  target.setHours(time.hour, time.minute, 0, 0)
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1)
  }
  return target
}

export function AlarmPopupSnooze({
  reminderId,
  busy,
  onPick,
  onBack,
}: AlarmPopupSnoozeProps) {
  const strings = useStrings(alarmStrings)
  const language = useLanguage()
  const [options, setOptions] = useState<OptionsState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customTime, setCustomTime] = useState<TimeValue>(defaultCustomTime)

  useEffect(() => {
    let isActive = true
    setOptions({ status: 'loading' })
    requestSnoozeOptions(reminderId, new Date().toISOString())
      .then((items) => {
        if (isActive) {
          setOptions({ status: 'ready', items })
        }
      })
      .catch(() => {
        if (isActive) {
          setOptions({ status: 'failed' })
        }
      })
    return () => {
      isActive = false
    }
  }, [reminderId, attempt])

  const customDate = resolveCustomDate(customTime)
  const isCustomValid = customDate.getTime() > Date.now()

  function describe(iso: string): string {
    const clock = formatClock(iso, language)
    return isTomorrow(iso) ? strings.snoozeTomorrow(clock) : clock
  }

  return (
    <View className="gap-4 px-5 pt-2 pb-4">
      <Typography variant="label-caps" className="text-on-surface-variant">
        {strings.snoozeTitle}
      </Typography>

      {options.status === 'loading' ? (
        <Typography variant="body-md" className="text-on-surface-variant">
          {strings.snoozeLoading}
        </Typography>
      ) : null}
      {options.status === 'failed' ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setAttempt((value) => value + 1)}
        >
          <Typography variant="body-md" className="text-error">
            {strings.snoozeFailed}
          </Typography>
        </Pressable>
      ) : null}
      {options.status === 'ready'
        ? options.items.map((item) => (
            <Pressable
              key={item.option}
              accessibilityRole="button"
              disabled={busy}
              onPress={() => onPick(item.at)}
              className="min-h-11 flex-row items-center justify-between rounded-lg bg-surface-container px-4 py-3 active:bg-surface-container-high"
            >
              <Typography variant="button-text" className="text-on-surface">
                {strings.snoozeOptions[item.option]}
              </Typography>
              <Typography variant="body-md" className="text-on-surface-variant">
                {describe(item.at)}
              </Typography>
            </Pressable>
          ))
        : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => setIsCustomOpen((value) => !value)}
        className="min-h-11 justify-center rounded-lg border border-outline-variant px-4 py-3 active:bg-surface-container"
      >
        <Typography variant="button-text" className="text-on-surface">
          {strings.snoozeCustom}
        </Typography>
      </Pressable>

      {isCustomOpen ? (
        <View className="gap-4">
          <TimeStepper value={customTime} onChange={setCustomTime} />
          <Typography
            variant="body-md"
            className="text-center text-on-surface-variant"
          >
            {describe(customDate.toISOString())}
          </Typography>
          <Button
            disabled={busy || !isCustomValid}
            onPress={() => onPick(customDate.toISOString())}
          >
            {strings.snoozeConfirm}
          </Button>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onBack}
        className="min-h-11 items-center justify-center"
      >
        <Typography variant="button-text" className="text-on-surface-variant">
          {strings.snoozeBack}
        </Typography>
      </Pressable>
    </View>
  )
}
