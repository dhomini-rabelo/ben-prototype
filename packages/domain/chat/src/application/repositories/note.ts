import { Repository } from '@ben/domain-base'

import { Note } from '@ben/domain-chat/enterprise/entities/note'

export abstract class NoteRepository extends Repository<Note> {}
