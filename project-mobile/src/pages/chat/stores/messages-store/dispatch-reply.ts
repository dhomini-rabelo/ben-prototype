import { requestSendChatMessage } from '@/api/requests/chat'
import { animateReply } from './animate-reply'
import { invalidateCapturedQueries } from './invalidate-captured-queries'
import { buildBenMessage } from './message-builders'
import type { StoreGet, StoreSet } from './types'

export async function dispatchReply(
  set: StoreSet,
  get: StoreGet,
  message: string,
) {
  set({ isAwaitingReply: true, sendError: false })

  try {
    const reply = await requestSendChatMessage(message)
    invalidateCapturedQueries(reply)
    const benMessage = buildBenMessage('', reply.capture)
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
