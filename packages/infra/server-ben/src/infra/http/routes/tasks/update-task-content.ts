import { UpdateTaskContentUseCase } from '@/domain/use-cases/tasks/update-task-content'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const updateTaskContentUseCase = new UpdateTaskContentUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

const contentBodySchema = z.object({
  textContent: z.string(),
})

export async function updateTaskContent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = contentBodySchema.parse(req.body)

    const result = await updateTaskContentUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      textContent: body.textContent,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
