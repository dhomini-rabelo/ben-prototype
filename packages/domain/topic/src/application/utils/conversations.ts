import { GreaterQuery, createID } from '@ben/domain-base'

import { Conversation } from '@ben/domain-topic/enterprise/entities/conversation'
import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'

export const CONVERSATION_TTL_MS = 24 * 60 * 60 * 1000

export async function findActiveConversation(
  conversationRepository: ConversationRepository,
  userId: string,
  now: Date,
): Promise<Conversation | null> {
  const conversations = await conversationRepository.findMany(
    {
      userId: createID(userId),
      expiresAt: new GreaterQuery({ input: now }),
    },
    { orderBy: 'lastMessageAt', order: 'desc', limit: 1 },
  )

  return conversations[0] ?? null
}

export function toConversationKey(conversation: Conversation): string {
  return `conversa:${conversation.props.slug}:${conversation.props.lastMessageAt.toISOString()}/${conversation.props.expiresAt.toISOString()}`
}
