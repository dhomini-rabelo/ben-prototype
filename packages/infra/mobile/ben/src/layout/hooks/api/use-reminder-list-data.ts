import type { ReminderListItem } from '@/api/models/reminder'
import { API_ROUTES } from '@/api/routes'
import type { ListingResponse } from '@/api/types'
import { useAPIRequest } from '@/layout/hooks/use-api-request'

export function useReminderListData() {
  return useAPIRequest<ListingResponse<ReminderListItem>>({
    url: API_ROUTES.reminders.list,
  })
}
