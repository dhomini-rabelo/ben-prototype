import { View } from 'react-native'
import type { Reminder } from '@/api/models/reminder'
import { formatClock } from '@/layout/components/alarm-popup/format-clock'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'

type AlarmPopupAlarmProps = {
  reminder: Reminder
  busy: boolean
  onAcknowledge: () => void
  onSnooze: () => void
  onComplete: () => void
}

export function AlarmPopupAlarm({
  reminder,
  busy,
  onAcknowledge,
  onSnooze,
  onComplete,
}: AlarmPopupAlarmProps) {
  const strings = useStrings(alarmStrings)
  const language = useLanguage()

  return (
    <View className="gap-5 px-5 pt-2 pb-4">
      <View className="gap-2">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {strings.alarmLabel}
        </Typography>
        <Typography variant="headline-lg" className="text-on-surface">
          {reminder.title}
        </Typography>
        {reminder.firesAt ? (
          <Typography variant="body-md" className="text-on-surface-variant">
            {strings.eventAt(formatClock(reminder.firesAt, language))}
          </Typography>
        ) : null}
      </View>
      <View className="gap-3">
        <Button disabled={busy} onPress={onAcknowledge}>
          {strings.ok}
        </Button>
        <View className="flex-row gap-3">
          <Button
            disabled={busy}
            onPress={onSnooze}
            className="flex-1 bg-surface-container active:bg-surface-container-high"
          >
            <Typography variant="button-text" className="text-on-surface">
              {strings.snooze}
            </Typography>
          </Button>
          <Button
            disabled={busy}
            onPress={onComplete}
            className="flex-1 bg-surface-container active:bg-surface-container-high"
          >
            <Typography variant="button-text" className="text-on-surface">
              {strings.complete}
            </Typography>
          </Button>
        </View>
      </View>
    </View>
  )
}
