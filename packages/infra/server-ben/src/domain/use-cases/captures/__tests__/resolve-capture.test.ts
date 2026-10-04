import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryNoteRepository } from '@/domain/__tests__/repositories/note'
import { InMemoryReminderRepository } from '@/domain/__tests__/repositories/reminder'
import { InMemoryTaskRepository } from '@ben/domain-task/application/__tests__/repositories/task'
import { NoteFactory } from '@/domain/__tests__/factories/note'
import { ReminderFactory } from '@/domain/__tests__/factories/reminder'
import { TaskFactory } from '@ben/domain-task/application/__tests__/factories/task'
import { ResolveCaptureUseCase } from '@/domain/use-cases/captures/resolve-capture'

let noteRepository: InMemoryNoteRepository
let reminderRepository: InMemoryReminderRepository
let taskRepository: InMemoryTaskRepository
let noteFactory: NoteFactory
let reminderFactory: ReminderFactory
let taskFactory: TaskFactory
let sut: ResolveCaptureUseCase

describe('ResolveCaptureUseCase', () => {
  beforeEach(() => {
    noteRepository = new InMemoryNoteRepository()
    reminderRepository = new InMemoryReminderRepository()
    taskRepository = new InMemoryTaskRepository()
    noteFactory = new NoteFactory(noteRepository)
    reminderFactory = new ReminderFactory(reminderRepository)
    taskFactory = new TaskFactory(taskRepository)
    sut = new ResolveCaptureUseCase(
      noteRepository,
      reminderRepository,
      taskRepository,
    )
  })

  describe('successful', () => {
    it('resolves a reminder capture with remindAt as meta', async () => {
      const reminder = await reminderFactory.create({
        title: 'Call the dentist',
        remindAt: '2026-05-01T09:00:00Z',
      })

      const { item } = await sut.execute({
        capture: { kind: 'reminder', itemId: reminder.id },
      })

      expect(item).toEqual({
        kind: 'reminder',
        itemId: reminder.id.toValue(),
        title: 'Call the dentist',
        meta: '2026-05-01T09:00:00Z',
      })
    })

    it('resolves a reminder capture with null meta when it has no remindAt', async () => {
      const reminder = await reminderFactory.create({ remindAt: null })

      const { item } = await sut.execute({
        capture: { kind: 'reminder', itemId: reminder.id },
      })

      expect(item?.meta).toBeNull()
    })

    it('returns null when the captured reminder no longer exists', async () => {
      const { item } = await sut.execute({
        capture: { kind: 'reminder', itemId: createID() },
      })

      expect(item).toBeNull()
    })

    it('resolves a task capture with null meta', async () => {
      const task = await taskFactory.create({ title: 'Write report' })

      const { item } = await sut.execute({
        capture: { kind: 'task', itemId: task.id },
      })

      expect(item).toEqual({
        kind: 'task',
        itemId: task.id.toValue(),
        title: 'Write report',
        meta: null,
      })
    })

    it('returns null when the captured task no longer exists', async () => {
      const { item } = await sut.execute({
        capture: { kind: 'task', itemId: createID() },
      })

      expect(item).toBeNull()
    })

    it('resolves a note capture with null meta', async () => {
      const note = await noteFactory.create({ title: 'Idea' })

      const { item } = await sut.execute({
        capture: { kind: 'note', itemId: note.id },
      })

      expect(item).toEqual({
        kind: 'note',
        itemId: note.id.toValue(),
        title: 'Idea',
        meta: null,
      })
    })

    it('returns null when the captured note no longer exists', async () => {
      const { item } = await sut.execute({
        capture: { kind: 'note', itemId: createID() },
      })

      expect(item).toBeNull()
    })
  })
})
