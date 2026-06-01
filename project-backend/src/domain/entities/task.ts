import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export type TaskStatus = 'pending' | 'active' | 'finished'

export interface TaskProps {
  userId: string
  title: string
  details: string | null
  status: TaskStatus
  createdAt: Date
}

export class Task extends Entity<TaskProps> {
  static create(props: TaskProps) {
    return new Task(props)
  }

  static reference(id: ID, props: TaskProps) {
    return new Task(props, id)
  }
}
