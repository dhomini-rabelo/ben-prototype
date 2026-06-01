import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { Topic } from '@/domain/entities/topic'
import { TopicRepository } from './topic-repository'

export class InMemoryTopicRepository
  extends InMemoryRepository<Topic>
  implements TopicRepository
{
  protected entity = Topic as unknown as EntityWithStatic<Topic>
}
