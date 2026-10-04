import type { MessageTrace } from '@/api/models/message-trace'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

export function useMessageTraceData(messageId: string) {
  return useAPIRequest<ItemResponse<MessageTrace>>({
    url: API_ROUTES.messages.trace(messageId),
  })
}
