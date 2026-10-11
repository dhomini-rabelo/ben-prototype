import { X } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatBannerStrings } from '@/layout/strings/chat-banner-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

type ChatBannerDismissProps = {
  onPress?: () => void
}

export function ChatBannerDismiss({ onPress }: ChatBannerDismissProps) {
  const strings = useStrings(chatBannerStrings)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.dismiss}
      onPress={onPress}
      className={cn('size-6 shrink-0 items-center justify-center rounded-full')}
    >
      <X size={14} color={onSurfaceVariant} />
    </Pressable>
  )
}
