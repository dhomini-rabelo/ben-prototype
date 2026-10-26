import { CaptureView } from '@ben/domain-chat/application/types/capture-view'
import {
  Message,
  MessageProps,
} from '@ben/domain-chat/enterprise/entities/message'
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
      costUsd: message.props.costUsd ?? null,
      interactionCostUsd: message.props.interactionCostUsd ?? null,
      voiceDurationMs: message.props.voiceDurationMs ?? null,
      createdAt: message.props.createdAt.toISOString(),
    }
  }
}
