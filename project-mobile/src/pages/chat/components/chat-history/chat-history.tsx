import { router } from 'expo-router'
import type { RefObject } from 'react'
import { FlatList, View } from 'react-native'
import { Typography } from '@/layout/components/ui/typography'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { ROUTES } from '@/core/routes'
import { CaptureCard } from '@/pages/chat/components/capture-card'
import { MessageBubble } from '@/pages/chat/components/message-bubble/message-bubble'
import { RetryFooter } from '@/pages/chat/components/message-footers/retry-footer'
import { SendRetryFooter } from '@/pages/chat/components/message-footers/send-retry-footer'
import { TranscribingFooter } from '@/pages/chat/components/message-footers/transcribing-footer'
import { TypingIndicator } from '@/pages/chat/components/typing-indicator'
import { useChatList } from '@/pages/chat/hooks/use-chat-list'
import { useMessagesStore } from '@/pages/chat/stores/messages-store'
import { getMessageText } from '@/pages/chat/utils/chat-messages'
import type { BenUiMessage } from '@/pages/chat/utils/chat-messages'

type ChatHistoryProps = {
  listRef?: RefObject<FlatList<BenUiMessage> | null>
  bottomInset?: number
}

export function ChatHistory({ listRef, bottomInset = 0 }: ChatHistoryProps) {
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const isAwaitingReply = useMessagesStore((store) => store.isAwaitingReply)
  const sendError = useMessagesStore((store) => store.sendError)
  const sessionMessages = useMessagesStore((store) => store.sessionMessages)

  const { data, loadOlder, isFetchingOlder } = useChatList()

  const failedMessageId = sendError
    ? sessionMessages[sessionMessages.length - 1]?.id
    : undefined

  const renderItem = ({ item }: { item: BenUiMessage }) => {
    const text = getMessageText(item)
    const isBen = item.role === 'assistant'
    const capture = item.metadata?.capture
    const isFailed = item.id === failedMessageId

    return (
      <MessageBubble
        from={isBen ? 'ben' : 'user'}
        state={isFailed ? 'error' : 'default'}
        footer={isFailed ? <SendRetryFooter /> : undefined}
        className="mb-4"
      >
        {text}
        {isBen && capture && (
          <CaptureCard.Root kind={capture.kind}>
            <CaptureCard.Icon />
            <CaptureCard.Body>
              <CaptureCard.Header />
              <CaptureCard.Title>{capture.title}</CaptureCard.Title>
              {capture.meta && (
                <CaptureCard.Meta>{capture.meta}</CaptureCard.Meta>
              )}
              <CaptureCard.Action
                onAction={() =>
                  router.push(ROUTES.taskWorkspace(capture.itemId))
                }
              />
            </CaptureCard.Body>
          </CaptureCard.Root>
        )}
      </MessageBubble>
    )
  }

  return (
    <FlatList
      ref={listRef}
      inverted
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={loadOlder}
      onEndReachedThreshold={0.2}
      contentContainerClassName="px-4 pb-2"
      contentContainerStyle={{ paddingTop: bottomInset }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="gap-4">
          {voiceStatus === 'transcribing' && (
            <MessageBubble
              from="user"
              state="pending"
              footer={<TranscribingFooter />}
            >
              <Typography
                variant="body-md"
                className="italic text-on-primary/70"
              >
                …
              </Typography>
            </MessageBubble>
          )}
          {voiceStatus === 'error' && (
            <MessageBubble from="user" state="error" footer={<RetryFooter />}>
              couldn&apos;t catch that — tap to retry or type it instead
            </MessageBubble>
          )}
          {isAwaitingReply && (
            <View className="w-full items-start">
              <View className="flex-col items-start gap-1">
                <View className="ml-1">
                  <Typography
                    variant="label-caps"
                    className="text-on-surface-variant"
                  >
                    Ben
                  </Typography>
                </View>
                <TypingIndicator />
              </View>
            </View>
          )}
        </View>
      }
      ListFooterComponent={
        isFetchingOlder ? (
          <View className="w-full items-center py-2">
            <TypingIndicator />
          </View>
        ) : null
      }
    />
  )
}
