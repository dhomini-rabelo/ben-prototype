import { MessageRepository } from '@ben/domain-chat/application/repositories/message'
import { Message } from '@ben/domain-chat/enterprise/entities/message'
import { createID } from '@ben/domain-base'
import { CursorPaginationResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  limit?: number
  cursor?: string | null
}

type Response = CursorPaginationResponse<Message>

const DEFAULT_LIMIT = 20

export class ListMessagesUseCase implements UseCase<Response> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const page = await this.messageRepository.findManyWithCursorPagination(
      { userId: createID(payload.userId) },
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
