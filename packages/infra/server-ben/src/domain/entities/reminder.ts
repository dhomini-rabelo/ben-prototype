import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export interface ReminderProps {
  userId: ID
  title: string
  remindAt: string | null
  notes: string | null
  createdAt: Date
}

export class Reminder extends Entity<ReminderProps> {
  static create(props: ReminderProps) {
    return new Reminder(props)
  }

  static reference(id: ID, props: ReminderProps) {
    return new Reminder(props, id)
  }
}
