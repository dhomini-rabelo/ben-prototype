import { CaptureView } from '@/adapters/capture-view'
import { Message } from '@/domain/entities/message'

export class MessagePresenter {
  static toHttp(message: Message, capture: CaptureView | null = null) {
    return {
      id: message.id.toValue(),
      role: message.props.role,
      content: message.props.content,
      capture,
      createdAt: message.props.createdAt.toISOString(),
    }
  }
}
