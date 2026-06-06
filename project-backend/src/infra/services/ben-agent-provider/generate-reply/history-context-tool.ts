import { ResolveHistoryContext } from '@/adapters/agent-provider'
import { tool } from 'ai'
import { z } from 'zod'

export const buildHistoryContextTool = (
  resolveHistoryContext: ResolveHistoryContext,
) =>
  tool({
    description:
      'Busque o histórico relacionado a um conjunto de tópicos antes de responder. Use no máximo uma vez por mensagem.',
    inputSchema: z.object({
      topics: z.array(z.string()),
    }),
    execute: ({ topics }) => resolveHistoryContext({ topics }),
  })
