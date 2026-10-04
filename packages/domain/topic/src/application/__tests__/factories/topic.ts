import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import { Topic, TopicProps } from '@ben/domain-topic/enterprise/entities/topic'
import { TopicRepository } from '@ben/domain-topic/application/repositories/topic'

export function createTopicData(data: Partial<TopicProps> = {}): TopicProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    key: data.key !== undefined ? data.key : `reminder:work:${some.text()}`,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
  }
}

export class TopicFactory implements Factory<Topic, TopicProps> {
  constructor(private topicRepository: TopicRepository) {}

  async create(data: Partial<TopicProps> = {}) {
    return this.topicRepository.create(createTopicData(data))
  }

  async createMany(
    commonData: Partial<TopicProps> = {},
    specificData: Partial<TopicProps>[] = [],
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
