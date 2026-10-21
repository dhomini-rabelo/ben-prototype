import { TopicSummaryRepository } from '@ben/domain-topic/application/repositories/topic-summary'
import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'
import {
  findActiveConversation,
  toConversationKey,
} from '@ben/domain-topic/application/utils/conversations'
import { HistoryContextResult } from '@ben/adapters'
import { createID } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  topics: string[]
}

export class GetHistoryContextUseCase implements UseCase<HistoryContextResult> {
  constructor(
    private topicSummaryRepository: TopicSummaryRepository,
    private conversationRepository: ConversationRepository,
  ) {}

  async execute(payload: Payload): Promise<HistoryContextResult> {
    const historyContext: HistoryContextResult = {}

    for (const topic of payload.topics) {
      historyContext[topic] = await this.collectTopicSummaries(
        payload.userId,
        topic,
      )
    }

    await this.addActiveConversation(payload.userId, historyContext)

    return historyContext
  }

  private async addActiveConversation(
    userId: string,
    historyContext: HistoryContextResult,
  ): Promise<void> {
    const activeConversation = await findActiveConversation(
      this.conversationRepository,
      userId,
      new Date(),
    )

    if (activeConversation) {
      historyContext[toConversationKey(activeConversation)] = [
        {
          id: activeConversation.id.toValue(),
          summary: activeConversation.props.summary,
        },
      ]
    }
  }

  private async collectTopicSummaries(
    userId: string,
    topicKey: string,
  ): Promise<HistoryContextResult[string]> {
    const summaries = await this.topicSummaryRepository.findMany({
      userId: createID(userId),
      topicKey,
    })

    return summaries.map((summary) => ({
      id: summary.id.toValue(),
      summary: summary.props.summary,
    }))
  }
}
