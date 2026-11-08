import type { GoalRecurrence, ReminderKind } from '@/api/models/reminder'

export type MessageRole = 'user' | 'ben'

export type CaptureKind = 'note' | 'reminder' | 'task'

export interface MessageCapture {
  kind: CaptureKind
  itemId: string
  title: string
  meta?: string | null
  reminderKind?: ReminderKind | null
  recurrence?: GoalRecurrence | null
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  capture?: MessageCapture
  costUsd?: number | null
  voiceDurationMs?: number | null
  interactionCostUsd?: number | null
}
