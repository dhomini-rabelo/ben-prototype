import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'
import { HistoryContextResult } from '@/adapters/agent-provider'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  topics: string[]
}

export class GetHistoryContextUseCase implements UseCase<HistoryContextResult> {
  constructor(private topicSummaryRepository: TopicSummaryRepository) {}

  async execute(payload: Payload): Promise<HistoryContextResult> {
    const result: HistoryContextResult = {}

    for (const topic of payload.topics) {
      const summaries = await this.topicSummaryRepository.findMany({
        userId: payload.userId,
        topicKey: topic,
      })

      result[topic] = summaries.map((summary) => ({
        id: summary.id.toValue(),
        summary: summary.props.summary,
      }))
    }

    return result
  }
}
