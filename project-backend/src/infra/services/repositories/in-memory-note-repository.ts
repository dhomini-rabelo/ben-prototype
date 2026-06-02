import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { Note } from '@/domain/entities/note'
import { NoteRepository } from '@/adapters/repositories/note-repository'

export class InMemoryNoteRepository
  extends InMemoryRepository<Note>
  implements NoteRepository
{
  protected entity = Note as unknown as EntityWithStatic<Note>
}
