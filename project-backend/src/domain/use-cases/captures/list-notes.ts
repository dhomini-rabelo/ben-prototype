import { NoteRepository } from '@/adapters/repositories/note-repository'
import { Note } from '@/domain/entities/note'
import { createID } from '@/modules/domain/entity/id'
import { ListingResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

interface Payload {
  userId: string
}

export class ListNotesUseCase implements UseCase<ListingResponse<Note>> {
  constructor(private noteRepository: NoteRepository) {}

  async execute(payload: Payload): Promise<ListingResponse<Note>> {
    const items = await this.noteRepository.findMany(
      { userId: createID(payload.userId) },
      { orderBy: 'createdAt', order: 'desc' },
    )

    return { items }
  }
}
