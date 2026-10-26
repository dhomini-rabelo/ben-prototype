import { ArrowUp, Microphone } from 'phosphor-react-native'
import { useCanRecord } from '@/layout/hooks/use-can-record'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'
import { useStrings } from '@/layout/hooks/use-strings'
import { chatInputStrings } from '@/layout/strings/chat-input-strings'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { ink } from '@/layout/utils/colors'
import { useChatInputContext } from './contexts/chat-input'
import { ChatInputActionFrame } from './chat-input-action-frame'

export function ChatInputActionButton() {
  const startRecording = useVoiceStore((store) => store.startRecording)
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const isOffline = useConnectivityStore((store) => store.isOffline)

  const strings = useStrings(chatInputStrings)
  const canRecord = useCanRecord()

  const { draft, onSend, disabled } = useChatInputContext()

  const isTranscribing = voiceStatus === 'transcribing'
  const isSendingDisabled = !disabled && (isOffline || isTranscribing)
  const hasText = draft.length > 0

  if (hasText) {
    return (
      <ChatInputActionFrame
        label={strings.send}
        onPress={onSend}
        disabled={disabled || isSendingDisabled}
      >
        <ArrowUp size={24} color={ink} />
      </ChatInputActionFrame>
    )
  }

  return (
    <ChatInputActionFrame
      label={strings.voiceInput}
      onPress={startRecording}
      disabled={disabled || !canRecord}
    >
      <Microphone size={26} weight="fill" color={ink} />
    </ChatInputActionFrame>
  )
}
