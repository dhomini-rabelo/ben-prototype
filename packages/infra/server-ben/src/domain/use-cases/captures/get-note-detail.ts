import { NoteRepository } from '@/adapters/repositories/note-repository'
import { Note } from '@/domain/entities/note'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

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
