import { UpdateTaskTodosUseCase } from '@/domain/use-cases/tasks/update-task-todos'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const updateTaskTodosUseCase = new UpdateTaskTodosUseCase(taskRepository)

const taskParamsSchema = z.object({
  id: z.string(),
})

const todosBodySchema = z.object({
  todoItems: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      done: z.boolean(),
      order: z.number(),
    }),
  ),
})

export async function updateTaskTodos(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = todosBodySchema.parse(req.body)

    const result = await updateTaskTodosUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      todoItems: body.todoItems,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
