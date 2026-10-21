import { AcknowledgeReminderUseCase } from '@ben/domain-chat/application/use-cases/reminders/acknowledge-reminder'
import { GetUserPreferencesUseCase } from '@ben/domain-user/application/use-cases/user-preferences/get-user-preferences'
import { ReminderPresenter } from '@ben/server-ben/presenters/reminder-presenter'
import {
  reminderRepository,
  userRepository,
} from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const paramsSchema = z.object({ id: z.string() })

const bodySchema = z.object({
  firedAt: z.iso.datetime({ offset: true }),
  snoozeUntil: z.iso.datetime({ offset: true }).optional(),
})

const acknowledgeReminderUseCase = new AcknowledgeReminderUseCase(
  reminderRepository,
)
const getUserPreferencesUseCase = new GetUserPreferencesUseCase(userRepository)

export async function acknowledgeReminder(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { id } = paramsSchema.parse(request.params)
    const body = bodySchema.parse(request.body)
    const { item: preferences } = await getUserPreferencesUseCase.execute({
      userId: request.userId,
    })

    const result = await acknowledgeReminderUseCase.execute({
      userId: request.userId,
      reminderId: id,
      morningTime: preferences.morningTime,
      firedAt: new Date(body.firedAt),
      snoozeUntil: body.snoozeUntil ? new Date(body.snoozeUntil) : undefined,
    })

    return response
      .status(HttpStatus.OK)
      .json({ reminder: ReminderPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
