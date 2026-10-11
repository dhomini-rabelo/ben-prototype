import { memo } from 'react'
import { Mic, Send } from 'lucide-react-native'
import { View } from 'react-native'
import { ChatInput } from '@/layout/components/chat-input'
import { RecordingBar } from '@/layout/components/recording-bar'
import { IconButton } from '@/layout/components/ui/icon-button'
import { useStrings } from '@/layout/hooks/use-strings'
import { useCanRecord } from '@/layout/hooks/use-can-record'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { onPrimary } from '@/layout/utils/colors'
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
      <View className="flex-row items-center">
        {hasText ? (
          <IconButton
            label={strings.send}
            onPress={isDisabled ? undefined : handleSend}
            className="ml-2 bg-primary"
          >
            <Send size={20} color={onPrimary} />
          </IconButton>
        ) : (
          <IconButton
            label={strings.voiceInput}
            onPress={canRecord ? onStartRecording : undefined}
            className={`ml-2 bg-primary ${canRecord ? '' : 'opacity-60'}`}
          >
            <Mic size={20} color={onPrimary} />
          </IconButton>
        )}
      </View>
    </ChatInput.Root>
  )
}

export const ChatFooter = memo(ChatFooterComponent)
