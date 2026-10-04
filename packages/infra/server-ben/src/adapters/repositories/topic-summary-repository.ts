import { Repository } from '@ben/domain-base'

import { TopicSummary } from '@/domain/entities/topic-summary'

export abstract class TopicSummaryRepository extends Repository<TopicSummary> {}
