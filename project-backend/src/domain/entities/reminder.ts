import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export interface ReminderProps {
  userId: string
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
