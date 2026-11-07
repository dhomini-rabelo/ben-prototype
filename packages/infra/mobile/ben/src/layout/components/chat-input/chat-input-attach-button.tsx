import { Plus } from 'phosphor-react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatInputStrings } from '@/layout/strings/chat-input-strings'
import { ink } from '@/layout/utils/colors'
import { ChatInputIconButton } from './chat-input-icon-button'
import { useChatInputContext } from './contexts/chat-input'

type ChatInputAttachButtonProps = {
  onPress?: () => void
}

export function ChatInputAttachButton({ onPress }: ChatInputAttachButtonProps) {
  const strings = useStrings(chatInputStrings)
  const { disabled } = useChatInputContext()

  return (
    <ChatInputIconButton
      variant="subtle"
      label={strings.attach}
      onPress={onPress}
      disabled={disabled}
    >
      <Plus size={16} color={ink} />
    </ChatInputIconButton>
  )
}
