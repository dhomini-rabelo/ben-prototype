import type { UserPreferences } from '@/api/models/user-preferences'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

interface UseUserPreferencesDataProps {
  enabled?: boolean
}

export function useUserPreferencesData({
  enabled,
}: UseUserPreferencesDataProps = {}) {
  return useAPIRequest<ItemResponse<UserPreferences>>({
    url: API_ROUTES.userPreferences.detail,
    enabled,
  })
}
