import { ReopenTaskUseCase } from '@ben/domain-task/application/use-cases/tasks/reopen-task'
import { TaskPresenter } from '@ben/server-ben/presenters/task-presenter'
import { taskRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const taskParamsSchema = z.object({
  id: z.string(),
})

const reopenTaskUseCase = new ReopenTaskUseCase(taskRepository)

export async function reopenTask(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await reopenTaskUseCase.execute({
      userId: request.userId,
      taskId: taskParamsSchema.parse(request.params).id,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
