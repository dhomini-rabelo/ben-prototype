import {
  AgentReply,
  AgentService,
  GenerateReplyPayload,
  GenerateTaskTurnPayload,
  TaskTurnReply,
} from '@/adapters/agent-provider'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText, Output, stepCountIs } from 'ai'
import { env } from '../env'
import { buildHistoryContextTool } from './generate-reply/history-context-tool'
import { agentReplySchema } from './generate-reply/schemas'
import { buildSystemPrompt } from './generate-reply/system-prompt'
import { taskTurnReplySchema } from './generate-task-turn/schemas'
import { buildTaskTurnSystemPrompt } from './generate-task-turn/system-prompt'

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

const model = google('gemini-2.5-flash-lite')

export class GeminiAgentProviderService implements AgentService {
  async generateReply(payload: GenerateReplyPayload): Promise<AgentReply> {
    const result = await generateText({
      model,
      system: buildSystemPrompt(payload.topicIndex),
      prompt: payload.message,
      tools: {
        'get-history-context': buildHistoryContextTool(
          payload.resolveHistoryContext,
        ),
      },
      toolChoice: 'auto',
      stopWhen: stepCountIs(2),
      output: Output.object({ schema: agentReplySchema }),
    })

    return result.output
  }

  async generateTaskTurn(
    payload: GenerateTaskTurnPayload,
  ): Promise<TaskTurnReply> {
    const result = await generateText({
      model,
      system: buildTaskTurnSystemPrompt(payload),
      prompt: payload.message,
      output: Output.object({ schema: taskTurnReplySchema }),
    })

    return result.output
  }
}
