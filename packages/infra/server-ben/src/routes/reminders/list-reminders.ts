import { ListRemindersUseCase } from '@ben/domain-chat/application/use-cases/captures/list-reminders'
import { ReminderPresenter } from '@ben/server-ben/presenters/reminder-presenter'
import { reminderRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'

const listRemindersUseCase = new ListRemindersUseCase(reminderRepository)

export async function listReminders(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await listRemindersUseCase.execute({
      userId: request.userId,
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
