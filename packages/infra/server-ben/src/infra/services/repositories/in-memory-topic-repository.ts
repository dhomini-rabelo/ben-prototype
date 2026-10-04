import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Topic } from '@ben/domain-topic/enterprise/entities/topic'
import { TopicRepository } from '@ben/domain-topic/application/repositories/topic'

export class InMemoryTopicRepository
  extends InMemoryRepository<Topic>
  implements TopicRepository
{
  protected entity = Topic as unknown as EntityWithStatic<Topic>
}
