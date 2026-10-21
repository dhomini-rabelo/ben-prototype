import { Repository } from '@ben/domain-base'

import { Memory } from '@ben/domain-topic/enterprise/entities/memory'

export abstract class MemoryRepository extends Repository<Memory> {}
