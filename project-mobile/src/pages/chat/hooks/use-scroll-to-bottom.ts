import { useEffect, useRef } from 'react'
import type { FlatList } from 'react-native'
import {
  getMessageText,
  type BenUiMessage,
} from '@/pages/chat/utils/chat-messages'

interface UseScrollToBottomProps {
  messages: BenUiMessage[]
  isAwaitingReply: boolean
}

export function useScrollToBottom({
  messages,
  isAwaitingReply,
}: UseScrollToBottomProps) {
  const listRef = useRef<FlatList<BenUiMessage> | null>(null)

  const lastMessage = messages[messages.length - 1]
  const lastMessageId = lastMessage?.id
  const lastMessageLength = lastMessage ? getMessageText(lastMessage).length : 0

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [lastMessageId, lastMessageLength, isAwaitingReply])

  return { listRef }
}
