import { ConversationHistoryPage, ResolveOlderMessages } from '@ben/adapters'
import { tool } from 'ai'
import { z } from 'zod'

export const OLDER_MESSAGES_TOOL_NAME = 'get-older-messages'

export const OLDER_MESSAGES_TOOL_DESCRIPTION =
  'Busque a próxima página de mensagens mais antigas da conversa. Use somente quando a resposta depender de algo que não está nas mensagens já recebidas.'

export const olderMessagesInputSchema = z.object({})

type OlderMessagesToolInput = {
  initialCursor: string | null
  resolveOlderMessages: ResolveOlderMessages
}

export const buildOlderMessagesTool = ({
  initialCursor,
  resolveOlderMessages,
}: OlderMessagesToolInput) => {
  let cursor = initialCursor
  let queue: Promise<unknown> = Promise.resolve()

  const fetchNextPage = async (): Promise<ConversationHistoryPage> => {
    if (cursor === null) return { messages: [], nextCursor: null }
    const page = await resolveOlderMessages({ cursor })
    cursor = page.nextCursor
    return page
  }

  return tool({
    description: OLDER_MESSAGES_TOOL_DESCRIPTION,
    inputSchema: olderMessagesInputSchema,
    execute: () => {
      const next = queue.then(fetchNextPage)
      queue = next.catch(() => undefined)
      return next.then((page) => ({
        messages: page.messages,
        hasMore: page.nextCursor !== null,
      }))
    },
  })
}
