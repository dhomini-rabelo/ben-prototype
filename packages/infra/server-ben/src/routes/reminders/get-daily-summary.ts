import { GetDailySummaryUseCase } from '@ben/domain-chat/application/use-cases/reminders/get-daily-summary'
import { ReminderPresenter } from '@ben/server-ben/presenters/reminder-presenter'
import { reminderRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeZone: z.string().min(1),
})

const getDailySummaryUseCase = new GetDailySummaryUseCase(reminderRepository)

export async function getDailySummary(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const query = querySchema.parse(request.query)

    const result = await getDailySummaryUseCase.execute({
      userId: request.userId,
      date: query.date,
      timeZone: query.timeZone,
    })

    return response.status(HttpStatus.OK).json({
      alarms: result.alarms.map(ReminderPresenter.toHttp),
      goals: result.goals.map(ReminderPresenter.toHttp),
      conditionals: result.conditionals.map(ReminderPresenter.toHttp),
    })
  } catch (error) {
    next(error)
  }
}
