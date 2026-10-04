import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import { Note, NoteProps } from '@/domain/entities/note'
import { NoteRepository } from '@/adapters/repositories/note-repository'

export function createNoteData(data: Partial<NoteProps> = {}): NoteProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    title: data.title !== undefined ? data.title : some.text(),
    body: data.body !== undefined ? data.body : some.text(),
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
  }
}

export class NoteFactory implements Factory<Note, NoteProps> {
  constructor(private noteRepository: NoteRepository) {}

  async create(data: Partial<NoteProps> = {}) {
    return this.noteRepository.create(createNoteData(data))
  }

  async createMany(
    commonData: Partial<NoteProps> = {},
    specificData: Partial<NoteProps>[] = [],
    amount: number = 2,
  ) {
    return Promise.all(
      Array.from({ length: amount }).map((_, index) => {
        return this.create({
          ...commonData,
          ...(specificData[index] || {}),
        })
      }),
    )
  }
}
