import { Repository } from '@ben/domain-base'

import { Topic } from '@ben/domain-topic/enterprise/entities/topic'

export abstract class TopicRepository extends Repository<Topic> {}
