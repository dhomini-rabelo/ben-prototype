import { GetTaskDetailUseCase } from '@/domain/use-cases/tasks/get-task-detail'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const taskParamsSchema = z.object({
  id: z.string(),
})

const getTaskDetailUseCase = new GetTaskDetailUseCase(taskRepository)

export async function getTaskDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getTaskDetailUseCase.execute({
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
