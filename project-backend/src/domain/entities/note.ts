import { Entity } from '@/modules/domain/entity/entity'
import { ID } from '@/modules/domain/entity/id'

export interface NoteProps {
  userId: string
  title: string
  body: string
  createdAt: Date
}

export class Note extends Entity<NoteProps> {
  static create(props: NoteProps) {
    return new Note(props)
  }

  static reference(id: ID, props: NoteProps) {
    return new Note(props, id)
  }
}
