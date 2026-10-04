import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { TopicSummary } from '@ben/domain-topic/enterprise/entities/topic-summary'
import { TopicSummaryRepository } from '@ben/domain-topic/application/repositories/topic-summary'

export class InMemoryTopicSummaryRepository
  extends InMemoryRepository<TopicSummary>
  implements TopicSummaryRepository
{
  protected entity = TopicSummary as unknown as EntityWithStatic<TopicSummary>
}
