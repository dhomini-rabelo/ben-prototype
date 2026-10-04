import type { AgentPreferences } from '@/api/models/agent-preferences'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

export function useAgentPreferencesData() {
  return useAPIRequest<ItemResponse<AgentPreferences>>({
    url: API_ROUTES.agentPreferences.detail,
  })
}
