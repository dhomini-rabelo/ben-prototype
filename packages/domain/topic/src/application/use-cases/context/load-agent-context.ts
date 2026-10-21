import { ConversationRepository } from '@ben/domain-topic/application/repositories/conversation'
import { MemoryRepository } from '@ben/domain-topic/application/repositories/memory'
import { Conversation } from '@ben/domain-topic/enterprise/entities/conversation'
import { Memory } from '@ben/domain-topic/enterprise/entities/memory'
import { findActiveConversation } from '@ben/domain-topic/application/utils/conversations'
import { createID } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
}

interface Response {
  activeConversation: Conversation | null
  memories: Memory[]
}

export class LoadAgentContextUseCase implements UseCase<Response> {
  constructor(
    private conversationRepository: ConversationRepository,
    private memoryRepository: MemoryRepository,
  ) {}

  async execute(payload: Payload): Promise<Response> {
    const activeConversation = await findActiveConversation(
      this.conversationRepository,
      payload.userId,
      new Date(),
    )
    const memories = await this.memoryRepository.findMany({
      userId: createID(payload.userId),
    })

    return {
      activeConversation,
      memories: memories.sort((first, second) =>
        first.props.key.localeCompare(second.props.key),
      ),
    }
  }
}
