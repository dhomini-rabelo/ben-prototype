import { ApproveTaskDiffUseCase } from '@ben/domain-task/application/use-cases/tasks/approve-task-diff'
import { TaskPresenter } from '@ben/server-ben/presenters/task-presenter'
import { taskRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const approveTaskDiffUseCase = new ApproveTaskDiffUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

export async function approveTaskDiff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await approveTaskDiffUseCase.execute({
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
