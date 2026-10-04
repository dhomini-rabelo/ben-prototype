import { EntityWithStatic } from '@ben/domain-base'

import { User } from '@ben/domain-user/enterprise/entities/user'
import { UserRepository } from '@ben/domain-user/application/repositories/user'

import { SqliteRepository } from './sqlite-repository'

export class SqliteUserRepository
  extends SqliteRepository<User>
  implements UserRepository
{
  protected entity = User as unknown as EntityWithStatic<User>
  protected tableName = 'users'
}
