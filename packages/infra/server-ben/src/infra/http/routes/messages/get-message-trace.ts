import { GetMessageTraceUseCase } from '@/domain/use-cases/messages/get-message-trace'
import { MessageTracePresenter } from '@/infra/http/presenters/message-trace-presenter'
import { messageRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const messageParamsSchema = z.object({
  id: z.string(),
})

const getMessageTraceUseCase = new GetMessageTraceUseCase(messageRepository)

export async function getMessageTrace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getMessageTraceUseCase.execute({
      userId: req.userId,
      messageId: messageParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: MessageTracePresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
