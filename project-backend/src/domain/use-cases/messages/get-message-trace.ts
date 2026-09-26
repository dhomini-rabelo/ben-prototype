import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import { createID } from '@/modules/domain/entity/id'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

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
