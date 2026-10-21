import { UserRepository } from '@ben/domain-user/application/repositories/user'
import {
  resolveUserPreferences,
  UserPreferences,
} from '@ben/domain-user/application/utils/user-preferences'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
}

export class GetUserPreferencesUseCase implements UseCase<
  ItemResponse<UserPreferences>
> {
  constructor(private userRepository: UserRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<UserPreferences>> {
    const user = await this.userRepository.get({
      id: createID(payload.userId),
    })

    return { item: resolveUserPreferences(user.props) }
  }
}
