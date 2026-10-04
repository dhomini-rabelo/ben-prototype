import { MessageRepository } from '@ben/domain-chat/application/repositories/message'
import { Message } from '@ben/domain-chat/enterprise/entities/message'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  messageId: string
}

export class GetMessageTraceUseCase implements UseCase<ItemResponse<Message>> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Message>> {
    const item = await this.messageRepository.get({
      id: createID(payload.messageId),
      userId: createID(payload.userId),
    })

    return { item }
  }
}
