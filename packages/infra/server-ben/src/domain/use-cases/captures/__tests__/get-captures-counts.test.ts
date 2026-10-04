import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryNoteRepository } from '@/domain/__tests__/repositories/note'
import { InMemoryReminderRepository } from '@/domain/__tests__/repositories/reminder'
import { InMemoryTaskRepository } from '@ben/domain-task/application/__tests__/repositories/task'
import { NoteFactory } from '@/domain/__tests__/factories/note'
import { ReminderFactory } from '@/domain/__tests__/factories/reminder'
import { TaskFactory } from '@ben/domain-task/application/__tests__/factories/task'
import { GetCapturesCountsUseCase } from '@/domain/use-cases/captures/get-captures-counts'

let noteRepository: InMemoryNoteRepository
let reminderRepository: InMemoryReminderRepository
let taskRepository: InMemoryTaskRepository
let noteFactory: NoteFactory
let reminderFactory: ReminderFactory
let taskFactory: TaskFactory
let sut: GetCapturesCountsUseCase

describe('GetCapturesCountsUseCase', () => {
  beforeEach(() => {
    noteRepository = new InMemoryNoteRepository()
    reminderRepository = new InMemoryReminderRepository()
    taskRepository = new InMemoryTaskRepository()
    noteFactory = new NoteFactory(noteRepository)
    reminderFactory = new ReminderFactory(reminderRepository)
    taskFactory = new TaskFactory(taskRepository)
    sut = new GetCapturesCountsUseCase(
      noteRepository,
      reminderRepository,
      taskRepository,
    )
  })

  describe('successful', () => {
    it('counts active tasks, notes and reminders of the user', async () => {
      const userId = createID()
      await taskFactory.createMany({ userId }, [
        { status: 'created' },
        { status: 'active' },
      ])
      await noteFactory.createMany({ userId }, [], 3)
      await reminderFactory.createMany({ userId }, [], 4)

      const { item } = await sut.execute({ userId: userId.toValue() })

      expect(item).toEqual({
        tasks: { active: 2 },
        notes: { total: 3 },
        reminders: { total: 4 },
      })
    })

    it('does not count finished tasks as active', async () => {
      const userId = createID()
      await taskFactory.createMany(
        { userId },
        [{ status: 'created' }, { status: 'active' }, { status: 'finished' }],
        3,
      )

      const { item } = await sut.execute({ userId: userId.toValue() })

      expect(item.tasks.active).toBe(2)
    })

    it('does not count captures of other users', async () => {
      const userId = createID()
      const otherUserId = createID()
      await taskFactory.create({ userId, status: 'active' })
      await noteFactory.create({ userId })
      await reminderFactory.create({ userId })
      await taskFactory.createMany({ userId: otherUserId, status: 'active' })
      await noteFactory.createMany({ userId: otherUserId })
      await reminderFactory.createMany({ userId: otherUserId })

      const { item } = await sut.execute({ userId: userId.toValue() })

      expect(item).toEqual({
        tasks: { active: 1 },
        notes: { total: 1 },
        reminders: { total: 1 },
      })
    })

    it('returns zero for every count when the user has no captures', async () => {
      await taskFactory.create({ userId: createID() })
      await noteFactory.create({ userId: createID() })
      await reminderFactory.create({ userId: createID() })

      const { item } = await sut.execute({ userId: createID().toValue() })

      expect(item).toEqual({
        tasks: { active: 0 },
        notes: { total: 0 },
        reminders: { total: 0 },
      })
    })
  })
})
