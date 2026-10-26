import { requestSendChatMessage } from '@/api/requests/chat'
import { animateReply } from './animate-reply'
import { invalidateCapturedQueries } from './invalidate-captured-queries'
import { buildBenMessage } from './message-builders'
import type { StoreGet, StoreSet } from './types'

export async function dispatchReply(
  set: StoreSet,
  get: StoreGet,
  message: string,
  transcriptionCostUsd?: number | null,
  voiceDurationMs?: number | null,
) {
  set({ isAwaitingReply: true, sendError: false })

  try {
    const reply = await requestSendChatMessage(
      message,
      transcriptionCostUsd,
      voiceDurationMs,
    )
    invalidateCapturedQueries(reply)
    const benMessage = buildBenMessage(
      reply.messageId,
      '',
      reply.capture,
      reply.interactionCostUsd,
    )
    set((state) => ({
      sessionMessages: [...state.sessionMessages, benMessage],
    }))
    animateReply(set, get, benMessage.id, reply.message)
  } catch {
    set({ sendError: true })
  } finally {
    set({ isAwaitingReply: false })
  }
}
