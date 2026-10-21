import { ListRemindersUseCase } from '@ben/domain-chat/application/use-cases/captures/list-reminders'
import { ReminderPresenter } from '@ben/server-ben/presenters/reminder-presenter'
import { reminderRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listRemindersQuerySchema = z.object({
  kind: z.enum(['alarm', 'goal', 'conditional']).optional(),
  status: z.enum(['active', 'done']).optional(),
})

const listRemindersUseCase = new ListRemindersUseCase(reminderRepository)

export async function listReminders(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const query = listRemindersQuerySchema.parse(request.query)
    const result = await listRemindersUseCase.execute({
      userId: request.userId,
      kind: query.kind,
      status: query.status,
    })

    return response.status(HttpStatus.OK).json({
      items: result.items.map((reminder) =>
        ReminderPresenter.toListItemHttp(reminder),
      ),
    })
  } catch (error) {
    next(error)
  }
}
