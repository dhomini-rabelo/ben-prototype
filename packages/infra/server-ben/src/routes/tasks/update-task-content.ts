import { UpdateTaskContentUseCase } from '@ben/domain-task/application/use-cases/tasks/update-task-content'
import { TaskPresenter } from '@ben/server-ben/presenters/task-presenter'
import { taskRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
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
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = contentBodySchema.parse(request.body)

    const result = await updateTaskContentUseCase.execute({
      userId: request.userId,
      taskId: taskParamsSchema.parse(request.params).id,
      textContent: body.textContent,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
