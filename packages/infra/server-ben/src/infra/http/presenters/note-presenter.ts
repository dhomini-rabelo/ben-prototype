import { Note, NoteProps } from '@/domain/entities/note'
import { Serialize, WithID } from '@ben/domain-base'
import { OverWrite } from '@ben/modules-utils'

type NoteHttp = OverWrite<
  Omit<Serialize<WithID<NoteProps>>, 'userId' | 'createdAt'>,
  { capturedAt: string }
>

export class NotePresenter {
  static toHttp(note: Note): NoteHttp {
    return {
      id: note.id.toValue(),
      title: note.props.title,
      body: note.props.body,
      capturedAt: note.props.createdAt.toISOString(),
    }
  }

  static toListItemHttp(note: Note): NoteHttp {
    return NotePresenter.toHttp(note)
  }
}
