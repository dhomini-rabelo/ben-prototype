import { EntityWithStatic } from '@/modules/domain/entity/entity'

import { User } from '@/domain/entities/user'
import { UserRepository } from '@/adapters/repositories/user-repository'

import { SqliteRepository } from './sqlite-repository'

export class SqliteUserRepository
  extends SqliteRepository<User>
  implements UserRepository
{
  protected entity = User as unknown as EntityWithStatic<User>
  protected tableName = 'users'
}
