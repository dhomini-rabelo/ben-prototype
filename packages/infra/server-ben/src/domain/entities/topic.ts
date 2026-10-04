import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

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
