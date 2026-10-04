import { UpdateTaskTodosUseCase } from '@ben/domain-task/application/use-cases/tasks/update-task-todos'
import { TaskPresenter } from '@ben/server-ben/presenters/task-presenter'
import { taskRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
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
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = todosBodySchema.parse(request.body)

    const result = await updateTaskTodosUseCase.execute({
      userId: request.userId,
      taskId: taskParamsSchema.parse(request.params).id,
      todoItems: body.todoItems,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: TaskPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
