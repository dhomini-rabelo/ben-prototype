import { EntityWithStatic } from '@/modules/domain/entity/entity'

import { Topic } from '@/domain/entities/topic'
import { TopicRepository } from '@/adapters/repositories/topic-repository'

import { SqliteRepository } from './sqlite-repository'

export class SqliteTopicRepository
  extends SqliteRepository<Topic>
  implements TopicRepository
{
  protected entity = Topic as unknown as EntityWithStatic<Topic>
  protected tableName = 'topics'
}
