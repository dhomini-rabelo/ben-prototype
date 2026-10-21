import { Minus, Plus } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import { onSurface } from '@/layout/utils/colors'

export type TimeValue = { hour: number; minute: number }

type TimeStepperProps = {
  value: TimeValue
  onChange: (value: TimeValue) => void
  minuteStep?: number
}

const MINUTES_PER_DAY = 24 * 60

function shift(value: TimeValue, deltaMinutes: number): TimeValue {
  const total = value.hour * 60 + value.minute + deltaMinutes
  const wrapped =
    ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

type StepButtonProps = {
  label: string
  direction: 'up' | 'down'
  onPress: () => void
}

function StepButton({ label, direction, onPress }: StepButtonProps) {
  const Icon = direction === 'up' ? Plus : Minus
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="size-11 items-center justify-center rounded-full bg-surface-container active:bg-surface-container-high"
    >
      <Icon size={18} color={onSurface} />
    </Pressable>
  )
}

export function TimeStepper({
  value,
  onChange,
  minuteStep = 5,
}: TimeStepperProps) {
  const strings = useStrings(alarmStrings)

  return (
    <View className="flex-row items-center justify-center gap-6">
      <View className="items-center gap-2">
        <StepButton
          label={`${strings.hourLabel} ${strings.increase}`}
          direction="up"
          onPress={() => onChange(shift(value, 60))}
        />
        <Typography variant="headline-lg" className="text-on-surface">
          {pad(value.hour)}
        </Typography>
        <StepButton
          label={`${strings.hourLabel} ${strings.decrease}`}
          direction="down"
          onPress={() => onChange(shift(value, -60))}
        />
      </View>
      <Typography variant="headline-lg" className="text-on-surface-variant">
        :
      </Typography>
      <View className="items-center gap-2">
        <StepButton
          label={`${strings.minuteLabel} ${strings.increase}`}
          direction="up"
          onPress={() => onChange(shift(value, minuteStep))}
        />
        <Typography variant="headline-lg" className="text-on-surface">
          {pad(value.minute)}
        </Typography>
        <StepButton
          label={`${strings.minuteLabel} ${strings.decrease}`}
          direction="down"
          onPress={() => onChange(shift(value, -minuteStep))}
        />
      </View>
    </View>
  )
}
