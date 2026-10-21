import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import {
  Message,
  MessageProps,
} from '@ben/domain-chat/enterprise/entities/message'
import { MessageRepository } from '@ben/domain-chat/application/repositories/message'

export function createMessageData(
  data: Partial<MessageProps> = {},
): MessageProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    role: data.role !== undefined ? data.role : 'user',
    content: data.content !== undefined ? data.content : some.text(),
    capture: data.capture !== undefined ? data.capture : null,
    trace: data.trace !== undefined ? data.trace : null,
    costUsd: data.costUsd !== undefined ? data.costUsd : null,
    interactionCostUsd:
      data.interactionCostUsd !== undefined ? data.interactionCostUsd : null,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
  }
}

export class MessageFactory implements Factory<Message, MessageProps> {
  constructor(private messageRepository: MessageRepository) {}

  async create(data: Partial<MessageProps> = {}) {
    return this.messageRepository.create(createMessageData(data))
  }

  async createMany(
    commonData: Partial<MessageProps> = {},
    specificData: Partial<MessageProps>[] = [],
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
