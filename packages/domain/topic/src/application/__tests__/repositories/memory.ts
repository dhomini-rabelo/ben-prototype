import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Memory } from '@ben/domain-topic/enterprise/entities/memory'
import { MemoryRepository } from '@ben/domain-topic/application/repositories/memory'

export class InMemoryMemoryRepository
  extends InMemoryRepository<Memory>
  implements MemoryRepository
{
  protected entity = Memory as unknown as EntityWithStatic<Memory>
}
