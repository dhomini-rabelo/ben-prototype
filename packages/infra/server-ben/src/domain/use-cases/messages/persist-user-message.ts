import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  content: string
}

export class PersistUserMessageUseCase implements UseCase<
  ItemResponse<Message>
> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Message>> {
    const item = await this.messageRepository.create({
      userId: createID(payload.userId),
      role: 'user',
      content: payload.content,
      capture: null,
      trace: null,
      createdAt: new Date(),
    })

    return { item }
  }
}
