import { GetUserPreferencesUseCase } from '@ben/domain-user/application/use-cases/user-preferences/get-user-preferences'
import { UserPreferencesPresenter } from '@ben/server-ben/presenters/user-preferences-presenter'
import { userRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'

const getUserPreferencesUseCase = new GetUserPreferencesUseCase(userRepository)

export async function getUserPreferences(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await getUserPreferencesUseCase.execute({
      userId: request.userId,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: UserPreferencesPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
