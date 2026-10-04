import { EntityWithStatic } from '@ben/domain-base'

import { Topic } from '@ben/domain-topic/enterprise/entities/topic'
import { TopicRepository } from '@ben/domain-topic/application/repositories/topic'

import { SqliteRepository } from './sqlite-repository'

export class SqliteTopicRepository
  extends SqliteRepository<Topic>
  implements TopicRepository
{
  protected entity = Topic as unknown as EntityWithStatic<Topic>
  protected tableName = 'topics'
}
