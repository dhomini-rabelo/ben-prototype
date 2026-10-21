import { UpdateReminderUseCase } from '@ben/domain-chat/application/use-cases/reminders/update-reminder'
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
  title: z.string().min(1).optional(),
  remindAt: z.iso.datetime({ offset: true }).optional(),
  alerts: z
    .array(
      z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('at-event') }),
        z.object({ kind: z.literal('day-before') }),
        z.object({ kind: z.literal('morning-of') }),
        z.object({
          kind: z.literal('minutes-before'),
          minutes: z.number().int().positive(),
        }),
      ]),
    )
    .optional(),
  recurrence: z
    .discriminatedUnion('type', [
      z.object({ type: z.literal('none') }),
      z.object({ type: z.literal('daily') }),
      z.object({
        type: z.literal('weekdays'),
        weekdays: z.array(z.number().int().min(0).max(6)).min(1),
      }),
    ])
    .optional(),
  checkFrequency: z
    .discriminatedUnion('type', [
      z.object({ type: z.literal('daily') }),
      z.object({ type: z.literal('weekly') }),
      z.object({
        type: z.literal('every-n-days'),
        days: z.number().int().positive(),
      }),
    ])
    .optional(),
  status: z.enum(['active', 'done']).optional(),
})

const updateReminderUseCase = new UpdateReminderUseCase(reminderRepository)
const getUserPreferencesUseCase = new GetUserPreferencesUseCase(userRepository)

export async function updateReminder(
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

    const result = await updateReminderUseCase.execute({
      userId: request.userId,
      reminderId: id,
      morningTime: preferences.morningTime,
      ...body,
    })

    return response
      .status(HttpStatus.OK)
      .json({ reminder: ReminderPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
