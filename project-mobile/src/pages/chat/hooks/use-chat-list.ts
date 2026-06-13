import { useCallback, useMemo } from 'react'
import { useChatMessages } from '@/pages/chat/hooks/use-chat-messages'
import type { BenUiMessage } from '@/pages/chat/utils/chat-messages'

export function useChatList() {
  const { messages, historyState, historyActions } = useChatMessages()

  const data = useMemo<BenUiMessage[]>(
    () => [...messages].reverse(),
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
