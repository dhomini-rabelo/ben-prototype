import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import {
  Conversation,
  ConversationProps,
} from '@ben/domain-topic/enterprise/entities/conversation'
import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'

export function createConversationData(
  data: Partial<ConversationProps> = {},
): ConversationProps {
  const lastMessageAt =
    data.lastMessageAt !== undefined ? data.lastMessageAt : new Date()

  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    slug: data.slug !== undefined ? data.slug : 'encontro-familiar',
    summary: data.summary !== undefined ? data.summary : some.text(),
    lastMessageAt,
    expiresAt:
      data.expiresAt !== undefined
        ? data.expiresAt
        : new Date(lastMessageAt.getTime() + 24 * 60 * 60 * 1000),
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
  }
}

export class ConversationFactory implements Factory<
  Conversation,
  ConversationProps
> {
  constructor(private conversationRepository: ConversationRepository) {}

  async create(data: Partial<ConversationProps> = {}) {
    return this.conversationRepository.create(createConversationData(data))
  }

  async createMany(
    commonData: Partial<ConversationProps> = {},
    specificData: Partial<ConversationProps>[] = [],
    amount: number = 2,
  ) {
    return Promise.all(
      Array.from({ length: amount }).map((_, index) => {
        return this.create({
          ...commonData,
          ...(specificData[index] || {}),
        })
      }),
    )
  }
}
