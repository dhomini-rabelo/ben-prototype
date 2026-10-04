import { GetAgentPreferencesUseCase } from '@ben/domain-user/application/use-cases/agent-preferences/get-agent-preferences'
import { AgentPreferencesPresenter } from '@ben/server-ben/presenters/agent-preferences-presenter'
import { userRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'

const getAgentPreferencesUseCase = new GetAgentPreferencesUseCase(
  userRepository,
)

export async function getAgentPreferences(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await getAgentPreferencesUseCase.execute({
      userId: request.userId,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: AgentPreferencesPresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
