import { UpdateUserPreferencesUseCase } from '@ben/domain-user/application/use-cases/user-preferences/update-user-preferences'
import { UserPreferencesPresenter } from '@ben/server-ben/presenters/user-preferences-presenter'
import { userRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const updateUserPreferencesUseCase = new UpdateUserPreferencesUseCase(
  userRepository,
)

const bodySchema = z.object({
  language: z.string().optional(),
  showUsdCost: z.boolean().optional(),
})

export async function updateUserPreferences(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = bodySchema.parse(request.body)

    const result = await updateUserPreferencesUseCase.execute({
      userId: request.userId,
      language: body.language,
      showUsdCost: body.showUsdCost,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: UserPreferencesPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
