import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Message } from '@ben/domain-chat/enterprise/entities/message'
import { MessageRepository } from '@ben/domain-chat/application/repositories/message'

export class InMemoryMessageRepository
  extends InMemoryRepository<Message>
  implements MessageRepository
{
  protected entity = Message as unknown as EntityWithStatic<Message>
}
