import { EntityWithStatic } from '@ben/domain-base'

import { Message } from '@ben/domain-chat/enterprise/entities/message'
import { MessageRepository } from '@ben/domain-chat/application/repositories/message'

import { SqliteRepository } from '@ben/infra-db/repos/sqlite/sqlite-repository'

export class SqliteMessageRepository
  extends SqliteRepository<Message>
  implements MessageRepository
{
  protected entity = Message as unknown as EntityWithStatic<Message>
  protected tableName = 'messages'
}
