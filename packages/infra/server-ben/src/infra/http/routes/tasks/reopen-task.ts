import { ReopenTaskUseCase } from '@/domain/use-cases/tasks/reopen-task'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const taskParamsSchema = z.object({
  id: z.string(),
})

const reopenTaskUseCase = new ReopenTaskUseCase(taskRepository)

export async function reopenTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await reopenTaskUseCase.execute({
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
