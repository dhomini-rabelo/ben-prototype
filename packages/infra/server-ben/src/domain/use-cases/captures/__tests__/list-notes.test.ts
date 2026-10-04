import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@/modules/domain/entity/id'

import { InMemoryNoteRepository } from '@/domain/__tests__/repositories/note'
import { NoteFactory } from '@/domain/__tests__/factories/note'
import { ListNotesUseCase } from '@/domain/use-cases/captures/list-notes'

let noteRepository: InMemoryNoteRepository
let noteFactory: NoteFactory
let sut: ListNotesUseCase

describe('ListNotesUseCase', () => {
  beforeEach(() => {
    noteRepository = new InMemoryNoteRepository()
    noteFactory = new NoteFactory(noteRepository)
    sut = new ListNotesUseCase(noteRepository)
  })

  describe('successful', () => {
    it('lists the user notes newest first', async () => {
      const userId = createID()
      const oldest = await noteFactory.create({
        userId,
        createdAt: new Date('2026-01-01T10:00:00Z'),
      })
      const newest = await noteFactory.create({
        userId,
        createdAt: new Date('2026-03-01T10:00:00Z'),
      })
      const middle = await noteFactory.create({
        userId,
        createdAt: new Date('2026-02-01T10:00:00Z'),
      })

      const { items } = await sut.execute({ userId: userId.toValue() })

      expect(items.map((item) => item.id.toValue())).toEqual([
        newest.id.toValue(),
        middle.id.toValue(),
        oldest.id.toValue(),
      ])
    })

    it('does not list notes of other users', async () => {
      const userId = createID()
      const note = await noteFactory.create({ userId })
      await noteFactory.create({ userId: createID() })

      const { items } = await sut.execute({ userId: userId.toValue() })

      expect(items.map((item) => item.id.toValue())).toEqual([
        note.id.toValue(),
      ])
    })

    it('returns an empty list when the user has no notes', async () => {
      await noteFactory.create({ userId: createID() })

      const { items } = await sut.execute({ userId: createID().toValue() })

      expect(items).toEqual([])
    })
  })
})
