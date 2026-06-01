import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export type TaskStatus = 'created' | 'active' | 'finished'

export type TaskContentType = 'text' | 'todo'

export type TodoItemDiff = 'added' | 'removed' | 'unchanged'

export interface TodoItem {
  id: string
  title: string
  done: boolean
  order: number
}

export interface TodoItemWithDiff extends TodoItem {
  diff: TodoItemDiff
}

export type TaskDiffChanges =
  | { contentType: 'text'; before: string; after: string }
  | { contentType: 'todo'; items: TodoItemWithDiff[] }

export interface PendingDiff {
  turnId: string
  proposedBy: 'ben'
  changes: TaskDiffChanges
  createdAt: Date
}

export interface TaskProps {
  userId: string
  messageId: string | null
  title: string
  contentType: TaskContentType
  textContent: string | null
  todoItems: TodoItem[] | null
  pendingDiff: PendingDiff | null
  summary: string
  status: TaskStatus
  lastActivityAt: Date
  finishedAt: Date | null
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
