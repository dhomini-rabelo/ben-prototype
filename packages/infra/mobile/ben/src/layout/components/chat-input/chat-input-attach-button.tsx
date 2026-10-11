import { Plus } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatInputStrings } from '@/layout/strings/chat-input-strings'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useChatInputContext } from './contexts/chat-input'

type ChatInputAttachButtonProps = {
  onPress?: () => void
}

export function ChatInputAttachButton({ onPress }: ChatInputAttachButtonProps) {
  const strings = useStrings(chatInputStrings)
  const { disabled } = useChatInputContext()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={strings.attach}
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'size-10 shrink-0 items-center justify-center rounded-full',
        disabled && 'opacity-60',
      )}
    >
      <Plus size={20} color={onSurfaceVariant} />
    </Pressable>
  )
}
