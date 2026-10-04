import { UpdateAgentPreferencesUseCase } from '@/domain/use-cases/agent-preferences/update-agent-preferences'
import { AgentPreferencesPresenter } from '@/infra/http/presenters/agent-preferences-presenter'
import { userRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
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
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = bodySchema.parse(req.body)

    const result = await updateAgentPreferencesUseCase.execute({
      userId: req.userId,
      modelSlug: body.modelSlug,
      effort: body.effort,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: AgentPreferencesPresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
