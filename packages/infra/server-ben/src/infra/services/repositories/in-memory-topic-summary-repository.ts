import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { TopicSummary } from '@/domain/entities/topic-summary'
import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'

export class InMemoryTopicSummaryRepository
  extends InMemoryRepository<TopicSummary>
  implements TopicSummaryRepository
{
  protected entity = TopicSummary as unknown as EntityWithStatic<TopicSummary>
}
