import { Repository } from '@/modules/domain/repository/repository'

import { Note } from '@/domain/entities/note'

export abstract class NoteRepository extends Repository<Note> {}
