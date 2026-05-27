import { User } from '@/domain/entities/user'

export class UserPresenter {
  static toHttp(user: User) {
    return {
      id: user.id.toValue(),
      name: user.props.name,
      username: user.props.username,
      email: user.props.email,
      photoUrl: user.props.photoUrl,
      providerId: user.props.providerId,
    }
  }
}
