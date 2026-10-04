import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError } from '@/modules/tests'

import { InMemoryNoteRepository } from '@/domain/__tests__/repositories/note'
import { NoteFactory } from '@/domain/__tests__/factories/note'
import { GetNoteDetailUseCase } from '@/domain/use-cases/captures/get-note-detail'

let noteRepository: InMemoryNoteRepository
let noteFactory: NoteFactory
let sut: GetNoteDetailUseCase

describe('GetNoteDetailUseCase', () => {
  beforeEach(() => {
    noteRepository = new InMemoryNoteRepository()
    noteFactory = new NoteFactory(noteRepository)
    sut = new GetNoteDetailUseCase(noteRepository)
  })

  describe('successful', () => {
    it('returns the note of the user', async () => {
      const userId = createID()
      const note = await noteFactory.create({ userId })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        noteId: note.id.toValue(),
      })

      expect(item.id.isEqual(note.id)).toBe(true)
      expect(item.props.title).toBe(note.props.title)
      expect(item.props.body).toBe(note.props.body)
    })
  })

  describe('validation', () => {
    it('rejects an unknown note', async () => {
      const userId = createID()

      await expectError(
        () =>
          sut
            .execute({ userId: userId.toValue(), noteId: createID().toValue() })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })

    it('rejects a note that belongs to another user', async () => {
      const note = await noteFactory.create({ userId: createID() })

      await expectError(
        () =>
          sut
            .execute({
              userId: createID().toValue(),
              noteId: note.id.toValue(),
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })
  })
})
