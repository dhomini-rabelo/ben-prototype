import { EntityWithStatic } from '@ben/domain-base'

import { TopicSummary } from '@ben/domain-topic/enterprise/entities/topic-summary'
import { TopicSummaryRepository } from '@ben/domain-topic/application/repositories/topic-summary'

import { SqliteRepository } from './sqlite-repository'

export class SqliteTopicSummaryRepository
  extends SqliteRepository<TopicSummary>
  implements TopicSummaryRepository
{
  protected entity = TopicSummary as unknown as EntityWithStatic<TopicSummary>
  protected tableName = 'topic_summaries'
}
