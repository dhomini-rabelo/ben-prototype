import { AgentCallTrace } from '@ben/adapters/ports/agent-call-trace'

export const AGENT_MODEL_SLUGS = [
  'openai/gpt-6-luna',
  'openai/gpt-6.1-sol',
  'deepseek/deepseek-v4.1-flash',
  'z-ai/glm-5.3-flash',
] as const

export type AgentModelSlug = (typeof AGENT_MODEL_SLUGS)[number]

export type AgentEffort = 'none' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export type AgentModelSelection = {
  modelSlug: AgentModelSlug
  effort: AgentEffort
}

export type TopicKey = string

export type HistoryContextResult = Record<
  TopicKey,
  Array<{ id: string; summary: string }>
>

export type ResolveHistoryContext = (input: {
  topics: TopicKey[]
}) => Promise<HistoryContextResult>

export type ConversationMessageRole = 'user' | 'assistant'

export type ConversationMessage = {
  role: ConversationMessageRole
  content: string
  createdAt: string
}

export type ConversationHistoryPage = {
  messages: ConversationMessage[]
  nextCursor: string | null
}

export type ResolveOlderMessages = (input: {
  cursor: string
}) => Promise<ConversationHistoryPage>

export type ActiveConversation = { key: string; summary: string }

export type UserMemory = { key: string; value: string }

export type ConversationUpdate = { slug: string; summary: string }

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
  conversation: ConversationUpdate
  memories: UserMemory[]
}

export type GenerateReplyPayload = {
  userId: string
  message: string
  topicIndex: TopicKey[]
  activeConversation: ActiveConversation | null
  memories: UserMemory[]
  resolveHistoryContext: ResolveHistoryContext
  history: ConversationHistoryPage
  resolveOlderMessages: ResolveOlderMessages
  model: AgentModelSelection
}

export type GenerateReplyResult = {
  reply: AgentReply
  trace: AgentCallTrace
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
  model: AgentModelSelection
}

export type TaskTurnReply = {
  message: string
  proposedChanges: ProposedTaskChanges | null
  updatedSummary: string
}

export type GenerateTaskTurnResult = {
  reply: TaskTurnReply
  costUsd: number | null
}

export interface AgentService {
  generateReply(payload: GenerateReplyPayload): Promise<GenerateReplyResult>
  generateTaskTurn(
    payload: GenerateTaskTurnPayload,
  ): Promise<GenerateTaskTurnResult>
}
