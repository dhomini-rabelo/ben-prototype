import {
  AgentService,
  GenerateReplyPayload,
  GenerateReplyResult,
  GenerateTaskTurnPayload,
  GenerateTaskTurnResult,
} from '@ben/adapters'
import { generateText, Output, stepCountIs } from 'ai'
import { z } from 'zod'
import { buildFormatSystemPrompt } from './generate-reply/format-system-prompt'
import {
  buildHistoryContextTool,
  HISTORY_CONTEXT_TOOL_DESCRIPTION,
  HISTORY_CONTEXT_TOOL_NAME,
  historyContextInputSchema,
} from './generate-reply/history-context-tool'
import {
  buildOlderMessagesTool,
  OLDER_MESSAGES_TOOL_DESCRIPTION,
  OLDER_MESSAGES_TOOL_NAME,
  olderMessagesInputSchema,
} from './generate-reply/older-messages-tool'
import { agentReplySchema } from './generate-reply/schemas'
import { buildSystemPrompt } from './generate-reply/system-prompt'
import { toAgentReply } from './generate-reply/to-agent-reply'
import { taskTurnReplySchema } from './generate-task-turn/schemas'
import { buildTaskTurnSystemPrompt } from './generate-task-turn/system-prompt'
import { toTaskTurnReply } from './generate-task-turn/to-task-turn-reply'
import { resolveOpenRouterModel } from './models'
import {
  buildAgentCallSteps,
  buildAgentCallTrace,
  sumStepsCostUsd,
  RecordedStep,
} from './trace-builders'

const CONTEXT_MAX_STEPS = 5

export class BenAgentProviderService implements AgentService {
  async generateReply(
    payload: GenerateReplyPayload,
  ): Promise<GenerateReplyResult> {
    const model = resolveOpenRouterModel(payload.model)
    const traceStartedAt = new Date()
    const contextSystemPrompt = buildSystemPrompt({
      topicIndex: payload.topicIndex,
      activeConversation: payload.activeConversation,
      memories: payload.memories,
      now: payload.now,
      timeZone: payload.timeZone,
      activeGoals: payload.activeGoals,
    })
    const contextRecorder: RecordedStep[] = []

    const contextResult = await generateText({
      model,
      system: contextSystemPrompt,
      messages: [
        ...payload.history.messages.map(({ role, content }) => ({
          role,
          content,
        })),
        { role: 'user', content: payload.message },
      ],
      tools: {
        'get-history-context': buildHistoryContextTool(
          payload.resolveHistoryContext,
        ),
        [OLDER_MESSAGES_TOOL_NAME]: buildOlderMessagesTool({
          initialCursor: payload.history.nextCursor,
          resolveOlderMessages: payload.resolveOlderMessages,
        }),
      },
      toolChoice: 'auto',
      stopWhen: stepCountIs(CONTEXT_MAX_STEPS),
      prepareStep: ({ messages, stepNumber }) => {
        contextRecorder.push({
          startedAt: new Date(),
          finishedAt: null,
          messages,
        })
        return stepNumber === CONTEXT_MAX_STEPS - 1
          ? { toolChoice: 'none' }
          : undefined
      },
      onStepFinish: () => {
        const current = contextRecorder[contextRecorder.length - 1]
        if (current) current.finishedAt = new Date()
      },
    })

    const contextSteps = buildAgentCallSteps({
      phase: 'context',
      systemPrompt: contextSystemPrompt,
      tools: [
        {
          name: HISTORY_CONTEXT_TOOL_NAME,
          description: HISTORY_CONTEXT_TOOL_DESCRIPTION,
          inputSchema: z.toJSONSchema(historyContextInputSchema),
        },
        {
          name: OLDER_MESSAGES_TOOL_NAME,
          description: OLDER_MESSAGES_TOOL_DESCRIPTION,
          inputSchema: z.toJSONSchema(olderMessagesInputSchema),
        },
      ],
      outputSchema: null,
      object: null,
      result: contextResult,
      recorded: contextRecorder,
      firstStepNumber: 0,
      fallbackAt: new Date(),
    })

    const formatSystemPrompt = buildFormatSystemPrompt()
    const formatRecorder: RecordedStep[] = []

    const result = await generateText({
      model,
      system: formatSystemPrompt,
      prompt: contextResult.text,
      output: Output.object({ schema: agentReplySchema }),
      prepareStep: ({ messages }) => {
        formatRecorder.push({
          startedAt: new Date(),
          finishedAt: null,
          messages,
        })
        return undefined
      },
      onStepFinish: () => {
        const current = formatRecorder[formatRecorder.length - 1]
        if (current) current.finishedAt = new Date()
      },
    })

    const formatSteps = buildAgentCallSteps({
      phase: 'format',
      systemPrompt: formatSystemPrompt,
      tools: [],
      outputSchema: z.toJSONSchema(agentReplySchema),
      object: result.output,
      result,
      recorded: formatRecorder,
      firstStepNumber: contextSteps.length,
      fallbackAt: new Date(),
    })

    return {
      reply: toAgentReply(result.output),
      trace: buildAgentCallTrace({
        steps: [...contextSteps, ...formatSteps],
        startedAt: traceStartedAt,
        finishedAt: new Date(),
        selection: payload.model,
      }),
    }
  }

  async generateTaskTurn(
    payload: GenerateTaskTurnPayload,
  ): Promise<GenerateTaskTurnResult> {
    const model = resolveOpenRouterModel(payload.model)

    const result = await generateText({
      model,
      system: buildTaskTurnSystemPrompt(payload),
      prompt: payload.message,
      output: Output.object({ schema: taskTurnReplySchema }),
    })

    return {
      reply: toTaskTurnReply(result.output),
      costUsd: sumStepsCostUsd(result.steps),
    }
  }
}
