import { UserRepository } from '@/adapters/repositories/user-repository'
import {
  AgentModelSelection,
  resolveAgentSelection,
} from '@/domain/utils/agent-models'
import { createID } from '@/modules/domain/entity/id'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
}

export class GetAgentPreferencesUseCase implements UseCase<
  ItemResponse<AgentModelSelection>
> {
  constructor(private userRepository: UserRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<AgentModelSelection>> {
    const user = await this.userRepository.get({
      id: createID(payload.userId),
    })

    return { item: resolveAgentSelection(user.props) }
  }
}
