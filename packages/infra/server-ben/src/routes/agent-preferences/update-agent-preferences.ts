import { UpdateAgentPreferencesUseCase } from '@ben/domain-user/application/use-cases/agent-preferences/update-agent-preferences'
import { AgentPreferencesPresenter } from '@ben/server-ben/presenters/agent-preferences-presenter'
import { userRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const updateAgentPreferencesUseCase = new UpdateAgentPreferencesUseCase(
  userRepository,
)

const bodySchema = z.object({
  modelSlug: z.string(),
  effort: z.string(),
})

export async function updateAgentPreferences(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const body = bodySchema.parse(request.body)

    const result = await updateAgentPreferencesUseCase.execute({
      userId: request.userId,
      modelSlug: body.modelSlug,
      effort: body.effort,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: AgentPreferencesPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
