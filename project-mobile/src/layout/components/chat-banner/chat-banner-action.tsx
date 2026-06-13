import { Pressable, Text } from 'react-native'
import { cn } from '@/layout/utils/styles'
import { useChatBannerTone } from './contexts/tone'

type ChatBannerActionProps = {
  label: string
  onPress?: () => void
}

export function ChatBannerAction({ label, onPress }: ChatBannerActionProps) {
  const tone = useChatBannerTone()

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="shrink-0"
    >
      <Text
        className={cn(
          'text-button font-semibold active:underline',
          tone === 'error' ? 'text-text-error' : 'text-primary',
        )}
      >
        {label}
      </Text>
    </Pressable>
  )
}
