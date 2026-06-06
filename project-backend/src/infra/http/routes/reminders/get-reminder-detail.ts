import { GetReminderDetailUseCase } from '@/domain/use-cases/captures/get-reminder-detail'
import { ReminderPresenter } from '@/infra/http/presenters/reminder-presenter'
import { reminderRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const reminderParamsSchema = z.object({
  id: z.string(),
})

const getReminderDetailUseCase = new GetReminderDetailUseCase(
  reminderRepository,
)

export async function getReminderDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getReminderDetailUseCase.execute({
      userId: req.userId,
      reminderId: reminderParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: ReminderPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
