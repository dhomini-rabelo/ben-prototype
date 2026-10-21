import { authClient } from '@/api/client'
import type { UserPreferences } from '@/api/models/user-preferences'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse } from '@/api/types'

export async function requestUpdateUserPreferences(
  payload: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const response = await authClient.post<ItemResponse<UserPreferences>>(
    API_ROUTES.userPreferences.update,
    payload,
  )

  return response.data.item
}
