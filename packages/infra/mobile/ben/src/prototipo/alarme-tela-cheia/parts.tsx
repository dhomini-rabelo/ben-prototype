import { Pressable, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { useStrings } from '@/layout/hooks/use-strings'
import { alarmStrings } from '@/layout/strings/alarm-strings'
import type { SnoozeChoice } from '@/prototipo/alarme-tela-cheia/data'
import { alarmProtoStrings } from '@/prototipo/alarme-tela-cheia/strings'

export function useChoiceLabel() {
  const strings = useStrings(alarmProtoStrings)
  const alarm = useStrings(alarmStrings)

  return {
    name: (choice: SnoozeChoice) => alarm.snoozeOptions[choice.option],
    when: (choice: SnoozeChoice) =>
      choice.isTomorrow ? strings.snoozeTomorrow(choice.clock) : choice.clock,
  }
}

type SnoozeChoiceListProps = {
  choices: SnoozeChoice[]
  onPick: () => void
}

export function SnoozeChoiceList({ choices, onPick }: SnoozeChoiceListProps) {
  const label = useChoiceLabel()

  return (
    <View className="gap-2">
      {choices.map((choice) => (
        <Pressable
          key={choice.option}
          accessibilityRole="button"
          onPress={onPick}
          className="min-h-11 flex-row items-center justify-between rounded-lg bg-surface-container px-4 py-3 active:bg-surface-container-high"
        >
          <Typography variant="button-text" className="text-on-surface">
            {label.name(choice)}
          </Typography>
          <Typography variant="body-md" className="text-on-surface-variant">
            {label.when(choice)}
          </Typography>
        </Pressable>
      ))}
    </View>
  )
}

const GLOW_LAYERS = [
  { size: 760, opacity: 0.05 },
  { size: 620, opacity: 0.07 },
  { size: 480, opacity: 0.09 },
  { size: 340, opacity: 0.12 },
  { size: 200, opacity: 0.16 },
]

type GlowProps = {
  top: number
}

export function Glow({ top }: GlowProps) {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-x-0 items-center"
      style={{ top }}
    >
      {GLOW_LAYERS.map((layer) => (
        <View
          key={layer.size}
          className="absolute rounded-full bg-primary"
          style={{
            width: layer.size,
            height: layer.size,
            opacity: layer.opacity,
            top: -layer.size / 2,
          }}
        />
      ))}
    </View>
  )
}
