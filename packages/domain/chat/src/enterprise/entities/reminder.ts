import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'
import type {
  CheckFrequency,
  GoalRecurrence,
  ReminderAlert,
  ReminderKind,
} from '@ben/adapters'

export type ReminderStatus = 'active' | 'done'

export interface ReminderProps {
  userId: ID
  title: string

  remindAt: string | null
  notes: string | null
  createdAt: Date
  kind: ReminderKind
  status: ReminderStatus
  timeZone: string
  alerts: ReminderAlert[]
  recurrence: GoalRecurrence | null
  messages: string[]
  checkFrequency: CheckFrequency | null
  acknowledgedUntil: Date | null
  snoozedUntil: Date | null
  nextFireAt: Date | null
  completedAt: Date | null
}

export class Reminder extends Entity<ReminderProps> {
  static create(props: ReminderProps) {
    return new Reminder(props)
  }

  static reference(id: ID, props: ReminderProps) {
    return new Reminder(props, id)
  }
}
