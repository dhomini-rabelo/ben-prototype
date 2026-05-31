import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export type MessageRole = 'user' | 'ben'

export type MessageCaptureKind = 'note' | 'reminder' | 'task'

export interface MessageCapture {
  kind: MessageCaptureKind
  itemId: string
}

export interface MessageProps {
  userId: string
  role: MessageRole
  content: string
  capture: MessageCapture | null
  createdAt: Date
}

export class Message extends Entity<MessageProps> {
  static create(props: MessageProps) {
    return new Message(props)
  }

  static reference(id: ID, props: MessageProps) {
    return new Message(props, id)
  }
}
