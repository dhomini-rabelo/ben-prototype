import { Entity } from '@ben/domain-base'
import { ID } from '@ben/domain-base'

export interface NoteProps {
  userId: ID
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
