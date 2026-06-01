import { TopicRepository } from '@/adapters/repositories/topic-repository'
import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'
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
    for (const { topic, summary } of payload.topics) {
      const existingTopic = await this.topicRepository.findFirst({
        userId: payload.userId,
        key: topic,
      })

      if (!existingTopic) {
        await this.topicRepository.create({
          userId: payload.userId,
          key: topic,
          createdAt: new Date(),
        })
      }

      await this.topicSummaryRepository.create({
        userId: payload.userId,
        topicKey: topic,
        summary,
        messageId: payload.messageId ?? null,
        createdAt: new Date(),
      })
    }
  }
}
