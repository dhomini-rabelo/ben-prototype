import { Repository } from '@ben/domain-base'

import { Topic } from '@/domain/entities/topic'

export abstract class TopicRepository extends Repository<Topic> {}
