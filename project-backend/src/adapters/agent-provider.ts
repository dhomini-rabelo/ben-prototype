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

export type TaskContentType = 'text' | 'todo'

export type TaskDraft = {
  title: string
  contentType: TaskContentType
  textContent?: string
  todoItems?: string[]
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

export type TaskTurnTodo = {
  id: string
  title: string
  done: boolean
  order: number
}

export type ProposedTodoItem = {
  id?: string
  title: string
  done: boolean
  order: number
  diff: 'added' | 'removed' | 'unchanged'
}

export type ProposedTaskChanges =
  | { contentType: 'text'; after: string }
  | { contentType: 'todo'; items: ProposedTodoItem[] }

export type GenerateTaskTurnPayload = {
  userId: string
  title: string
  contentType: TaskContentType
  textContent: string | null
  todoItems: TaskTurnTodo[] | null
  summary: string
  message: string
}

export type TaskTurnReply = {
  message: string
  proposedChanges: ProposedTaskChanges | null
  updatedSummary: string
}

export interface AgentService {
  generateReply(payload: GenerateReplyPayload): Promise<AgentReply>
  generateTaskTurn(payload: GenerateTaskTurnPayload): Promise<TaskTurnReply>
}
