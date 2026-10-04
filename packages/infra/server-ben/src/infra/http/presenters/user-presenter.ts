import { User, UserProps } from '@/domain/entities/user'
import { Serialize, WithID } from '@ben/domain-base'

export class UserPresenter {
  static toHttp(
    user: User,
  ): Omit<
    Serialize<WithID<UserProps>>,
    'createdAt' | 'agentModelSlug' | 'agentEffort'
  > {
    return {
      id: user.id.toValue(),
      name: user.props.name,
      username: user.props.username,
      email: user.props.email,
      avatarUrl: user.props.avatarUrl,
      providerId: user.props.providerId,
    }
  }
}
