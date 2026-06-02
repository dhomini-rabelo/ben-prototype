import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  limit?: number
  cursor?: string | null
}

interface Response {
  items: Message[]
  hasMore: boolean
  nextCursor: string | null
}

const DEFAULT_LIMIT = 20

export class ListMessagesUseCase implements UseCase<Response> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const page = await this.messageRepository.findManyWithCursorPagination(
      { userId: payload.userId },
      {
        orderBy: 'createdAt',
        order: 'desc',
        limit: payload.limit ?? DEFAULT_LIMIT,
        cursor: payload.cursor,
      },
    )

    return {
      items: page.items,
      hasMore: page.hasMore,
      nextCursor: page.nextCursor,
    }
  }
}
