import { UserRepository } from '@/adapters/repositories/user-repository'
import {
  AgentModelSelection,
  findAgentModel,
} from '@/domain/utils/agent-models'
import { createID } from '@/modules/domain/entity/id'
import { ValidationError } from '@/modules/domain/domain-errors'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  modelSlug: string
  effort: string
}

export class UpdateAgentPreferencesUseCase implements UseCase<
  ItemResponse<AgentModelSelection>
> {
  constructor(private userRepository: UserRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<AgentModelSelection>> {
    const user = await this.userRepository.get({
      id: createID(payload.userId),
    })
    const selection = this.requireSupportedSelection(
      payload.modelSlug,
      payload.effort,
    )

    await this.userRepository.update(user.id, {
      agentModelSlug: selection.modelSlug,
      agentEffort: selection.effort,
    })

    return { item: selection }
  }

  private requireSupportedSelection(
    modelSlug: string,
    effort: string,
  ): AgentModelSelection {
    const model = findAgentModel(modelSlug)

    if (!model) {
      throw new ValidationError({
        errorField: 'modelSlug',
        code: 'UNKNOWN_AGENT_MODEL',
      })
    }

    const supportedEffort = model.efforts.find((item) => item === effort)

    if (!supportedEffort) {
      throw new ValidationError({
        errorField: 'effort',
        code: 'UNSUPPORTED_AGENT_EFFORT',
      })
    }

    return { modelSlug: model.slug, effort: supportedEffort }
  }
}
