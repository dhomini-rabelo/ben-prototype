import { authClient } from "@/api/client";
import type { Reminder, ReminderListItem } from "@/api/models/reminder";
import { API_ROUTES } from "@/api/routes";
import type { ItemResponse, ListingResponse } from "@/api/types";

export async function requestListReminders(): Promise<ReminderListItem[]> {
  const response = await authClient.get<ListingResponse<ReminderListItem>>(
    API_ROUTES.reminders.list,
  );

  return response.data.items;
}

export async function requestGetReminderDetail(
  reminderId: string,
): Promise<Reminder> {
  const response = await authClient.get<ItemResponse<Reminder>>(
    API_ROUTES.reminders.detail(reminderId),
  );

  return response.data.item;
}
