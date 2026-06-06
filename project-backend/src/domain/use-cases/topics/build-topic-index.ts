import { TopicRepository } from '@/adapters/repositories/topic-repository'
import { TopicKey } from '@/adapters/agent-provider'
import { createID } from '@/modules/domain/entity/id'
import { UseCase } from '@/modules/domain/use-case'

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
