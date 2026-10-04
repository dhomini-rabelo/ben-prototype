import { Repository } from '@ben/domain-base'

import { Message } from '@ben/domain-chat/enterprise/entities/message'

export abstract class MessageRepository extends Repository<Message> {}
