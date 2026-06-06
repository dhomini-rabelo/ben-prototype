import { NoteRepository } from '@/adapters/repositories/note-repository'
import { Note } from '@/domain/entities/note'
import { createID } from '@/modules/domain/entity/id'
import { ItemResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
  noteId: string
}

export class GetNoteDetailUseCase implements UseCase<ItemResponse<Note>> {
  constructor(private noteRepository: NoteRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Note>> {
    const item = await this.noteRepository.get({
      id: createID(payload.noteId),
      userId: createID(payload.userId),
    })

    return { item }
  }
}
