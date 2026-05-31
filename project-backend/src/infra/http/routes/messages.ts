import { InMemoryMessageRepository } from '@/adapters/repositories/in-memory-message-repository'
import { CreateMessageUseCase } from '@/domain/use-cases/messages/create-message'
import { ListMessagesUseCase } from '@/domain/use-cases/messages/list-messages'
import { MessagePresenter } from '@/infra/http/presenters/message-presenter'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
})

const createBodySchema = z.object({
  content: z.string().min(1),
})

const messageRepository = new InMemoryMessageRepository()
const listMessagesUseCase = new ListMessagesUseCase(messageRepository)
const createMessageUseCase = new CreateMessageUseCase(messageRepository)

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

export async function createMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = createBodySchema.parse(req.body)

    const result = await createMessageUseCase.execute({
      userId: req.userId,
      content: body.content,
    })

    return res.status(HttpStatus.CREATED).json({
      userMessage: MessagePresenter.toHttp(result.userMessage),
      benMessage: MessagePresenter.toHttp(result.benMessage),
      capture: result.capture,
    })
  } catch (err) {
    next(err)
  }
}
