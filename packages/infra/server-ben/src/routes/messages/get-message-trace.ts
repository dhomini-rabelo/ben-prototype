import { GetMessageTraceUseCase } from '@ben/domain-chat/application/use-cases/messages/get-message-trace'
import { MessageTracePresenter } from '@ben/server-ben/presenters/message-trace-presenter'
import { messageRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const messageParamsSchema = z.object({
  id: z.string(),
})

const getMessageTraceUseCase = new GetMessageTraceUseCase(messageRepository)

export async function getMessageTrace(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await getMessageTraceUseCase.execute({
      userId: request.userId,
      messageId: messageParamsSchema.parse(request.params).id,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: MessageTracePresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
