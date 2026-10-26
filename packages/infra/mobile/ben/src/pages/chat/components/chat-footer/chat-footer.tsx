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
import { chatStrings } from '@/pages/chat/strings/chat-strings'

type ChatFooterProps = {
  onStartRecording?: () => void
}

function ChatFooterComponent({ onStartRecording }: ChatFooterProps) {
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
      <ChatInput.Input />
      {hasText ? (
        <ChatInput.ActionFrame
          label={strings.send}
          onPress={isDisabled ? undefined : handleSend}
        >
          <ArrowUp size={24} color={ink} />
        </ChatInput.ActionFrame>
      ) : (
        <ChatInput.ActionFrame
          label={strings.voiceInput}
          onPress={canRecord ? onStartRecording : undefined}
          disabled={!canRecord}
        >
          <Microphone size={26} weight="fill" color={ink} />
        </ChatInput.ActionFrame>
      )}
    </ChatInput.Root>
  )
}

export const ChatFooter = memo(ChatFooterComponent)
