import { EntityWithStatic } from '@ben/domain-base'

import { Message } from '@/domain/entities/message'
import { MessageRepository } from '@/adapters/repositories/message-repository'

import { SqliteRepository } from './sqlite-repository'

export class SqliteMessageRepository
  extends SqliteRepository<Message>
  implements MessageRepository
{
  protected entity = Message as unknown as EntityWithStatic<Message>
  protected tableName = 'messages'
}
