import { ApproveTaskDiffUseCase } from '@/domain/use-cases/tasks/approve-task-diff'
import { CreateTaskMessageUseCase } from '@/domain/use-cases/tasks/create-task-message'
import { FinishTaskUseCase } from '@/domain/use-cases/tasks/finish-task'
import { GetTaskDetailUseCase } from '@/domain/use-cases/tasks/get-task-detail'
import { ListTasksUseCase } from '@/domain/use-cases/tasks/list-tasks'
import { RejectTaskDiffUseCase } from '@/domain/use-cases/tasks/reject-task-diff'
import { ReopenTaskUseCase } from '@/domain/use-cases/tasks/reopen-task'
import { UpdateTaskContentUseCase } from '@/domain/use-cases/tasks/update-task-content'
import { UpdateTaskTodosUseCase } from '@/domain/use-cases/tasks/update-task-todos'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { GeminiAgentProviderService } from '@/infra/services/gemini-agent-provider'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const agentService = new GeminiAgentProviderService()
const getTaskDetailUseCase = new GetTaskDetailUseCase(taskRepository)
const listTasksUseCase = new ListTasksUseCase(taskRepository)
const createTaskMessageUseCase = new CreateTaskMessageUseCase(
  taskRepository,
  agentService,
)
const approveTaskDiffUseCase = new ApproveTaskDiffUseCase(taskRepository)
const rejectTaskDiffUseCase = new RejectTaskDiffUseCase(taskRepository)
const updateTaskContentUseCase = new UpdateTaskContentUseCase(taskRepository)
const updateTaskTodosUseCase = new UpdateTaskTodosUseCase(taskRepository)
const finishTaskUseCase = new FinishTaskUseCase(taskRepository)
const reopenTaskUseCase = new ReopenTaskUseCase(taskRepository)

const listQuerySchema = z.object({
  status: z.enum(['active', 'finished']).optional(),
})

const taskParamsSchema = z.object({
  id: z.string(),
})

const messageBodySchema = z.object({
  content: z.string().min(1),
})

const contentBodySchema = z.object({
  textContent: z.string(),
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

export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listQuerySchema.parse(req.query)

    const tasks = await listTasksUseCase.execute({
      userId: req.userId,
      status: query.status ?? 'active',
    })

    return res
      .status(HttpStatus.OK)
      .json({ items: tasks.map((task) => TaskPresenter.toListItemHttp(task)) })
  } catch (err) {
    next(err)
  }
}

export async function getTaskDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await getTaskDetailUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res.status(HttpStatus.OK).json(TaskPresenter.toHttp(task))
  } catch (err) {
    next(err)
  }
}

export async function createTaskMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = messageBodySchema.parse(req.body)

    const { task, benMessage } = await createTaskMessageUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      message: body.content,
    })

    return res.status(HttpStatus.OK).json({
      benMessage,
      task: TaskPresenter.toHttp(task),
    })
  } catch (err) {
    next(err)
  }
}

export async function approveTaskDiff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await approveTaskDiffUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res.status(HttpStatus.OK).json(TaskPresenter.toHttp(task))
  } catch (err) {
    next(err)
  }
}

export async function rejectTaskDiff(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await rejectTaskDiffUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res.status(HttpStatus.OK).json(TaskPresenter.toHttp(task))
  } catch (err) {
    next(err)
  }
}

export async function updateTaskContent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = contentBodySchema.parse(req.body)

    const task = await updateTaskContentUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      textContent: body.textContent,
    })

    return res.status(HttpStatus.OK).json(TaskPresenter.toHttp(task))
  } catch (err) {
    next(err)
  }
}

export async function updateTaskTodos(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = todosBodySchema.parse(req.body)

    const task = await updateTaskTodosUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      todoItems: body.todoItems,
    })

    return res.status(HttpStatus.OK).json(TaskPresenter.toHttp(task))
  } catch (err) {
    next(err)
  }
}

export async function finishTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await finishTaskUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res.status(HttpStatus.OK).json(TaskPresenter.toHttp(task))
  } catch (err) {
    next(err)
  }
}

export async function reopenTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await reopenTaskUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
    })

    return res.status(HttpStatus.OK).json(TaskPresenter.toHttp(task))
  } catch (err) {
    next(err)
  }
}
