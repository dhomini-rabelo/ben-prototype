import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Message } from '@/domain/entities/message'
import { MessageRepository } from '@/adapters/repositories/message-repository'

export class InMemoryMessageRepository
  extends InMemoryRepository<Message>
  implements MessageRepository
{
  protected entity = Message as unknown as EntityWithStatic<Message>
}
