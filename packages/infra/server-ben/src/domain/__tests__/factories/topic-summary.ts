import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import {
  TopicSummary,
  TopicSummaryProps,
} from '@/domain/entities/topic-summary'
import { TopicSummaryRepository } from '@/adapters/repositories/topic-summary-repository'

export function createTopicSummaryData(
  data: Partial<TopicSummaryProps> = {},
): TopicSummaryProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    topicKey:
      data.topicKey !== undefined
        ? data.topicKey
        : `reminder:work:${some.text()}`,
    summary: data.summary !== undefined ? data.summary : some.text(),
    messageId: data.messageId !== undefined ? data.messageId : null,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
  }
}

export class TopicSummaryFactory implements Factory<
  TopicSummary,
  TopicSummaryProps
> {
  constructor(private topicSummaryRepository: TopicSummaryRepository) {}

  async create(data: Partial<TopicSummaryProps> = {}) {
    return this.topicSummaryRepository.create(createTopicSummaryData(data))
  }

  async createMany(
    commonData: Partial<TopicSummaryProps> = {},
    specificData: Partial<TopicSummaryProps>[] = [],
    amount: number = 2,
  ) {
    return Promise.all(
      Array.from({ length: amount }).map((_, index) => {
        return this.create({
          ...commonData,
          ...(specificData[index] || {}),
        })
      }),
    )
  }
}
