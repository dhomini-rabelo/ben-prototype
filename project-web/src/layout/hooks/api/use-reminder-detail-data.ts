import type { Reminder } from "@/api/models/reminder";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse } from "@/api/types";
import { useAPIRequest } from "@/layout/hooks/use-api-request";

export function useReminderDetailData(reminderId: string) {
  return useAPIRequest<ItemResponse<Reminder>>({
    url: API_ROUTES.reminders.detail(reminderId),
  });
}
