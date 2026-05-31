import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export interface UserProps {
  name: string
  username: string
  email: string
  photoUrl: string
  providerId: string
}

export class User extends Entity<UserProps> {
  static create(props: UserProps) {
    return new User(props)
  }

  static reference(id: ID, props: UserProps) {
    return new User(props, id)
  }
}
