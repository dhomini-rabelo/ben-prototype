import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Note } from '@ben/domain-chat/enterprise/entities/note'
import { NoteRepository } from '@ben/domain-chat/application/repositories/note'

export class InMemoryNoteRepository
  extends InMemoryRepository<Note>
  implements NoteRepository
{
  protected entity = Note as unknown as EntityWithStatic<Note>
}
