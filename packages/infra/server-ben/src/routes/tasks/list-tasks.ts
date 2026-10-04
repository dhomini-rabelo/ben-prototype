import { ListTasksUseCase } from '@ben/domain-task/application/use-cases/tasks/list-tasks'
import { TaskPresenter } from '@ben/server-ben/presenters/task-presenter'
import { taskRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  status: z.enum(['active', 'finished']).optional(),
})

const listTasksUseCase = new ListTasksUseCase(taskRepository)

export async function listTasks(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const query = listQuerySchema.parse(request.query)

    const result = await listTasksUseCase.execute({
      userId: request.userId,
      status: query.status ?? 'active',
    })

    return response.status(HttpStatus.OK).json({
      items: result.items.map((task) => TaskPresenter.toListItemHttp(task)),
    })
  } catch (error) {
    next(error)
  }
}
