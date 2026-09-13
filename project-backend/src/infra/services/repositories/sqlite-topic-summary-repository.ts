import { EntityWithStatic } from '@/modules/domain/entity/entity'

import { TopicSummary } from '@/domain/entities/topic-summary'
import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'

import { SqliteRepository } from './sqlite-repository'

export class SqliteTopicSummaryRepository
  extends SqliteRepository<TopicSummary>
  implements TopicSummaryRepository
{
  protected entity = TopicSummary as unknown as EntityWithStatic<TopicSummary>
  protected tableName = 'topic_summaries'
}
