import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { User } from '@/domain/entities/user'
import { UserRepository } from '@/adapters/repositories/user-repository'

export class InMemoryUserRepository
  extends InMemoryRepository<User>
  implements UserRepository
{
  protected entity = User as unknown as EntityWithStatic<User>
}
