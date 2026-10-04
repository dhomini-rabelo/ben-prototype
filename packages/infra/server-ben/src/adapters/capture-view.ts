import { MessageCaptureKind } from '@/domain/entities/message'

export interface CaptureView {
  kind: MessageCaptureKind
  itemId: string
  title: string
  meta: string | null
}
