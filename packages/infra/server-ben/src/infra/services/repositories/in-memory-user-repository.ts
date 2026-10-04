import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { User } from '@ben/domain-user/enterprise/entities/user'
import { UserRepository } from '@ben/domain-user/application/repositories/user'

export class InMemoryUserRepository
  extends InMemoryRepository<User>
  implements UserRepository
{
  protected entity = User as unknown as EntityWithStatic<User>
}
