import { Repository } from '@ben/domain-base'

import { TopicSummary } from '@ben/domain-topic/enterprise/entities/topic-summary'

export abstract class TopicSummaryRepository extends Repository<TopicSummary> {}
