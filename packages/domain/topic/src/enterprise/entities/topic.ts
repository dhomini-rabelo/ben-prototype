import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export interface TopicProps {
  userId: ID
  key: string
  createdAt: Date
}

export class Topic extends Entity<TopicProps> {
  static create(props: TopicProps) {
    return new Topic(props)
  }

  static reference(id: ID, props: TopicProps) {
    return new Topic(props, id)
  }
}
