import { MessageRepository } from '@/adapters/repositories/message-repository'
import { Message } from '@/domain/entities/message'

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

export class ListMessagesUseCase {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const limit = payload.limit ?? DEFAULT_LIMIT

    const { items, hasMore, nextCursor } =
      await this.messageRepository.findManyWithCursorPagination(
        { userId: payload.userId },
        {
          orderBy: 'createdAt',
          order: 'desc',
          limit,
          cursor: payload.cursor,
        },
      )

    return { items, hasMore, nextCursor }
  }
}
