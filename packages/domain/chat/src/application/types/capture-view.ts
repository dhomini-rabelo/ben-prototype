import { MessageCaptureKind } from '@ben/domain-chat/enterprise/entities/message'

export interface CaptureView {
  kind: MessageCaptureKind
  itemId: string
  title: string
  meta: string | null
}
