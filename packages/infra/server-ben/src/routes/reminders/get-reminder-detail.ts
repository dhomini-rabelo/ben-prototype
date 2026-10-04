import { GetReminderDetailUseCase } from '@ben/domain-chat/application/use-cases/captures/get-reminder-detail'
import { ReminderPresenter } from '@ben/server-ben/presenters/reminder-presenter'
import { reminderRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const reminderParamsSchema = z.object({
  id: z.string(),
})

const getReminderDetailUseCase = new GetReminderDetailUseCase(
  reminderRepository,
)

export async function getReminderDetail(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await getReminderDetailUseCase.execute({
      userId: request.userId,
      reminderId: reminderParamsSchema.parse(request.params).id,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: ReminderPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
