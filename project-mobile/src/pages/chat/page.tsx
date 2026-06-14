import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  View,
  type LayoutChangeEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ROUTES } from '@/core/routes'
import { useConnectivity } from '@/layout/hooks/use-connectivity'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { ChatEmptyState } from '@/pages/chat/components/chat-empty-state/chat-empty-state'
import { ChatFooter } from '@/pages/chat/components/chat-footer/chat-footer'
import { ChatHistory } from '@/pages/chat/components/chat-history/chat-history'
import { ChatHistorySkeleton } from '@/pages/chat/components/chat-history/chat-history-skeleton'
import { ChatTopBanner } from '@/pages/chat/components/chat-top-banner/chat-top-banner'
import { ChatTopBar } from '@/pages/chat/components/chat-top-bar/chat-top-bar'
import { ActiveTaskPicker } from '@/pages/chat/components/task-picker/active-task-picker'
import { useChatMessages } from '@/pages/chat/hooks/use-chat-messages'
import { useScrollToBottom } from '@/pages/chat/hooks/use-scroll-to-bottom'
import { useMessagesStore } from '@/pages/chat/stores/messages-store'

const FOOTER_GAP = 16

export function Chat() {
  const { messages, historyState } = useChatMessages()
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const isAwaitingReply = useMessagesStore((store) => store.isAwaitingReply)
  const stopTyping = useMessagesStore((store) => store.stopTyping)
  useConnectivity()

  const { listRef } = useScrollToBottom({ messages, isAwaitingReply })

  const router = useRouter()
  const [footerHeight, setFooterHeight] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => stopTyping, [stopTyping])

  useEffect(() => useVoiceStore.getState().subscribeMicPermission(), [])

  useFocusEffect(
    useCallback(() => {
      useVoiceStore.getState().setTranscriptHandler((text) => {
        void useMessagesStore.getState().sendText(text)
      })
    }, []),
  )

  function handleFooterLayout(event: LayoutChangeEvent) {
    setFooterHeight(event.nativeEvent.layout.height)
  }

  function handleHeaderLayout(event: LayoutChangeEvent) {
    setHeaderHeight(event.nativeEvent.layout.height)
  }

  const isRecording = voiceStatus === 'recording'
  const hasVoiceBubble =
    voiceStatus === 'transcribing' || voiceStatus === 'error'

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface">
      <View className="flex-1">
        <View
          onLayout={handleHeaderLayout}
          className="absolute inset-x-0 top-0 z-50 bg-surface"
        >
          <ChatTopBar onOpenMenu={() => router.push(ROUTES.menu)} />
          <ChatTopBanner />
        </View>

        <View className="flex-1">
          {historyState.isLoading ? (
            <ChatHistorySkeleton />
          ) : historyState.isEmpty && !hasVoiceBubble ? (
            <View
              className="flex-1 px-4"
              style={{
                paddingTop: headerHeight,
                paddingBottom: footerHeight + FOOTER_GAP,
              }}
            >
              <ChatEmptyState />
            </View>
          ) : (
            <ChatHistory
              listRef={listRef}
              bottomInset={footerHeight + FOOTER_GAP}
            />
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="absolute inset-x-0 bottom-0 z-50"
        >
          <View
            onLayout={handleFooterLayout}
            className="flex-col gap-2 bg-surface px-4 pb-2 pt-2"
          >
            {!isRecording && <ActiveTaskPicker />}
            <ChatFooter
              onStartRecording={() => useVoiceStore.getState().startRecording()}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  )
}
