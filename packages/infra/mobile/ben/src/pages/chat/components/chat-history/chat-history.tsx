import type { RefObject } from 'react'
import { FlatList, View } from 'react-native'
import { BenLogo } from '@/layout/components/icons/ben-logo'
import { Typography } from '@/layout/components/ui/typography'
import { selectVoiceStatus, useVoiceStore } from '@/layout/stores/voice-store'
import { useStrings } from '@/layout/hooks/use-strings'
import { ChatHistoryItem } from '@/pages/chat/components/chat-history/chat-history-item'
import { MessageBubble } from '@/pages/chat/components/message-bubble/message-bubble'
import { RetryFooter } from '@/pages/chat/components/message-footers/retry-footer'
import { TranscribingFooter } from '@/pages/chat/components/message-footers/transcribing-footer'
import { TypingIndicator } from '@/pages/chat/components/typing-indicator'
import type { ChatListItem } from '@/pages/chat/hooks/use-chat-list'
import { useChatList } from '@/pages/chat/hooks/use-chat-list'
import { useMessagesStore } from '@/pages/chat/stores/messages-store'
import { chatStrings } from '@/pages/chat/strings/chat-strings'

const BEN_AVATAR_SIZE = 28

type ChatHistoryProps = {
  listRef?: RefObject<FlatList<ChatListItem> | null>
  bottomInset?: number
}

export function ChatHistory({ listRef, bottomInset = 0 }: ChatHistoryProps) {
  const strings = useStrings(chatStrings)
  const voiceStatus = useVoiceStore(selectVoiceStatus)
  const isAwaitingReply = useMessagesStore((store) => store.isAwaitingReply)
  const sendError = useMessagesStore((store) => store.sendError)
  const sessionMessages = useMessagesStore((store) => store.sessionMessages)

  const { data, loadOlder, isFetchingOlder } = useChatList()

  const failedMessageId = sendError
    ? sessionMessages[sessionMessages.length - 1]?.id
    : undefined

  return (
    <FlatList
      ref={listRef}
      inverted
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ChatHistoryItem item={item} failedMessageId={failedMessageId} />
      )}
      onEndReached={loadOlder}
      onEndReachedThreshold={0.2}
      contentContainerClassName="px-4 pb-2"
      contentContainerStyle={{ paddingTop: bottomInset }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="gap-2">
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
              {strings.voiceErrorBubble}
            </MessageBubble>
          )}
          {isAwaitingReply && (
            <View className="w-full flex-row items-start gap-2">
              <View className="mt-[3px]">
                <BenLogo variant="avatar" size={BEN_AVATAR_SIZE} />
              </View>
              <TypingIndicator className="rounded-[20px] rounded-tl-[6px] bg-bubble-ben" />
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
