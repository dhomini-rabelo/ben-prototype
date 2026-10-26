import { useCallback, useMemo } from 'react'
import { useChatMessages } from '@/pages/chat/hooks/use-chat-messages'
import type { BenUiMessage } from '@/pages/chat/utils/chat-messages'

export type ChatListMessageItem = {
  kind: 'message'
  id: string
  message: BenUiMessage
}

export type ChatListDividerItem = {
  kind: 'divider'
  id: string
  createdAt: string
  filedCount: number
}

export type ChatListItem = ChatListMessageItem | ChatListDividerItem

function getLocalDayKey(message: BenUiMessage) {
  const createdAt = message.metadata?.createdAt
  return createdAt ? new Date(createdAt).toDateString() : null
}

function hasCapture(message: BenUiMessage) {
  return message.role === 'assistant' && Boolean(message.metadata?.capture)
}

export function buildChatListItems(
  newestFirstMessages: BenUiMessage[],
): ChatListItem[] {
  const items: ChatListItem[] = []
  let filedCount = 0
  let dayCreatedAt: string | null = null

  newestFirstMessages.forEach((message, index) => {
    items.push({ kind: 'message', id: message.id, message })

    const createdAt = message.metadata?.createdAt
    if (createdAt) dayCreatedAt = createdAt
    if (hasCapture(message)) filedCount += 1

    const dayKey = getLocalDayKey(message)
    const olderMessage = newestFirstMessages[index + 1]
    const isDayBoundary =
      !olderMessage ||
      (dayKey !== null && dayKey !== getLocalDayKey(olderMessage))

    if (isDayBoundary && dayCreatedAt) {
      items.push({
        kind: 'divider',
        id: `divider-${dayKey ?? dayCreatedAt}`,
        createdAt: dayCreatedAt,
        filedCount,
      })
      filedCount = 0
      dayCreatedAt = null
    }
  })

  return items
}

export function useChatList() {
  const { messages, historyState, historyActions } = useChatMessages()

  const data = useMemo<ChatListItem[]>(
    () => buildChatListItems([...messages].reverse()),
    [messages],
  )

  const loadOlder = useCallback(() => {
    if (historyState.hasMore && !historyState.isFetchingNextPage) {
      historyActions.fetchNextPage()
    }
  }, [historyState.hasMore, historyState.isFetchingNextPage, historyActions])

  return {
    data,
    loadOlder,
    isFetchingOlder: historyState.isFetchingNextPage,
    hasMore: historyState.hasMore,
    isLoading: historyState.isLoading,
    isEmpty: historyState.isEmpty,
  }
}
