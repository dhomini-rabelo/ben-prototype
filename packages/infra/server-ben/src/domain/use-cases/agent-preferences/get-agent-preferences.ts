import { AgentModelSelection } from '@ben/adapters'
import { UserRepository } from '@/adapters/repositories/user-repository'
import { resolveAgentSelection } from '@/domain/utils/agent-models'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

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
