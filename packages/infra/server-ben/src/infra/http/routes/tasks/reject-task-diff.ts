import { RejectTaskDiffUseCase } from '@/domain/use-cases/tasks/reject-task-diff'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const rejectTaskDiffUseCase = new RejectTaskDiffUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

export async function rejectTaskDiff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await rejectTaskDiffUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
