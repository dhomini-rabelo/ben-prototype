import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'
import { Conversation } from '@ben/domain-topic/enterprise/entities/conversation'
import {
  CONVERSATION_TTL_MS,
  findActiveConversation,
} from '@ben/domain-topic/application/utils/conversations'
import { toKebabSlugOrDefault } from '@ben/domain-topic/application/utils/keys'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  slug: string
  summary: string
  lastMessageAt: Date
}

type Response = ItemResponse<Conversation>

export class RecordConversationUseCase implements UseCase<Response> {
  constructor(private conversationRepository: ConversationRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const activeConversation = await findActiveConversation(
      this.conversationRepository,
      payload.userId,
      payload.lastMessageAt,
    )
    const expiresAt = new Date(
      payload.lastMessageAt.getTime() + CONVERSATION_TTL_MS,
    )

    const item = activeConversation
      ? await this.conversationRepository.update(activeConversation.id, {
          summary: payload.summary,
          lastMessageAt: payload.lastMessageAt,
          expiresAt,
        })
      : await this.conversationRepository.create({
          userId: createID(payload.userId),
          slug: toKebabSlugOrDefault(payload.slug),
          summary: payload.summary,
          lastMessageAt: payload.lastMessageAt,
          expiresAt,
          createdAt: new Date(),
        })

    return { item }
  }
}
