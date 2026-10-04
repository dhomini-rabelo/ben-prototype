import { GetAgentPreferencesUseCase } from '@/domain/use-cases/agent-preferences/get-agent-preferences'
import { CreateTaskMessageUseCase } from '@/domain/use-cases/tasks/create-task-message'
import { TaskPresenter } from '@/infra/http/presenters/task-presenter'
import { taskRepository, userRepository } from '@/infra/http/repositories'
import { BenAgentProviderService } from '@/infra/services/ben-agent-provider'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const createTaskMessageUseCase = new CreateTaskMessageUseCase(
  taskRepository,
  new BenAgentProviderService(),
)
const getAgentPreferencesUseCase = new GetAgentPreferencesUseCase(
  userRepository,
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

    const preferences = await getAgentPreferencesUseCase.execute({
      userId: req.userId,
    })

    const result = await createTaskMessageUseCase.execute({
      userId: req.userId,
      taskId: taskParamsSchema.parse(req.params).id,
      message: body.content,
      model: preferences.item,
    })

    return res.status(HttpStatus.OK).json({
      item: TaskPresenter.toHttp(result.item),
      benMessage: result.benMessage,
    })
  } catch (err) {
    next(err)
  }
}
