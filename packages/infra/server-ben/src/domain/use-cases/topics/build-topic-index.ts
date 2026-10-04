import { TopicRepository } from '@/adapters/repositories/topic-repository'
import { TopicKey } from '@ben/adapters'
import { createID } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
}

export class BuildTopicIndexUseCase implements UseCase<TopicKey[]> {
  constructor(private topicRepository: TopicRepository) {}

  async execute(payload: Payload): Promise<TopicKey[]> {
    const topics = await this.topicRepository.findMany({
      userId: createID(payload.userId),
    })

    return [...new Set(topics.map((topic) => topic.props.key))]
  }
}
