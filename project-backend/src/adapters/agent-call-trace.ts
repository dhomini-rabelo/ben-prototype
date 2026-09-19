export type AgentCallPhase = 'context' | 'format'

export type AgentCallStatus = 'ok' | 'error'

export type AgentCallMessage = {
  role: string
  text: string
  content: unknown
}

export type AgentCallToolDefinition = {
  name: string
  description: string
  inputSchema: unknown
}

export type AgentCallToolCall = {
  toolCallId: string
  toolName: string
  input: unknown
}

export type AgentCallToolResult = {
  toolCallId: string
  toolName: string
  output: unknown
}

export type AgentCallUsage = {
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  reasoningTokens: number | null
}

export type AgentCallStepInput = {
  systemPrompt: string
  messages: AgentCallMessage[]
  tools: AgentCallToolDefinition[]
  outputSchema: unknown | null
  requestBody: unknown | null
}

export type AgentCallStepOutput = {
  text: string
  object: unknown | null
  toolCalls: AgentCallToolCall[]
  toolResults: AgentCallToolResult[]
  finishReason: string
  warnings: unknown[]
}

export type AgentCallStep = {
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

export type AgentCallTrace = {
  status: AgentCallStatus
  error: string | null
  modelId: string | null
  startedAt: string
  finishedAt: string
  latencyMs: number
  totalUsage: AgentCallUsage
  steps: AgentCallStep[]
}
