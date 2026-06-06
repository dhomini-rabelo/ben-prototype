import {
  AgentReply,
  AgentService,
  GenerateReplyPayload,
  GenerateTaskTurnPayload,
  TaskTurnReply,
} from '@/adapters/agent-provider'
import { generateText, LanguageModel, Output, stepCountIs } from 'ai'
import { buildFormatSystemPrompt } from './generate-reply/format-system-prompt'
import { buildHistoryContextTool } from './generate-reply/history-context-tool'
import { agentReplySchema } from './generate-reply/schemas'
import { buildSystemPrompt } from './generate-reply/system-prompt'
import { taskTurnReplySchema } from './generate-task-turn/schemas'
import { buildTaskTurnSystemPrompt } from './generate-task-turn/system-prompt'

export class BenAgentProviderService implements AgentService {
  constructor(private readonly model: LanguageModel) {}

  async generateReply(payload: GenerateReplyPayload): Promise<AgentReply> {
    const contextResult = await generateText({
      model: this.model,
      system: buildSystemPrompt(payload.topicIndex),
      prompt: payload.message,
      tools: {
        'get-history-context': buildHistoryContextTool(
          payload.resolveHistoryContext,
        ),
      },
      toolChoice: 'auto',
      stopWhen: stepCountIs(2),
    })

    // keeping for debugging
    console.log(
      '[ben-agent] tool calls:',
      JSON.stringify(contextResult.toolCalls, null, 2),
    )
    console.log(
      '[ben-agent] tool results:',
      JSON.stringify(contextResult.toolResults, null, 2),
    )
    console.log('[ben-agent] context text:', contextResult.text)

    const result = await generateText({
      model: this.model,
      system: buildFormatSystemPrompt(),
      prompt: contextResult.text,
      output: Output.object({ schema: agentReplySchema }),
    })

    // keeping for debugging
    console.log(
      '[ben-agent] reply output:',
      JSON.stringify(result.output, null, 2),
    )

    return result.output
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
