import { Repository } from '@ben/domain-base'

import { Note } from '@/domain/entities/note'

export abstract class NoteRepository extends Repository<Note> {}
