import type { Reminder } from '@/api/models/reminder'

// expo-notifications has only partial web support (e.g. push-token listeners are
// no-ops and log warnings on import). Local reminder notifications aren't part of
// the web experience, so the whole service is a no-op here. Metro picks this
// `.web.ts` variant for the web bundle; native uses `notifications-service.ts`.
export async function requestNotificationPermission(): Promise<boolean> {
  return false
}

export async function scheduleReminderNotification(
  _reminder: Reminder,
): Promise<void> {}

export async function cancelReminderNotification(
  _reminderId: string,
): Promise<void> {}

export async function rescheduleReminderNotification(
  _reminder: Reminder,
): Promise<void> {}

export async function syncReminderNotifications(
  _reminders: Reminder[],
): Promise<void> {}
