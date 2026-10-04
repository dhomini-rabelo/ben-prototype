import { authClient } from '@/api/client'
import type { AgentPreferences } from '@/api/models/agent-preferences'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'

export async function requestUpdateAgentPreferences(payload: {
  modelSlug: string
  effort: string
}): Promise<AgentPreferences> {
  const response = await authClient.post<ItemResponse<AgentPreferences>>(
    API_ROUTES.agentPreferences.update,
    payload,
  )

  return response.data.item
}
