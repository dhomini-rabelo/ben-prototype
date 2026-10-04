import { View } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { BouncingDots } from '@/pages/chat/components/bouncing-dots'

type TypingIndicatorProps = {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <View
      accessibilityLabel="Ben is typing"
      className={cn(
        'flex-row items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-container-low px-4 py-3.5',
        className,
      )}
    >
      <BouncingDots size={6} />
    </View>
  )
}
