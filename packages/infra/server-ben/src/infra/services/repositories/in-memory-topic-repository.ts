import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Topic } from '@/domain/entities/topic'
import { TopicRepository } from '@/adapters/repositories/topic-repository'

export class InMemoryTopicRepository
  extends InMemoryRepository<Topic>
  implements TopicRepository
{
  protected entity = Topic as unknown as EntityWithStatic<Topic>
}
