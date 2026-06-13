import { create } from 'zustand'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'
import { getMessageText } from '@/pages/chat/utils/chat-messages'
import { dispatchReply } from './dispatch-reply'
import { buildUserMessage } from './message-builders'
import type { MessagesStore } from './types'

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  sessionMessages: [],
  isAwaitingReply: false,
  sendError: false,
  typingIntervalId: null,

  stopTyping: () => {
    const intervalId = get().typingIntervalId
    if (intervalId !== null) {
      clearInterval(intervalId)
      set({ typingIntervalId: null })
    }
  },

  sendText: async (content) => {
    const trimmed = content.trim()
    if (
      !trimmed ||
      get().isAwaitingReply ||
      useConnectivityStore.getState().isOffline
    ) {
      return false
    }

    get().stopTyping()
    set((state) => ({
      sessionMessages: [...state.sessionMessages, buildUserMessage(trimmed)],
    }))
    await dispatchReply(set, get, trimmed)
    return true
  },

  retrySend: async () => {
    const messages = get().sessionMessages
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== 'user' || get().isAwaitingReply) {
      return
    }

    get().stopTyping()
    await dispatchReply(set, get, getMessageText(lastMessage))
  },
}))
