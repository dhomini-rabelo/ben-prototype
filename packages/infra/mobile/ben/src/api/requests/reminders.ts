import { authClient } from '@/api/client'
import type {
  CheckFrequency,
  DailySummary,
  GoalRecurrence,
  Reminder,
  ReminderAlert,
  ReminderListItem,
  ReminderStatus,
  SnoozeOptionItem,
} from '@/api/models/reminder'
import { API_ROUTES } from '@/api/routes'
import type { ItemResponse, ListingResponse } from '@/api/types'

export const ACTIVE_REMINDERS_PARAMS = { status: 'active' } as const

export async function requestListReminders(): Promise<ReminderListItem[]> {
  const response = await authClient.get<ListingResponse<ReminderListItem>>(
    API_ROUTES.reminders.list,
  )

  return response.data.items
}

export async function requestGetReminderDetail(
  reminderId: string,
): Promise<Reminder> {
  const response = await authClient.get<ItemResponse<Reminder>>(
    API_ROUTES.reminders.detail(reminderId),
  )

  return response.data.item
}

export interface UpdateReminderBody {
  title?: string
  remindAt?: string
  alerts?: ReminderAlert[]
  recurrence?: GoalRecurrence
  checkFrequency?: CheckFrequency
  status?: ReminderStatus
  now?: string
}

export interface AcknowledgeReminderBody {
  firedAt: string
  snoozeUntil?: string
}

export async function requestActiveReminders(): Promise<ReminderListItem[]> {
  const response = await authClient.get<ListingResponse<ReminderListItem>>(
    API_ROUTES.reminders.list,
    { params: ACTIVE_REMINDERS_PARAMS },
  )

  return response.data.items
}

export async function requestUpdateReminder(
  reminderId: string,
  body: UpdateReminderBody,
): Promise<Reminder> {
  const response = await authClient.post<{ reminder: Reminder }>(
    API_ROUTES.reminders.update(reminderId),
    body,
  )

  return response.data.reminder
}

export async function requestAcknowledgeReminder(
  reminderId: string,
  body: AcknowledgeReminderBody,
): Promise<Reminder> {
  const response = await authClient.post<{ reminder: Reminder }>(
    API_ROUTES.reminders.acknowledge(reminderId),
    body,
  )

  return response.data.reminder
}

export async function requestSnoozeOptions(
  reminderId: string,
  at: string,
): Promise<SnoozeOptionItem[]> {
  const response = await authClient.get<{ options: SnoozeOptionItem[] }>(
    API_ROUTES.reminders.snoozeOptions(reminderId),
    { params: { at } },
  )

  return response.data.options
}

export async function requestDailySummary(
  date: string,
  timeZone: string,
): Promise<DailySummary> {
  const response = await authClient.get<DailySummary>(
    API_ROUTES.reminders.dailySummary,
    { params: { date, timeZone } },
  )

  return response.data
}
