import { Repository } from '@/modules/domain/repository/repository'

import { Topic } from '@/domain/entities/topic'

export abstract class TopicRepository extends Repository<Topic> {}
