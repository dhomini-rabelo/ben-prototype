import { Repository } from '@/modules/domain/repository/repository'

import { Message } from '@/domain/entities/message'

export abstract class MessageRepository extends Repository<Message> {}
