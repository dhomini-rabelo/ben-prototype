import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { TopicSummary } from '@/domain/entities/topic-summary'
import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'

export class InMemoryTopicSummaryRepository
  extends InMemoryRepository<TopicSummary>
  implements TopicSummaryRepository
{
  protected entity = TopicSummary as unknown as EntityWithStatic<TopicSummary>
}
