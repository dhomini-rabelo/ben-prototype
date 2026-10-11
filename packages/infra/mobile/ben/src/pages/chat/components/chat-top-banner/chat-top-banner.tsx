import { AlertCircle, TriangleAlert, WifiOff } from 'lucide-react-native'
import { memo } from 'react'
import { View } from 'react-native'
import { useStrings } from '@/layout/hooks/use-strings'
import { ChatBanner } from '@/layout/components/chat-banner'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

function ChatTopBannerComponent() {
  const strings = useStrings(chatStrings)
  const retryVoice = useVoiceStore((store) => store.retryVoice)
  const dismissError = useVoiceStore((store) => store.dismissError)
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const micPermission = useVoiceStore((store) => store.micPermission)
  const isOffline = useConnectivityStore((store) => store.isOffline)

  const isVoiceError = voiceStatus === 'error'
  const isMicDenied = micPermission === 'denied'

  if (!isOffline && !isVoiceError && !isMicDenied) {
    return null
  }

  return (
    <View className="px-4 pb-2">
      {isOffline ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={WifiOff} />
          <ChatBanner.Text>{strings.offlineBanner}</ChatBanner.Text>
        </ChatBanner.Root>
      ) : isVoiceError ? (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>{strings.voiceErrorBanner}</ChatBanner.Text>
          <ChatBanner.Action label={strings.retry} onPress={retryVoice} />
          <ChatBanner.Dismiss onPress={dismissError} />
        </ChatBanner.Root>
      ) : isMicDenied ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={TriangleAlert} />
          <ChatBanner.Text>{strings.micDeniedBanner}</ChatBanner.Text>
          <ChatBanner.Dismiss />
        </ChatBanner.Root>
      ) : null}
    </View>
  )
}

export const ChatTopBanner = memo(ChatTopBannerComponent)
