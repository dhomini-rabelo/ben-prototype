import { CreateTaskMessageUseCase } from '@/domain/use-cases/tasks/create-task-message'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository } from '@/infra/http/repositories'
import { GeminiAgentProviderService } from '@/infra/services/gemini-agent-provider'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const createTaskMessageUseCase = new CreateTaskMessageUseCase(
  taskRepository,
  new GeminiAgentProviderService(),
)

const taskParamsSchema = z.object({
  id: z.string(),
})

const messageBodySchema = z.object({
  content: z.string().min(1),
})

export async function createTaskMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = messageBodySchema.parse(req.body)

    const result = await createTaskMessageUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      message: body.content,
    })

    return res.status(HttpStatus.OK).json({
      item: TaskPresenter.toHttp(result.item),
      benMessage: result.benMessage,
    })
  } catch (err) {
    next(err)
  }
}
