import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { Message } from '@/domain/entities/message'
import { MessageRepository } from '@/adapters/repositories/message-repository'

export class InMemoryMessageRepository
  extends InMemoryRepository<Message>
  implements MessageRepository
{
  protected entity = Message as unknown as EntityWithStatic<Message>
}
