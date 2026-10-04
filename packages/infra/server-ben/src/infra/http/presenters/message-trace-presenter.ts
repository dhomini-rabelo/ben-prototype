import { Message, MessageProps } from '@/domain/entities/message'
import { Serialize, WithID } from '@ben/domain-base'

export class MessageTracePresenter {
  static toHttp(
    message: Message,
  ): Omit<Serialize<WithID<MessageProps>>, 'userId' | 'content' | 'capture'> {
    return {
      id: message.id.toValue(),
      role: message.props.role,
      createdAt: message.props.createdAt.toISOString(),
      trace: message.props.trace ?? null,
    }
  }
}
