import { ListTasksUseCase } from '@/domain/use-cases/tasks/list-tasks'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const listQuerySchema = z.object({
  status: z.enum(['active', 'finished']).optional(),
})

const listTasksUseCase = new ListTasksUseCase(taskRepository)

export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listQuerySchema.parse(req.query)

    const result = await listTasksUseCase.execute({
      userId: req.userId,
      status: query.status ?? 'active',
    })

    return res.status(HttpStatus.OK).json({
      items: result.items.map((task) => TaskPresenter.toListItemHttp(task)),
    })
  } catch (err) {
    next(err)
  }
}
