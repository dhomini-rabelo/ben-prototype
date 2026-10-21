import { View } from 'react-native'
import { Switch } from '@/layout/components/ui/switch'
import { TimeStepper } from '@/layout/components/ui/time-stepper'
import type { TimeValue } from '@/layout/components/ui/time-stepper'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { useUserPreferencesStore } from '@/layout/stores/user-preferences-store'
import { settingsStrings } from '@/layout/strings/settings-strings'
import { textError } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

type RemindersSettingsSectionProps = {
  hasError: boolean
  onChangeSummaryEnabled: (value: boolean) => void
  onChangeSummaryTime: (value: string) => void
  onChangeMorningTime: (value: string) => void
}

function parseTime(value: string): TimeValue {
  const [hour, minute] = value.split(':').map(Number)
  return { hour: hour || 0, minute: minute || 0 }
}

function formatTime({ hour, minute }: TimeValue): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function RemindersSettingsSection({
  hasError,
  onChangeSummaryEnabled,
  onChangeSummaryTime,
  onChangeMorningTime,
}: RemindersSettingsSectionProps) {
  const strings = useStrings(settingsStrings)
  const summaryEnabled = useUserPreferencesStore(
    (store) => store.dailySummaryEnabled,
  )
  const summaryTime = useUserPreferencesStore((store) => store.dailySummaryTime)
  const morningTime = useUserPreferencesStore((store) => store.morningTime)

  return (
    <View className="gap-4 border-t border-outline-variant/40 px-5 pt-4 pb-5">
      <Typography variant="label-caps" className="text-on-surface-variant">
        {strings.remindersTitle}
      </Typography>

      <View className="flex-row items-center justify-between">
        <Typography variant="button-text" className="text-on-surface">
          {strings.dailySummary}
        </Typography>
        <Switch
          value={summaryEnabled}
          onValueChange={onChangeSummaryEnabled}
          accessibilityLabel={strings.dailySummary}
        />
      </View>

      <View
        className={cn('gap-2', !summaryEnabled && 'opacity-50')}
        pointerEvents={summaryEnabled ? 'auto' : 'none'}
      >
        <Typography variant="button-text" className="text-on-surface">
          {strings.dailySummaryTime}
        </Typography>
        <TimeStepper
          value={parseTime(summaryTime)}
          onChange={(value) => onChangeSummaryTime(formatTime(value))}
        />
      </View>

      <View className="gap-2">
        <Typography variant="button-text" className="text-on-surface">
          {strings.morningTime}
        </Typography>
        <TimeStepper
          value={parseTime(morningTime)}
          onChange={(value) => onChangeMorningTime(formatTime(value))}
        />
        <Typography
          variant="label-caps"
          className="normal-case text-on-surface-variant"
        >
          {strings.morningTimeHint}
        </Typography>
      </View>

      {hasError ? (
        <Typography variant="button-text" style={{ color: textError }}>
          {strings.preferenceSaveFailed}
        </Typography>
      ) : null}
    </View>
  )
}
