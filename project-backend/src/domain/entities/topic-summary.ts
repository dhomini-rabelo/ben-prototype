import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

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
