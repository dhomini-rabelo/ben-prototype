import { randomUUID } from 'expo-crypto'
import type { CaptureView } from '@/api/responses/agent-reply'
import type { BenUiMessage } from '@/pages/chat/utils/chat-messages'

export function buildUserMessage(
  text: string,
  costUsd?: number | null,
  voiceDurationMs?: number | null,
): BenUiMessage {
  return {
    id: randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text }],
    metadata: { createdAt: new Date().toISOString(), costUsd, voiceDurationMs },
  }
}

export function buildBenMessage(
  id: string,
  text: string,
  capture?: CaptureView | null,
  interactionCostUsd?: number | null,
): BenUiMessage {
  return {
    id,
    role: 'assistant',
    parts: [{ type: 'text', text }],
    metadata: {
      capture: capture ?? undefined,
      createdAt: new Date().toISOString(),
      interactionCostUsd,
    },
  }
}
