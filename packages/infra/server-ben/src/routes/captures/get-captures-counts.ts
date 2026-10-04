import { GetCapturesCountsUseCase } from '@ben/domain-chat/application/use-cases/captures/get-captures-counts'
import { CapturesCountsPresenter } from '@ben/server-ben/presenters/captures-counts-presenter'
import {
  noteRepository,
  reminderRepository,
  taskRepository,
} from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'

const getCapturesCountsUseCase = new GetCapturesCountsUseCase(
  noteRepository,
  reminderRepository,
  taskRepository,
)

export async function getCapturesCounts(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await getCapturesCountsUseCase.execute({
      userId: request.userId,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: CapturesCountsPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
