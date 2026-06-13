import { Mic, Send } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useCanRecord } from '@/layout/hooks/use-can-record'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { onPrimary } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'
import { useChatInputContext } from './contexts/chat-input'

export function ChatInputActionButton() {
  const startRecording = useVoiceStore((store) => store.startRecording)
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const isOffline = useConnectivityStore((store) => store.isOffline)

  const canRecord = useCanRecord()

  const { draft, onSend, disabled } = useChatInputContext()

  const isTranscribing = voiceStatus === 'transcribing'
  const isSendingDisabled = !disabled && (isOffline || isTranscribing)
  const hasText = draft.length > 0

  const baseClassName =
    'ml-2 size-10 shrink-0 items-center justify-center rounded-full bg-primary'

  if (hasText) {
    const sendDisabled = disabled || isSendingDisabled
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        onPress={onSend}
        disabled={sendDisabled}
        className={cn(baseClassName, sendDisabled && 'opacity-60')}
      >
        <Send size={20} strokeWidth={2} color={onPrimary} />
      </Pressable>
    )
  }

  const recordDisabled = disabled || !canRecord
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voice input"
      onPress={startRecording}
      disabled={recordDisabled}
      className={cn(baseClassName, recordDisabled && 'opacity-60')}
    >
      <Mic size={20} color={onPrimary} />
    </Pressable>
  )
}
