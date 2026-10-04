import { ResolveHistoryContext } from '@/adapters/agent-provider'
import { tool } from 'ai'
import { z } from 'zod'

export const HISTORY_CONTEXT_TOOL_NAME = 'get-history-context'

export const HISTORY_CONTEXT_TOOL_DESCRIPTION =
  'Busque o histórico relacionado a um conjunto de tópicos antes de responder. Use no máximo uma vez por mensagem.'

export const historyContextInputSchema = z.object({
  topics: z.array(z.string()),
})

export const buildHistoryContextTool = (
  resolveHistoryContext: ResolveHistoryContext,
) =>
  tool({
    description: HISTORY_CONTEXT_TOOL_DESCRIPTION,
    inputSchema: historyContextInputSchema,
    execute: ({ topics }) => resolveHistoryContext({ topics }),
  })
