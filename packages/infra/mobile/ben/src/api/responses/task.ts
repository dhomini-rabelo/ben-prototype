import type { Task, TaskContentType, TaskStatus } from '@/api/models/task'

export interface TaskListItem {
  id: string
  title: string
  contentType: TaskContentType
  status: TaskStatus
  hasPendingDiff: boolean
  lastActivityAt: string
  createdAt: string
}

export interface TaskMessageReply {
  benMessage: string
  costUsd?: number | null
  task: Task
}
