import { X } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

type ChatBannerDismissProps = {
  onPress?: () => void
}

export function ChatBannerDismiss({ onPress }: ChatBannerDismissProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dismiss"
      onPress={onPress}
      className={cn('size-6 shrink-0 items-center justify-center rounded-full')}
    >
      <X size={14} color={onSurfaceVariant} />
    </Pressable>
  )
}
