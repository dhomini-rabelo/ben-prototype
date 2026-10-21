import { useState } from 'react'
import { View } from 'react-native'
import type { CheckFrequency, Reminder } from '@/api/models/reminder'
import { Button } from '@/layout/components/ui/button'
import { SegmentedControl } from '@/layout/components/ui/segmented-control'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'

type FrequencyValue = 'daily' | 'every-2' | 'every-3' | 'weekly'

const FREQUENCIES: Record<FrequencyValue, CheckFrequency> = {
  daily: { type: 'daily' },
  'every-2': { type: 'every-n-days', days: 2 },
  'every-3': { type: 'every-n-days', days: 3 },
  weekly: { type: 'weekly' },
}

function toFrequencyValue(frequency: CheckFrequency | null): FrequencyValue {
  if (frequency?.type === 'weekly') {
    return 'weekly'
  }
  if (frequency?.type === 'every-n-days') {
    return frequency.days === 3 ? 'every-3' : 'every-2'
  }
  return 'daily'
}

type AlarmPopupConditionalProps = {
  reminder: Reminder
  busy: boolean
  onYes: () => void
  onNotYet: (frequency: CheckFrequency | null) => void
}

export function AlarmPopupConditional({
  reminder,
  busy,
  onYes,
  onNotYet,
}: AlarmPopupConditionalProps) {
  const strings = useStrings(alarmStrings)
  const initial = toFrequencyValue(reminder.checkFrequency)
  const [frequency, setFrequency] = useState<FrequencyValue>(initial)

  return (
    <View className="gap-5 px-5 pt-2 pb-4">
      <View className="gap-2">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {strings.conditionalLabel}
        </Typography>
        <Typography variant="headline-lg" className="text-on-surface">
          {strings.conditionalQuestion(reminder.title)}
        </Typography>
      </View>
      <View className="gap-2">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {strings.askMe}
        </Typography>
        <SegmentedControl
          value={frequency}
          disabled={busy}
          onChange={setFrequency}
          options={[
            { value: 'daily', label: strings.freqDaily },
            { value: 'every-2', label: strings.freqEvery2 },
            { value: 'every-3', label: strings.freqEvery3 },
            { value: 'weekly', label: strings.freqWeekly },
          ]}
        />
      </View>
      <View className="flex-row gap-3">
        <Button disabled={busy} onPress={onYes} className="flex-1">
          {strings.conditionalYes}
        </Button>
        <Button
          disabled={busy}
          onPress={() =>
            onNotYet(frequency === initial ? null : FREQUENCIES[frequency])
          }
          className="flex-1 bg-surface-container active:bg-surface-container-high"
        >
          <Typography variant="button-text" className="text-on-surface">
            {strings.conditionalNotYet}
          </Typography>
        </Button>
      </View>
    </View>
  )
}
