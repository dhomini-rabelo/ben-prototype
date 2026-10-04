import { EntityWithStatic } from '@ben/domain-base'

import { Note } from '@ben/domain-chat/enterprise/entities/note'
import { NoteRepository } from '@ben/domain-chat/application/repositories/note'

import { SqliteRepository } from './sqlite-repository'

export class SqliteNoteRepository
  extends SqliteRepository<Note>
  implements NoteRepository
{
  protected entity = Note as unknown as EntityWithStatic<Note>
  protected tableName = 'notes'
}
