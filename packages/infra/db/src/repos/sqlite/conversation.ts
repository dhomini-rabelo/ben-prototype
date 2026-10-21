import { EntityWithStatic } from '@ben/domain-base'

import { Conversation } from '@ben/domain-topic/enterprise/entities/conversation'
import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'

import { SqliteRepository } from '@ben/infra-db/repos/sqlite/sqlite-repository'

export class SqliteConversationRepository
  extends SqliteRepository<Conversation>
  implements ConversationRepository
{
  protected entity = Conversation as unknown as EntityWithStatic<Conversation>
  protected tableName = 'conversations'
}
