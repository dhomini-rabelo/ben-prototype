import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export interface TopicSummaryProps {
  userId: ID
  topicKey: string
  summary: string
  messageId: ID | null
  createdAt: Date
}

export class TopicSummary extends Entity<TopicSummaryProps> {
  static create(props: TopicSummaryProps) {
    return new TopicSummary(props)
  }

  static reference(id: ID, props: TopicSummaryProps) {
    return new TopicSummary(props, id)
  }
}
