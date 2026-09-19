import type { MessageRole } from '@/api/models/message'

export type AgentCallPhase = 'context' | 'format'

export type AgentCallStatus = 'ok' | 'error'

export interface AgentCallMessage {
  role: string
  text: string
  content: unknown
}

export interface AgentCallToolDefinition {
  name: string
  description: string
  inputSchema: unknown
}

export interface AgentCallToolCall {
  toolCallId: string
  toolName: string
  input: unknown
}

export interface AgentCallToolResult {
  toolCallId: string
  toolName: string
  output: unknown
}

export interface AgentCallUsage {
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  reasoningTokens: number | null
}

export interface AgentCallStepInput {
  systemPrompt: string
  messages: AgentCallMessage[]
  tools: AgentCallToolDefinition[]
  outputSchema: unknown | null
  requestBody: unknown | null
}

export interface AgentCallStepOutput {
  text: string
  object: unknown | null
  toolCalls: AgentCallToolCall[]
  toolResults: AgentCallToolResult[]
  finishReason: string
  warnings: unknown[]
}

export interface AgentCallStep {
  phase: AgentCallPhase
  stepNumber: number
  input: AgentCallStepInput
  output: AgentCallStepOutput
  modelId: string
  responseId: string
  usage: AgentCallUsage
  startedAt: string
  finishedAt: string
  latencyMs: number
}

export interface AgentCallTrace {
  status: AgentCallStatus
  error: string | null
  modelId: string | null
  modelSlug: string | null
  effort: string | null
  startedAt: string
  finishedAt: string
  latencyMs: number
  totalUsage: AgentCallUsage
  steps: AgentCallStep[]
}

export interface MessageTrace {
  id: string
  role: MessageRole
  createdAt: string
  trace: AgentCallTrace | null
}
