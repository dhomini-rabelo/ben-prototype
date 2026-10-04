import { EntityWithStatic } from '@/modules/domain/entity/entity'

import { Note } from '@/domain/entities/note'
import { NoteRepository } from '@/adapters/repositories/note-repository'

import { SqliteRepository } from './sqlite-repository'

export class SqliteNoteRepository
  extends SqliteRepository<Note>
  implements NoteRepository
{
  protected entity = Note as unknown as EntityWithStatic<Note>
  protected tableName = 'notes'
}
