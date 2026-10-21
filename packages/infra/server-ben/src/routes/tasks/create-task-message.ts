import { GetAgentPreferencesUseCase } from '@ben/domain-user/application/use-cases/agent-preferences/get-agent-preferences'
import { CreateTaskMessageUseCase } from '@ben/domain-task/application/use-cases/tasks/create-task-message'
import { TaskPresenter } from '@ben/server-ben/presenters/task-presenter'
import { taskRepository, userRepository } from '@ben/server-ben/repositories'
import { BenAgentProviderService } from '@ben/infra-adapters'
import { HttpStatus } from '@ben/modules-utils'
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
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = messageBodySchema.parse(request.body)

    const preferences = await getAgentPreferencesUseCase.execute({
      userId: request.userId,
    })

    const result = await createTaskMessageUseCase.execute({
      userId: request.userId,
      taskId: taskParamsSchema.parse(request.params).id,
      message: body.content,
      model: preferences.item,
    })

    return response.status(HttpStatus.OK).json({
      item: TaskPresenter.toHttp(result.item),
      benMessage: result.benMessage,
      costUsd: result.costUsd,
    })
  } catch (error) {
    next(error)
  }
}
