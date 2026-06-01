import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message, MessageCapture } from '@/domain/entities/message'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  content: string
  capture?: MessageCapture | null
}

export class PersistBenMessageUseCase implements UseCase<Message> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Message> {
    return this.messageRepository.create({
      userId: payload.userId,
      role: 'ben',
      content: payload.content,
      capture: payload.capture ?? null,
      createdAt: new Date(),
    })
  }
}
