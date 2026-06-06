import { Note } from '@/domain/entities/note'

interface NoteHttp {
  id: string
  title: string
  body: string
  capturedAt: string
}

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
