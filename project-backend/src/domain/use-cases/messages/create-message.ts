import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import {
  generateBenReply,
  generateCaptureFromExchange,
} from '@/domain/utils/messages'

interface Payload {
  userId: string
  content: string
}

interface Response {
  userMessage: Message
  benMessage: Message
  capture: Message['props']['capture']
}

export class CreateMessageUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const userMessageCreatedAt = new Date()

    const userMessage = await this.messageRepository.create({
      userId: payload.userId,
      role: 'user',
      content: payload.content,
      capture: null,
      createdAt: userMessageCreatedAt,
    })

    const capture = generateCaptureFromExchange(payload.content)

    const benMessage = await this.messageRepository.create({
      userId: payload.userId,
      role: 'ben',
      content: generateBenReply(payload.content),
      capture,
      createdAt: new Date(userMessageCreatedAt.getTime() + 1),
    })

    return { userMessage, benMessage, capture }
  }
}
