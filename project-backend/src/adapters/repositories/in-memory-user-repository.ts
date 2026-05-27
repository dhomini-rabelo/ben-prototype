import { EntityWithStatic } from '@/modules/domain/entity/entity'
import {
  InMemoryRepository,
  RepositoryIndexes,
  IndexFieldSet,
} from '@/modules/domain/repository/repository'

import { User, UserIndexes, UserIndexFieldSet } from '@/domain/entities/user'
import { UserRepository } from './user-repository'

export class InMemoryUserRepository
  extends InMemoryRepository<User, UserIndexes>
  implements UserRepository
{
  protected entity = User as unknown as EntityWithStatic<User>
  protected indexes: Record<
    RepositoryIndexes<UserIndexes>,
    IndexFieldSet<User>
  > = UserIndexFieldSet
}
