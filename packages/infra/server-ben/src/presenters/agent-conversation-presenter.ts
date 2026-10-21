import {
  ConversationHistoryPage,
  ConversationMessage,
  ConversationMessageRole,
} from '@ben/adapters'
import { CursorPaginationResponse } from '@ben/domain-base'
import {
  Message,
  MessageRole,
} from '@ben/domain-chat/enterprise/entities/message'

const conversationRoleByMessageRole: Record<
  MessageRole,
  ConversationMessageRole
> = {
  user: 'user',
  ben: 'assistant',
}

export class AgentConversationPresenter {
  static toConversationMessage(message: Message): ConversationMessage {
    return {
      role: conversationRoleByMessageRole[message.props.role],
      content: message.props.content,
      createdAt: message.props.createdAt.toISOString(),
    }
  }

  static toHistoryPage(
    page: CursorPaginationResponse<Message>,
  ): ConversationHistoryPage {
    return {
      messages: page.items.map(
        AgentConversationPresenter.toConversationMessage,
      ),
      nextCursor: page.nextCursor,
    }
  }
}
