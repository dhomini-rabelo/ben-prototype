import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'
import {
  IndexFieldSet,
  RepositoryIndexes,
} from '@/modules/domain/repository/repository'

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

export enum UserIndexes {
  PROVIDER_ID = 'idx-providerId',
}

export const UserIndexFieldSet: Record<
  RepositoryIndexes<UserIndexes>,
  IndexFieldSet<User>
> = {
  id: ['id'],
  [UserIndexes.PROVIDER_ID]: ['providerId'],
}
