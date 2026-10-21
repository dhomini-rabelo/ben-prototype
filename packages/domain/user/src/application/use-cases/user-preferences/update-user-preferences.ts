import { UserRepository } from '@ben/domain-user/application/repositories/user'
import {
  isUserLanguage,
  isValidTime,
  resolveUserPreferences,
  UserPreferences,
} from '@ben/domain-user/application/utils/user-preferences'
import { UserProps } from '@ben/domain-user/enterprise/entities/user'
import { createID } from '@ben/domain-base'
import { ValidationError } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  language?: string
  showUsdCost?: boolean
  morningTime?: string
  dailySummaryEnabled?: boolean
  dailySummaryTime?: string
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

  private buildChanges(payload: Payload): Partial<UserProps> {
    const changes: Partial<UserProps> = {}

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

    if (payload.morningTime !== undefined) {
      changes.morningTime = this.parseTime('morningTime', payload.morningTime)
    }

    if (payload.dailySummaryEnabled !== undefined) {
      changes.dailySummaryEnabled = payload.dailySummaryEnabled
    }

    if (payload.dailySummaryTime !== undefined) {
      changes.dailySummaryTime = this.parseTime(
        'dailySummaryTime',
        payload.dailySummaryTime,
      )
    }

    return changes
  }

  private parseTime(field: string, value: string): string {
    if (!isValidTime(value)) {
      throw new ValidationError({
        errorField: field,
        code: 'INVALID_TIME_FORMAT',
      })
    }
    return value
  }
}
