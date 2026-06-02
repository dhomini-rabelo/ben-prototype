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
    const historyContext: HistoryContextResult = {}

    for (const topic of payload.topics) {
      historyContext[topic] = await this.collectTopicSummaries(
        payload.userId,
        topic,
      )
    }

    return historyContext
  }

  private async collectTopicSummaries(
    userId: string,
    topicKey: string,
  ): Promise<HistoryContextResult[string]> {
    const summaries = await this.topicSummaryRepository.findMany({
      userId,
      topicKey,
    })

    return summaries.map((summary) => ({
      id: summary.id.toValue(),
      summary: summary.props.summary,
    }))
  }
}
