import { User, UserProps } from '@/domain/entities/user'
import { Serialize, WithID } from '@/modules/domain/types'

export class UserPresenter {
  static toHttp(user: User): Omit<Serialize<WithID<UserProps>>, 'createdAt'> {
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
