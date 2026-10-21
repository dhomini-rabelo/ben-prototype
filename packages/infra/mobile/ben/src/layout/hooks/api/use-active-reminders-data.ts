import type { ReminderListItem } from '@/api/models/reminder'
import { ACTIVE_REMINDERS_PARAMS } from '@/api/requests/reminders'
import { API_ROUTES } from '@/api/routes'
import type { ListingResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

export function useActiveRemindersData(options?: { enabled?: boolean }) {
  return useAPIRequest<ListingResponse<ReminderListItem>>({
    url: API_ROUTES.reminders.list,
    params: ACTIVE_REMINDERS_PARAMS,
    enabled: options?.enabled,
  })
}
