import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export interface MemoryProps {
  userId: ID
  key: string
  value: string
  conversationId: ID | null
  createdAt: Date
  updatedAt: Date
}

export class Memory extends Entity<MemoryProps> {
  static create(props: MemoryProps) {
    return new Memory(props)
  }

  static reference(id: ID, props: MemoryProps) {
    return new Memory(props, id)
  }
}
