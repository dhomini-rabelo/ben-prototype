import { Text, View } from 'react-native'
import { useCaptureCard } from './contexts/capture-card-context'

type CaptureCardKindPillProps = { children: string }

export function CaptureCardKindPill({ children }: CaptureCardKindPillProps) {
  const { kind, state } = useCaptureCard()

  if (state === 'error' || kind !== 'reminder') {
    return null
  }

  return (
    <View className="mt-[3px] self-start rounded-full bg-surface-container-high px-2 py-0.5">
      <Text className="font-mono text-[11px] text-on-surface-variant">
        {children}
      </Text>
    </View>
  )
}
