import { router } from 'expo-router'
import { View } from 'react-native'
import { BenLogo } from '@/layout/components/icons/ben-logo'
import { ROUTES } from '@/core/routes'
import { CaptureCard } from '@/pages/chat/components/capture-card'
import { MessageTracePressable } from '@/pages/chat/components/chat-history/message-trace-pressable'
import { DayDivider } from '@/pages/chat/components/day-divider/day-divider'
import { MessageBubble } from '@/pages/chat/components/message-bubble/message-bubble'
import { CostFooter } from '@/pages/chat/components/message-footers/cost-footer'
import { SendRetryFooter } from '@/pages/chat/components/message-footers/send-retry-footer'
import type { ChatListItem } from '@/pages/chat/hooks/use-chat-list'
import { getMessageText } from '@/pages/chat/utils/chat-messages'

type ChatHistoryItemProps = {
  item: ChatListItem
  failedMessageId?: string
}

const BEN_AVATAR_SIZE = 28

export function ChatHistoryItem({
  item,
  failedMessageId,
}: ChatHistoryItemProps) {
  if (item.kind === 'divider') {
    return (
      <DayDivider createdAt={item.createdAt} filedCount={item.filedCount} />
    )
  }

  const message = item.message
  const isFailed = message.id === failedMessageId
  const state = isFailed ? 'error' : 'default'

  if (message.role !== 'assistant') {
    return (
      <MessageBubble
        from="user"
        state={state}
        createdAt={message.metadata?.createdAt}
        voiceDurationMs={message.metadata?.voiceDurationMs}
        footer={isFailed && <SendRetryFooter />}
        className="mb-2"
      >
        {getMessageText(message)}
      </MessageBubble>
    )
  }

  const capture = message.metadata?.capture

  return (
    <View className="mb-3 w-full flex-row items-start gap-2">
      <View className="mt-[3px]">
        <BenLogo variant="avatar" size={BEN_AVATAR_SIZE} />
      </View>
      <View className="min-w-0 flex-1 flex-col items-start gap-1.5">
        <MessageTracePressable
          messageId={message.id}
          createdAt={message.metadata?.createdAt ?? null}
        >
          <MessageBubble
            from="ben"
            state={state}
            footer={
              isFailed ? (
                <SendRetryFooter />
              ) : (
                <CostFooter costUsd={message.metadata?.interactionCostUsd} />
              )
            }
          >
            {getMessageText(message)}
          </MessageBubble>
        </MessageTracePressable>
        {capture && (
          <CaptureCard.Root kind={capture.kind} className="mt-0">
            <CaptureCard.Icon />
            <CaptureCard.Body>
              <CaptureCard.Title>{capture.title}</CaptureCard.Title>
              {capture.meta && (
                <CaptureCard.Meta>{capture.meta}</CaptureCard.Meta>
              )}
            </CaptureCard.Body>
            <CaptureCard.Action
              onAction={() => router.push(ROUTES.taskWorkspace(capture.itemId))}
            />
          </CaptureCard.Root>
        )}
      </View>
    </View>
  )
}
