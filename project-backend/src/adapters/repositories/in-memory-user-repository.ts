import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { User } from '@/domain/entities/user'
import { UserRepository } from './user-repository'

export class InMemoryUserRepository
  extends InMemoryRepository<User>
  implements UserRepository
{
  protected entity = User as unknown as EntityWithStatic<User>
}
