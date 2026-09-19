import { AgentModelSelection } from '@/domain/utils/agent-models'
import { env } from '@/infra/services/env'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const geminiModel = google('gemini-2.5-flash-lite')

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

export function resolveOpenRouterModel(
  selection: AgentModelSelection,
): LanguageModel {
  return openrouter(selection.modelSlug, {
    extraBody: {
      provider: {
        sort: 'throughput',
        ignore: ['cerebras'],
        require_parameters: true,
      },
      reasoning: { effort: selection.effort },
    },
  })
}
