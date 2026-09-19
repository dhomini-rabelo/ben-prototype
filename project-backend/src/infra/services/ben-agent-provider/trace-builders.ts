import {
  AgentCallMessage,
  AgentCallPhase,
  AgentCallStep,
  AgentCallToolDefinition,
  AgentCallTrace,
  AgentCallUsage,
} from '@/adapters/agent-call-trace'

type UsageLike = {
  inputTokens: number | undefined
  outputTokens: number | undefined
  totalTokens: number | undefined
  outputTokenDetails: { reasoningTokens: number | undefined }
}

type StepResultLike = {
  text: string
  toolCalls: readonly { toolCallId: string; toolName: string; input: unknown }[]
  toolResults: readonly {
    toolCallId: string
    toolName: string
    output: unknown
  }[]
  finishReason: string
  usage: UsageLike
  warnings: readonly unknown[] | undefined
  request: { body?: unknown }
  response: { id: string; modelId: string }
}

type GenerateTextResultLike = {
  steps: readonly StepResultLike[]
}

export type RecordedStep = {
  startedAt: Date
  finishedAt: Date | null
  messages: readonly { role: string; content: unknown }[]
}

function flattenContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return JSON.stringify(content ?? null, null, 2)

  return content
    .map((part) => {
      const candidate = part as { type?: string; text?: string }
      if (candidate.type === 'text' || candidate.type === 'reasoning') {
        return candidate.text ?? ''
      }
      return JSON.stringify(part, null, 2)
    })
    .join('\n')
}

function buildMessages(
  messages: readonly { role: string; content: unknown }[],
): AgentCallMessage[] {
  return messages.map((message) => ({
    role: message.role,
    text: flattenContent(message.content),
    content: message.content,
  }))
}

function buildUsage(usage: UsageLike): AgentCallUsage {
  return {
    inputTokens: usage.inputTokens ?? null,
    outputTokens: usage.outputTokens ?? null,
    totalTokens: usage.totalTokens ?? null,
    reasoningTokens: usage.outputTokenDetails.reasoningTokens ?? null,
  }
}

function sumUsage(steps: AgentCallStep[]): AgentCallUsage {
  const add = (a: number | null, b: number | null) =>
    a === null && b === null ? null : (a ?? 0) + (b ?? 0)

  return steps.reduce<AgentCallUsage>(
    (acc, step) => ({
      inputTokens: add(acc.inputTokens, step.usage.inputTokens),
      outputTokens: add(acc.outputTokens, step.usage.outputTokens),
      totalTokens: add(acc.totalTokens, step.usage.totalTokens),
      reasoningTokens: add(acc.reasoningTokens, step.usage.reasoningTokens),
    }),
    {
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      reasoningTokens: null,
    },
  )
}

export function buildAgentCallSteps(params: {
  phase: AgentCallPhase
  systemPrompt: string
  tools: AgentCallToolDefinition[]
  outputSchema: unknown | null
  object: unknown | null
  result: GenerateTextResultLike
  recorded: readonly RecordedStep[]
  firstStepNumber: number
  fallbackAt: Date
}): AgentCallStep[] {
  const lastIndex = params.result.steps.length - 1

  return params.result.steps.map((step, index) => {
    const recorded = params.recorded[index]
    const startedAt = recorded?.startedAt ?? params.fallbackAt
    const finishedAt =
      recorded?.finishedAt ??
      params.recorded[index + 1]?.startedAt ??
      params.fallbackAt

    return {
      phase: params.phase,
      stepNumber: params.firstStepNumber + index,
      input: {
        systemPrompt: params.systemPrompt,
        messages: buildMessages(recorded?.messages ?? []),
        tools: params.tools,
        outputSchema: params.outputSchema,
        requestBody: step.request.body ?? null,
      },
      output: {
        text: step.text,
        object: index === lastIndex ? params.object : null,
        toolCalls: step.toolCalls.map((toolCall) => ({
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          input: toolCall.input,
        })),
        toolResults: step.toolResults.map((toolResult) => ({
          toolCallId: toolResult.toolCallId,
          toolName: toolResult.toolName,
          output: toolResult.output,
        })),
        finishReason: step.finishReason,
        warnings: [...(step.warnings ?? [])],
      },
      modelId: step.response.modelId,
      responseId: step.response.id,
      usage: buildUsage(step.usage),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      latencyMs: finishedAt.getTime() - startedAt.getTime(),
    }
  })
}

export function buildAgentCallTrace(params: {
  steps: AgentCallStep[]
  startedAt: Date
  finishedAt: Date
}): AgentCallTrace {
  return {
    status: 'ok',
    error: null,
    modelId: params.steps[params.steps.length - 1]?.modelId ?? null,
    startedAt: params.startedAt.toISOString(),
    finishedAt: params.finishedAt.toISOString(),
    latencyMs: params.finishedAt.getTime() - params.startedAt.getTime(),
    totalUsage: sumUsage(params.steps),
    steps: params.steps,
  }
}
