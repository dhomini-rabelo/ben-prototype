import { EntityWithStatic } from '@ben/domain-base'

import { Memory } from '@ben/domain-topic/enterprise/entities/memory'
import { MemoryRepository } from '@ben/domain-topic/application/repositories/memory'

import { SqliteRepository } from '@ben/infra-db/repos/sqlite/sqlite-repository'

export class SqliteMemoryRepository
  extends SqliteRepository<Memory>
  implements MemoryRepository
{
  protected entity = Memory as unknown as EntityWithStatic<Memory>
  protected tableName = 'memories'
}
