import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message, MessageCapture } from '@/domain/entities/message'
import { createID } from '@/modules/domain/entity/id'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  content: string
  capture?: MessageCapture | null
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
      createdAt: new Date(),
    })

    return { item }
  }
}
