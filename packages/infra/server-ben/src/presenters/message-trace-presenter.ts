import {
  Message,
  MessageProps,
} from '@ben/domain-chat/enterprise/entities/message'
import { Serialize, WithID } from '@ben/domain-base'

export class MessageTracePresenter {
  static toHttp(
    message: Message,
  ): Omit<
    Serialize<WithID<MessageProps>>,
    'userId' | 'content' | 'capture' | 'costUsd' | 'interactionCostUsd'
  > {
    return {
      id: message.id.toValue(),
      role: message.props.role,
      createdAt: message.props.createdAt.toISOString(),
      trace: message.props.trace ?? null,
    }
  }
}
