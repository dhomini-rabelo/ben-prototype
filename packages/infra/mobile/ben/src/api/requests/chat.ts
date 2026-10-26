import { authClient } from '@/api/client'
import type { AgentReply } from '@/api/responses/agent-reply'
import { API_ROUTES } from '@/api/routes'

export async function requestSendChatMessage(
  text: string,
  transcriptionCostUsd?: number | null,
  voiceDurationMs?: number | null,
): Promise<AgentReply> {
  const response = await authClient.post<AgentReply>(API_ROUTES.chat.send, {
    messages: [{ role: 'user', parts: [{ type: 'text', text }] }],
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...(typeof transcriptionCostUsd === 'number' && { transcriptionCostUsd }),
    ...(typeof voiceDurationMs === 'number' && { voiceDurationMs }),
  })

  return response.data
}
