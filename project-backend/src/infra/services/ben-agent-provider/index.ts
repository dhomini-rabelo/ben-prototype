import {
  AgentService,
  GenerateReplyPayload,
  GenerateReplyResult,
  GenerateTaskTurnPayload,
  TaskTurnReply,
} from '@/adapters/agent-provider'
import { generateText, LanguageModel, Output, stepCountIs } from 'ai'
import { z } from 'zod'
import { buildFormatSystemPrompt } from './generate-reply/format-system-prompt'
import {
  buildHistoryContextTool,
  HISTORY_CONTEXT_TOOL_DESCRIPTION,
  HISTORY_CONTEXT_TOOL_NAME,
  historyContextInputSchema,
} from './generate-reply/history-context-tool'
import { agentReplySchema } from './generate-reply/schemas'
import { buildSystemPrompt } from './generate-reply/system-prompt'
import { taskTurnReplySchema } from './generate-task-turn/schemas'
import { buildTaskTurnSystemPrompt } from './generate-task-turn/system-prompt'
import {
  buildAgentCallSteps,
  buildAgentCallTrace,
  RecordedStep,
} from './trace-builders'

export class BenAgentProviderService implements AgentService {
  constructor(private readonly model: LanguageModel) {}

  async generateReply(
    payload: GenerateReplyPayload,
  ): Promise<GenerateReplyResult> {
    const traceStartedAt = new Date()
    const contextSystemPrompt = buildSystemPrompt(payload.topicIndex)
    const contextRecorder: RecordedStep[] = []

    const contextResult = await generateText({
      model: this.model,
      system: contextSystemPrompt,
      prompt: payload.message,
      tools: {
        'get-history-context': buildHistoryContextTool(
          payload.resolveHistoryContext,
        ),
      },
      toolChoice: 'auto',
      stopWhen: stepCountIs(2),
      prepareStep: ({ messages }) => {
        contextRecorder.push({
          startedAt: new Date(),
          finishedAt: null,
          messages,
        })
        return undefined
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
      model: this.model,
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
      reply: result.output,
      trace: buildAgentCallTrace({
        steps: [...contextSteps, ...formatSteps],
        startedAt: traceStartedAt,
        finishedAt: new Date(),
      }),
    }
  }

  async generateTaskTurn(
    payload: GenerateTaskTurnPayload,
  ): Promise<TaskTurnReply> {
    const result = await generateText({
      model: this.model,
      system: buildTaskTurnSystemPrompt(payload),
      prompt: payload.message,
      output: Output.object({ schema: taskTurnReplySchema }),
    })

    return result.output
  }
}
