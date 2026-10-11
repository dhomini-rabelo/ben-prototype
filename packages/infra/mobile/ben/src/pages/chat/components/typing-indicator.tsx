import { View } from 'react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { cn } from '@/layout/utils/styles'
import { BouncingDots } from '@/pages/chat/components/bouncing-dots'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type TypingIndicatorProps = {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  const strings = useStrings(chatStrings)
  return (
    <View
      accessibilityLabel={strings.typingLabel}
      className={cn(
        'flex-row items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-container-low px-4 py-3.5',
        className,
      )}
    >
      <BouncingDots size={6} />
    </View>
  )
}
