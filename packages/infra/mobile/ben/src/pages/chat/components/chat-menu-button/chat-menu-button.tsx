import { List } from 'phosphor-react-native'
import { memo } from 'react'
import { ChatInput } from '@/layout/components/chat-input'
import { useStrings } from '@/layout/hooks/use-strings'
import { ink } from '@/layout/utils/colors'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type ChatMenuButtonProps = {
  onPress: () => void
}

function ChatMenuButtonComponent({ onPress }: ChatMenuButtonProps) {
  const strings = useStrings(chatStrings)

  return (
    <ChatInput.IconButton
      variant="subtle"
      label={strings.menu}
      onPress={onPress}
    >
      <List size={16} color={ink} />
    </ChatInput.IconButton>
  )
}

export const ChatMenuButton = memo(ChatMenuButtonComponent)
