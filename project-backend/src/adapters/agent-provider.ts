import { Response } from 'express'

export interface AgentStreamResult {
  pipeUIMessageStreamToResponse(res: Response): void
}

/**
 * Identifies a recurring subject for a user.
 * Documented shape: `kind:category:slug` (e.g. `reminder:work:meeting`).
 */
export type TopicKey = string

export type HistoryContextResult = Record<
  TopicKey,
  Array<{ id: string; summary: string }>
>

export type ResolveHistoryContext = (input: {
  topics: TopicKey[]
}) => Promise<HistoryContextResult>

export type ReminderDraft = {
  title: string
  remindAt?: string
  notes?: string
}

export type NoteDraft = {
  title: string
  body: string
}

export type TaskDraft = {
  title: string
  details?: string
}

export type AgentReply = {
  message: string
  newReminders: ReminderDraft[]
  newNotes: NoteDraft[]
  newTasks: TaskDraft[]
  historyTopics: Array<{ topic: TopicKey; summary: string }>
}

export type StreamReplyPayload = {
  userId: string
  message: string
  topicIndex: TopicKey[]
  resolveHistoryContext: ResolveHistoryContext
  onFinish?: (reply: AgentReply) => void | Promise<void>
}

export interface AgentService {
  streamReply(payload: StreamReplyPayload): AgentStreamResult
}
