export type ReminderKind = 'alarm' | 'goal' | 'conditional'

export type ReminderStatus = 'active' | 'done'

export type ReminderAlert =
  | { kind: 'at-event' }
  | { kind: 'day-before' }
  | { kind: 'morning-of' }
  | { kind: 'minutes-before'; minutes: number }

export type GoalRecurrence =
  | { type: 'none' }
  | { type: 'daily' }
  | { type: 'weekdays'; weekdays: number[] }

export type CheckFrequency =
  | { type: 'daily' }
  | { type: 'every-n-days'; days: number }
  | { type: 'weekly' }

export type SnoozeOption =
  '10-minutes' | '30-minutes' | '1-hour' | '2-hours' | 'tomorrow-morning'

export interface SnoozeOptionItem {
  option: SnoozeOption
  at: string
}

export type ReminderActionType = 'stop' | 'snooze' | 'done'

export interface ReminderAction {
  type: ReminderActionType
  firedAt: string
  actedAt: string
}

export interface Reminder {
  id: string
  title: string
  kind: ReminderKind
  status: ReminderStatus
  firesAt: string | null
  body: string | null
  capturedAt: string
  timeZone: string
  alerts: ReminderAlert[]
  recurrence: GoalRecurrence | null
  messages: string[]
  checkFrequency: CheckFrequency | null
  nextFireAt: string | null
  snoozedUntil: string | null
  acknowledgedUntil: string | null
  completedAt: string | null
  actions: ReminderAction[]
}

export type ReminderListItem = Reminder

export interface DailySummary {
  alarms: Reminder[]
  goals: Reminder[]
  conditionals: Reminder[]
}
