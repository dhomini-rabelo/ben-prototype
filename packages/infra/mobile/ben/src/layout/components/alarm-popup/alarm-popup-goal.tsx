import { View } from 'react-native'
import type { Reminder } from '@/api/models/reminder'
import { formatClock } from '@/layout/components/alarm-popup/format-clock'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'

type AlarmPopupGoalProps = {
  reminder: Reminder
  firedAt: string
  busy: boolean
  onDone: () => void
  onSnooze: () => void
}

export function AlarmPopupGoal({
  reminder,
  firedAt,
  busy,
  onDone,
  onSnooze,
}: AlarmPopupGoalProps) {
  const strings = useStrings(alarmStrings)
  const language = useLanguage()

  return (
    <View className="gap-5 px-5 pt-2 pb-4">
      <View className="gap-2">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {strings.goalLabel}
        </Typography>
        <Typography variant="headline-lg" className="text-on-surface">
          {reminder.title}
        </Typography>
        <Typography variant="body-md" className="text-on-surface-variant">
          {strings.goalAt(formatClock(firedAt, language))}
        </Typography>
      </View>
      {reminder.messages.length > 0 ? (
        <View className="gap-2">
          <Typography variant="label-caps" className="text-on-surface-variant">
            {strings.goalMessages}
          </Typography>
          {reminder.messages.map((message, index) => (
            <View
              key={`${index}-${message}`}
              className="rounded-lg bg-surface-container px-4 py-3"
            >
              <Typography variant="body-md" className="text-on-surface">
                {message}
              </Typography>
            </View>
          ))}
        </View>
      ) : null}
      <View className="flex-row gap-3">
        <Button disabled={busy} onPress={onDone} className="flex-1">
          {strings.goalDone}
        </Button>
        <Button
          disabled={busy}
          onPress={onSnooze}
          className="flex-1 bg-surface-container active:bg-surface-container-high"
        >
          <Typography variant="button-text" className="text-on-surface">
            {strings.snooze}
          </Typography>
        </Button>
      </View>
    </View>
  )
}
