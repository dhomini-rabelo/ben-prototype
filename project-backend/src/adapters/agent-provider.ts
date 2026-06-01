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

export type GenerateReplyPayload = {
  userId: string
  message: string
  topicIndex: TopicKey[]
  resolveHistoryContext: ResolveHistoryContext
}

export interface AgentService {
  generateReply(payload: GenerateReplyPayload): Promise<AgentReply>
}
