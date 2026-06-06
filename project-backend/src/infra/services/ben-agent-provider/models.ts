import { env } from '@/infra/services/env'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
})

export const geminiModel = google('gemini-2.5-flash-lite')

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

export const openRouterModel = openrouter('openai/gpt-oss-120b', {
  extraBody: {
    provider: {
      sort: 'throughput', // uses the provider with the highest throughput
      ignore: ['cerebras'],
      require_parameters: true, // only use providers that support the parameters we want to use
    },
  },
})
