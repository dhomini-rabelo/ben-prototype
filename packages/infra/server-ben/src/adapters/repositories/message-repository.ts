import { Repository } from '@ben/domain-base'

import { Message } from '@/domain/entities/message'

export abstract class MessageRepository extends Repository<Message> {}
