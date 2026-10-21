import { Repository } from '@ben/domain-base'

import { Conversation } from '@ben/domain-topic/enterprise/entities/conversation'

export abstract class ConversationRepository extends Repository<Conversation> {}
