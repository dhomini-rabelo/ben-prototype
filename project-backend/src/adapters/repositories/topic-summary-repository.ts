import { Repository } from '@/modules/domain/repository/repository'

import { TopicSummary } from '@/domain/entities/topic-summary'

export abstract class TopicSummaryRepository extends Repository<TopicSummary> {}
