import type { StateCreator } from 'zustand'
import type { BenUiMessage } from '@/pages/chat/utils/chat-messages'

export interface SendTextOptions {
  transcriptionCostUsd?: number | null
  voiceDurationMs?: number | null
}

export interface MessagesStore {
  sessionMessages: BenUiMessage[]
  isAwaitingReply: boolean
  sendError: boolean
  typingIntervalId: ReturnType<typeof setInterval> | null

  stopTyping: () => void
  sendText: (content: string, options?: SendTextOptions) => Promise<boolean>
  retrySend: () => Promise<void>
}

export type StoreSet = Parameters<StateCreator<MessagesStore>>[0]
export type StoreGet = Parameters<StateCreator<MessagesStore>>[1]
