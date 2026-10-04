import { GetAgentPreferencesUseCase } from '@/domain/use-cases/agent-preferences/get-agent-preferences'
import { AgentPreferencesPresenter } from '@/infra/http/presenters/agent-preferences-presenter'
import { userRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'

const getAgentPreferencesUseCase = new GetAgentPreferencesUseCase(
  userRepository,
)

export async function getAgentPreferences(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getAgentPreferencesUseCase.execute({
      userId: req.userId,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: AgentPreferencesPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
