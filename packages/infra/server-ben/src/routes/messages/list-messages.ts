import { ResolveCaptureUseCase } from '@ben/domain-chat/application/use-cases/captures/resolve-capture'
import { ListMessagesUseCase } from '@ben/domain-chat/application/use-cases/messages/list-messages'
import { MessagePresenter } from '@ben/server-ben/presenters/message-presenter'
import {
  messageRepository,
  noteRepository,
  reminderRepository,
  taskRepository,
} from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
})

const listMessagesUseCase = new ListMessagesUseCase(messageRepository)
const resolveCaptureUseCase = new ResolveCaptureUseCase(
  noteRepository,
  reminderRepository,
  taskRepository,
)

export async function listMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listQuerySchema.parse(req.query)

    const result = await listMessagesUseCase.execute({
      userId: req.userId,
      limit: query.limit,
      cursor: query.cursor,
    })

    const items = await Promise.all(
      result.items.map(async (message) => {
        const capture = message.props.capture
          ? (
              await resolveCaptureUseCase.execute({
                capture: message.props.capture,
              })
            ).item
          : null
        return MessagePresenter.toHttp(message, capture)
      }),
    )

    return res.status(HttpStatus.OK).json({
      items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    })
  } catch (err) {
    next(err)
  }
}
