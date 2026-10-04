import { GetCapturesCountsUseCase } from '@/domain/use-cases/captures/get-captures-counts'
import { CapturesCountsPresenter } from '@/infra/http/presenters/captures-counts-presenter'
import {
  noteRepository,
  reminderRepository,
  taskRepository,
} from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'

const getCapturesCountsUseCase = new GetCapturesCountsUseCase(
  noteRepository,
  reminderRepository,
  taskRepository,
)

export async function getCapturesCounts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getCapturesCountsUseCase.execute({
      userId: req.userId,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: CapturesCountsPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
