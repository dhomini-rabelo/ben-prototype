import { AgentCallTrace } from '@ben/adapters'
import { MessageRepository } from '@ben/domain-chat/application/repositories/message'
import {
  Message,
  MessageCapture,
} from '@ben/domain-chat/enterprise/entities/message'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  content: string
  capture?: MessageCapture | null
  trace?: AgentCallTrace | null
}

export class PersistBenMessageUseCase implements UseCase<
  ItemResponse<Message>
> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Message>> {
    const item = await this.messageRepository.create({
      userId: createID(payload.userId),
      role: 'ben',
      content: payload.content,
      capture: payload.capture ?? null,
      trace: payload.trace ?? null,
      createdAt: new Date(),
    })

    return { item }
  }
}
