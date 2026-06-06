import { TopicRepository } from '@/adapters/repositories/topic-repository'
import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'
import { createID } from '@/modules/domain/entity/id'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  topics: Array<{ topic: string; summary: string }>
  messageId?: string
}

export class PersistTopicSummariesUseCase implements UseCase<void> {
  constructor(
    private topicRepository: TopicRepository,
    private topicSummaryRepository: TopicSummaryRepository,
  ) {}

  async execute(payload: Payload): Promise<void> {
    for (const topicSummary of payload.topics) {
      await this.ensureTopicExists(payload.userId, topicSummary.topic)
      await this.recordTopicSummary(
        payload.userId,
        topicSummary.topic,
        topicSummary.summary,
        payload.messageId ?? null,
      )
    }
  }

  private async ensureTopicExists(userId: string, key: string): Promise<void> {
    const existingTopic = await this.topicRepository.findFirst({
      userId: createID(userId),
      key,
    })

    if (!existingTopic) {
      await this.topicRepository.create({
        userId: createID(userId),
        key,
        createdAt: new Date(),
      })
    }
  }

  private async recordTopicSummary(
    userId: string,
    topicKey: string,
    summary: string,
    messageId: string | null,
  ): Promise<void> {
    await this.topicSummaryRepository.create({
      userId: createID(userId),
      topicKey,
      summary,
      messageId: messageId ? createID(messageId) : null,
      createdAt: new Date(),
    })
  }
}
