import { Plus } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { onSurfaceVariant } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useChatInputContext } from './contexts/chat-input'

type ChatInputAttachButtonProps = {
  onPress?: () => void
}

export function ChatInputAttachButton({ onPress }: ChatInputAttachButtonProps) {
  const { disabled } = useChatInputContext()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Attach"
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
