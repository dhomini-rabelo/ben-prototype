import { AgentCallTrace } from '@/adapters/agent-call-trace'
import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export type MessageRole = 'user' | 'ben'

export type MessageCaptureKind = 'note' | 'reminder' | 'task'

export interface MessageCapture {
  kind: MessageCaptureKind
  itemId: ID
}

export interface MessageProps {
  userId: ID
  role: MessageRole
  content: string
  capture: MessageCapture | null
  trace: AgentCallTrace | null
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
