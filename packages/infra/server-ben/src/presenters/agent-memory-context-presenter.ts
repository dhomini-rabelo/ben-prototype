import { ActiveConversation, UserMemory } from '@ben/adapters'
import { Conversation } from '@ben/domain-topic/enterprise/entities/conversation'
import { Memory } from '@ben/domain-topic/enterprise/entities/memory'
import { toConversationKey } from '@ben/domain-topic/application/utils/conversations'

export class AgentMemoryContextPresenter {
  static toActiveConversation(conversation: Conversation): ActiveConversation {
    return {
      key: toConversationKey(conversation),
      summary: conversation.props.summary,
    }
  }

  static toUserMemory(memory: Memory): UserMemory {
    return { key: memory.props.key, value: memory.props.value }
  }
}
