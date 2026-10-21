import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export interface ConversationProps {
  userId: ID
  slug: string
  summary: string
  lastMessageAt: Date
  expiresAt: Date
  createdAt: Date
}

export class Conversation extends Entity<ConversationProps> {
  static create(props: ConversationProps) {
    return new Conversation(props)
  }

  static reference(id: ID, props: ConversationProps) {
    return new Conversation(props, id)
  }
}
