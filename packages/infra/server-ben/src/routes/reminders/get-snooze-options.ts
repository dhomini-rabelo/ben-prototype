import { GetSnoozeOptionsUseCase } from '@ben/domain-chat/application/use-cases/reminders/get-snooze-options'
import { GetUserPreferencesUseCase } from '@ben/domain-user/application/use-cases/user-preferences/get-user-preferences'
import {
  reminderRepository,
  userRepository,
} from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const paramsSchema = z.object({ id: z.string() })

const querySchema = z.object({
  at: z.iso.datetime({ offset: true }),
})

const getSnoozeOptionsUseCase = new GetSnoozeOptionsUseCase(reminderRepository)
const getUserPreferencesUseCase = new GetUserPreferencesUseCase(userRepository)

export async function getSnoozeOptions(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { id } = paramsSchema.parse(request.params)
    const query = querySchema.parse(request.query)
    const { item: preferences } = await getUserPreferencesUseCase.execute({
      userId: request.userId,
    })

    const result = await getSnoozeOptionsUseCase.execute({
      userId: request.userId,
      reminderId: id,
      morningTime: preferences.morningTime,
      now: new Date(query.at),
    })

    return response.status(HttpStatus.OK).json({
      options: result.options.map(({ option, at }) => ({
        option,
        at: at.toISOString(),
      })),
    })
  } catch (error) {
    next(error)
  }
}
