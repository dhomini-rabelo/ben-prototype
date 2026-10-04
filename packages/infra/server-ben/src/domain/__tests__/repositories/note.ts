import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Note } from '@/domain/entities/note'
import { NoteRepository } from '@/adapters/repositories/note-repository'

export class InMemoryNoteRepository
  extends InMemoryRepository<Note>
  implements NoteRepository
{
  protected entity = Note as unknown as EntityWithStatic<Note>
}
