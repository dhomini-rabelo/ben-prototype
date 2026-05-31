import { ListMessagesUseCase } from '@/domain/use-cases/messages/list-messages'
import { MessagePresenter } from '@/infra/http/presenters/message-presenter'
import { messageRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
})

const listMessagesUseCase = new ListMessagesUseCase(messageRepository)

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

    return res.status(HttpStatus.OK).json({
      items: result.items.map(MessagePresenter.toHttp),
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    })
  } catch (err) {
    next(err)
  }
}
