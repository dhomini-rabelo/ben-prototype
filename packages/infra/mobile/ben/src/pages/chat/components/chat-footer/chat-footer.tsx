import { memo } from 'react'
import { ArrowUp, Microphone } from 'phosphor-react-native'
import { ChatInput } from '@/layout/components/chat-input'
import { RecordingBar } from '@/layout/components/recording-bar'
import { useStrings } from '@/layout/hooks/use-strings'
import { useCanRecord } from '@/layout/hooks/use-can-record'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { ink } from '@/layout/utils/colors'
import { useChatInput } from '@/pages/chat/hooks/use-chat-input'
import { useChatMessages } from '@/pages/chat/hooks/use-chat-messages'
import { ChatMenuButton } from '@/pages/chat/components/chat-menu-button/chat-menu-button'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type ChatFooterProps = {
  onOpenMenu: () => void
  onStartRecording?: () => void
}

function ChatFooterComponent({
  onOpenMenu,
  onStartRecording,
}: ChatFooterProps) {
  const strings = useStrings(chatStrings)
  const { historyState } = useChatMessages()
  const { draft, handleDraftChange, handleSend } = useChatInput()
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const canRecord = useCanRecord()

  const isDisabled = historyState.isLoading
  const hasText = draft.trim().length > 0

  if (voiceStatus === 'recording') {
    return <RecordingBar />
  }

  return (
    <ChatInput.Root
      draft={draft}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      disabled={isDisabled}
    >
      <ChatMenuButton onPress={onOpenMenu} />
      <ChatInput.Input />
      {hasText ? (
        <ChatInput.IconButton
          variant="primary"
          label={strings.send}
          onPress={handleSend}
          disabled={isDisabled}
        >
          <ArrowUp size={16} color={ink} />
        </ChatInput.IconButton>
      ) : (
        <ChatInput.IconButton
          variant="primary"
          label={strings.voiceInput}
          onPress={onStartRecording}
          disabled={!canRecord}
        >
          <Microphone size={16} weight="fill" color={ink} />
        </ChatInput.IconButton>
      )}
    </ChatInput.Root>
  )
}

export const ChatFooter = memo(ChatFooterComponent)
