import {
  AgentCallMessage,
  AgentCallPhase,
  AgentCallStep,
  AgentCallToolDefinition,
  AgentCallTrace,
  AgentCallUsage,
} from '@ben/adapters'
import { AgentModelSelection } from '@ben/adapters'
import type { ProviderMetadata } from 'ai'

type UsageLike = {
  inputTokens: number | undefined
  outputTokens: number | undefined
  totalTokens: number | undefined
  outputTokenDetails: { reasoningTokens: number | undefined }
}

type StepResultLike = {
  text: string
  toolCalls: readonly {
    toolCallId: string
    toolName: string
    input: unknown
  }[]
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
  providerMetadata: ProviderMetadata | undefined
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

function readStepCostUsd(step: StepResultLike): number | null {
  const usage = step.providerMetadata?.openrouter?.usage as
    { cost?: unknown } | undefined
  return typeof usage?.cost === 'number' ? usage.cost : null
}

function addNullable(first: number | null, second: number | null) {
  return first === null && second === null ? null : (first ?? 0) + (second ?? 0)
}

export function sumStepsCostUsd(
  steps: readonly StepResultLike[],
): number | null {
  return steps.reduce<number | null>(
    (accumulator, step) => addNullable(accumulator, readStepCostUsd(step)),
    null,
  )
}

function buildUsage(step: StepResultLike): AgentCallUsage {
  const { usage } = step
  return {
    inputTokens: usage.inputTokens ?? null,
    outputTokens: usage.outputTokens ?? null,
    totalTokens: usage.totalTokens ?? null,
    reasoningTokens: usage.outputTokenDetails.reasoningTokens ?? null,
    costUsd: readStepCostUsd(step),
  }
}

function sumUsage(steps: AgentCallStep[]): AgentCallUsage {
  return steps.reduce<AgentCallUsage>(
    (accumulator, step) => ({
      inputTokens: addNullable(accumulator.inputTokens, step.usage.inputTokens),
      outputTokens: addNullable(
        accumulator.outputTokens,
        step.usage.outputTokens,
      ),
      totalTokens: addNullable(accumulator.totalTokens, step.usage.totalTokens),
      reasoningTokens: addNullable(
        accumulator.reasoningTokens,
        step.usage.reasoningTokens,
      ),
      costUsd: addNullable(accumulator.costUsd, step.usage.costUsd),
    }),
    {
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      reasoningTokens: null,
      costUsd: null,
    },
  )
}

export function buildAgentCallSteps(input: {
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
  const lastIndex = input.result.steps.length - 1

  return input.result.steps.map((step, index) => {
    const recorded = input.recorded[index]
    const startedAt = recorded?.startedAt ?? input.fallbackAt
    const finishedAt =
      recorded?.finishedAt ??
      input.recorded[index + 1]?.startedAt ??
      input.fallbackAt

    return {
      phase: input.phase,
      stepNumber: input.firstStepNumber + index,
      input: {
        systemPrompt: input.systemPrompt,
        messages: buildMessages(recorded?.messages ?? []),
        tools: input.tools,
        outputSchema: input.outputSchema,
        requestBody: step.request.body ?? null,
      },
      output: {
        text: step.text,
        object: index === lastIndex ? input.object : null,
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
      usage: buildUsage(step),
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      latencyMs: finishedAt.getTime() - startedAt.getTime(),
    }
  })
}

export function buildAgentCallTrace(input: {
  steps: AgentCallStep[]
  startedAt: Date
  finishedAt: Date
  selection: AgentModelSelection
}): AgentCallTrace {
  return {
    status: 'ok',
    error: null,
    modelId: input.steps[input.steps.length - 1]?.modelId ?? null,
    modelSlug: input.selection.modelSlug,
    effort: input.selection.effort,
    startedAt: input.startedAt.toISOString(),
    finishedAt: input.finishedAt.toISOString(),
    latencyMs: input.finishedAt.getTime() - input.startedAt.getTime(),
    totalUsage: sumUsage(input.steps),
    steps: input.steps,
  }
}
