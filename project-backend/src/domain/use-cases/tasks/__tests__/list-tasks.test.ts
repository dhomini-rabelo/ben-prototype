import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@/modules/domain/entity/id'

import { InMemoryTaskRepository } from '@/domain/__tests__/repositories/task'
import { TaskFactory } from '@/domain/__tests__/factories/task'
import { ListTasksUseCase } from '@/domain/use-cases/tasks/list-tasks'

describe('ListTasksUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let useCase: ListTasksUseCase

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    useCase = new ListTasksUseCase(taskRepository)
  })

  describe('successful', () => {
    it('lists every non-finished task when the status is active, most recent activity first', async () => {
      const userId = createID()
      const [oldest, newest, middle] = await taskFactory.createMany(
        { userId },
        [
          { status: 'created', lastActivityAt: new Date('2026-01-01') },
          { status: 'active', lastActivityAt: new Date('2026-03-01') },
          { status: 'created', lastActivityAt: new Date('2026-02-01') },
        ],
        3,
      )
      await taskFactory.create({
        userId,
        status: 'finished',
        lastActivityAt: new Date('2026-04-01'),
      })

      const { items } = await useCase.execute({
        userId: userId.toValue(),
        status: 'active',
      })

      expect(items.map((item) => item.id.toValue())).toEqual([
        newest.id.toValue(),
        middle.id.toValue(),
        oldest.id.toValue(),
      ])
    })

    it('lists only finished tasks when the status is finished', async () => {
      const userId = createID()
      const [finished] = await taskFactory.createMany(
        { userId },
        [{ status: 'finished' }, { status: 'active' }, { status: 'created' }],
        3,
      )

      const { items } = await useCase.execute({
        userId: userId.toValue(),
        status: 'finished',
      })

      expect(items).toHaveLength(1)
      expect(items[0].id.isEqual(finished.id)).toBe(true)
    })

    it('does not list tasks of other users', async () => {
      const userId = createID()
      const own = await taskFactory.create({ userId, status: 'active' })
      await taskFactory.create({ status: 'active' })
      await taskFactory.create({ status: 'finished' })

      const { items } = await useCase.execute({
        userId: userId.toValue(),
        status: 'active',
      })

      expect(items).toHaveLength(1)
      expect(items[0].id.isEqual(own.id)).toBe(true)
    })

    it('returns an empty list when the user has no matching tasks', async () => {
      const userId = createID()
      await taskFactory.create({ userId, status: 'active' })

      const { items } = await useCase.execute({
        userId: userId.toValue(),
        status: 'finished',
      })

      expect(items).toEqual([])
    })
  })
})
