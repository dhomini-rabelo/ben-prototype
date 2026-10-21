import { UserRepository } from '@ben/domain-user/application/repositories/user'
import {
  isUserLanguage,
  resolveUserPreferences,
  UserPreferences,
} from '@ben/domain-user/application/utils/user-preferences'
import { createID } from '@ben/domain-base'
import { ValidationError } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  language?: string
  showUsdCost?: boolean
}

export class UpdateUserPreferencesUseCase implements UseCase<
  ItemResponse<UserPreferences>
> {
  constructor(private userRepository: UserRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<UserPreferences>> {
    const user = await this.userRepository.get({
      id: createID(payload.userId),
    })
    const changes = this.buildChanges(payload)

    if (Object.keys(changes).length === 0) {
      return { item: resolveUserPreferences(user.props) }
    }

    await this.userRepository.update(user.id, changes)

    return { item: resolveUserPreferences({ ...user.props, ...changes }) }
  }

  private buildChanges(payload: Payload): Partial<UserPreferences> {
    const changes: Partial<UserPreferences> = {}

    if (payload.language !== undefined) {
      if (!isUserLanguage(payload.language)) {
        throw new ValidationError({
          errorField: 'language',
          code: 'UNSUPPORTED_USER_LANGUAGE',
        })
      }
      changes.language = payload.language
    }

    if (payload.showUsdCost !== undefined) {
      changes.showUsdCost = payload.showUsdCost
    }

    return changes
  }
}
