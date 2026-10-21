import { MessageRepository } from '@ben/domain-chat/application/repositories/message'
import { Message } from '@ben/domain-chat/enterprise/entities/message'
import { createID, encodeCursor } from '@ben/domain-base'
import { CursorPaginationResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

export const MESSAGE_HISTORY_PAGE_SIZE = 15

type Payload = { userId: string } & (
  { beforeMessageId: string } | { cursor: string }
)

type Response = CursorPaginationResponse<Message>

export class ListMessageHistoryUseCase implements UseCase<Response> {
  constructor(private messageRepository: MessageRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const userId = createID(payload.userId)
    const cursor =
      'cursor' in payload
        ? payload.cursor
        : await this.buildCursorBefore(payload.beforeMessageId, payload.userId)

    const page = await this.messageRepository.findManyWithCursorPagination(
      { userId },
      {
        orderBy: 'createdAt',
        order: 'desc',
        limit: MESSAGE_HISTORY_PAGE_SIZE,
        cursor,
      },
    )

    return {
      items: [...page.items].reverse(),
      hasMore: page.hasMore,
      nextCursor: page.nextCursor,
    }
  }

  private async buildCursorBefore(
    beforeMessageId: string,
    userId: string,
  ): Promise<string> {
    const anchor = await this.messageRepository.get({
      id: createID(beforeMessageId),
      userId: createID(userId),
    })

    return encodeCursor({
      orderBy: 'createdAt',
      value: anchor.props.createdAt.toISOString(),
      id: anchor.id.toValue(),
    })
  }
}
