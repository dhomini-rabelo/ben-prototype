import { AlertCircle, TriangleAlert, WifiOff } from 'lucide-react-native'
import { memo } from 'react'
import { View } from 'react-native'
import { ChatBanner } from '@/layout/components/chat-banner'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { useStrings } from '@/layout/hooks/use-strings'
import { workspaceStrings } from '@/pages/task-workspace/strings/workspace-strings'

function WorkspaceTopBannerComponent() {
  const strings = useStrings(workspaceStrings)
  const isOffline = useConnectivityStore((store) => store.isOffline)
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const micPermission = useVoiceStore((store) => store.micPermission)
  const retryVoice = useVoiceStore((store) => store.retryVoice)
  const dismissError = useVoiceStore((store) => store.dismissError)

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
          <ChatBanner.Text>{strings.offline}</ChatBanner.Text>
        </ChatBanner.Root>
      ) : isVoiceError ? (
        <ChatBanner.Root tone="error">
          <ChatBanner.Icon icon={AlertCircle} />
          <ChatBanner.Text>{strings.micGlitched}</ChatBanner.Text>
          <ChatBanner.Action label={strings.retry} onPress={retryVoice} />
          <ChatBanner.Dismiss onPress={dismissError} />
        </ChatBanner.Root>
      ) : isMicDenied ? (
        <ChatBanner.Root tone="warn">
          <ChatBanner.Icon icon={TriangleAlert} />
          <ChatBanner.Text>{strings.micDenied}</ChatBanner.Text>
          <ChatBanner.Dismiss />
        </ChatBanner.Root>
      ) : null}
    </View>
  )
}

export const WorkspaceTopBanner = memo(WorkspaceTopBannerComponent)
