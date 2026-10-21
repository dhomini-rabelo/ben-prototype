import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Conversation } from '@ben/domain-topic/enterprise/entities/conversation'
import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'

export class InMemoryConversationRepository
  extends InMemoryRepository<Conversation>
  implements ConversationRepository
{
  protected entity = Conversation as unknown as EntityWithStatic<Conversation>
}
