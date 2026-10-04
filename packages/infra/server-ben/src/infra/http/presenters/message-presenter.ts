import { CaptureView } from '@/adapters/capture-view'
import { Message, MessageProps } from '@/domain/entities/message'
import { Serialize, WithID } from '@ben/domain-base'
import { OverWrite } from '@ben/modules-utils'

export class MessagePresenter {
  static toHttp(
    message: Message,
    capture: CaptureView | null = null,
  ): OverWrite<
    Omit<Serialize<WithID<MessageProps>>, 'userId' | 'trace'>,
    { capture: CaptureView | null }
  > {
    return {
      id: message.id.toValue(),
      role: message.props.role,
      content: message.props.content,
      capture,
      createdAt: message.props.createdAt.toISOString(),
    }
  }
}
