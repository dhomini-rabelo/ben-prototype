export type ReminderStatus = 'upcoming' | 'fired'

export interface Reminder {
  id: string
  title: string
  firesAt: string | null
  body: string | null
  status: ReminderStatus
  capturedAt: string
}

export type ReminderListItem = Reminder
