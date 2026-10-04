import { ListRemindersUseCase } from '@/domain/use-cases/captures/list-reminders'
import { ReminderPresenter } from '@/infra/http/presenters/reminder-presenter'
import { reminderRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'

const listRemindersUseCase = new ListRemindersUseCase(reminderRepository)

export async function listReminders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await listRemindersUseCase.execute({
      userId: req.userId,
    })

    return res.status(HttpStatus.OK).json({
      items: result.items.map((reminder) =>
        ReminderPresenter.toListItemHttp(reminder),
      ),
    })
  } catch (err) {
    next(err)
  }
}
