import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@ben/modules-tests'

import { InMemoryTaskRepository } from '@ben/domain-task/application/__tests__/repositories/task'
import { TaskFactory } from '@ben/domain-task/application/__tests__/factories/task'
import { ReopenTaskUseCase } from '@ben/domain-task/application/use-cases/tasks/reopen-task'

describe('ReopenTaskUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let useCase: ReopenTaskUseCase

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-10T12:00:00.000Z'))
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    useCase = new ReopenTaskUseCase(taskRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful', () => {
    it('reopens a finished task: status active, finishedAt null and lastActivityAt now', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        status: 'finished',
        finishedAt: new Date('2026-02-01T00:00:00.000Z'),
        lastActivityAt: new Date('2026-02-01T00:00:00.000Z'),
      })

      const { item } = await useCase.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
      })

      expect(item.id.isEqual(task.id)).toBe(true)
      expect(item.props.status).toBe('active')
      expect(item.props.finishedAt).toBeNull()
      expect(item.props.lastActivityAt).toEqual(
        new Date('2026-05-10T12:00:00.000Z'),
      )

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.status).toBe('active')
      expect(stored.props.finishedAt).toBeNull()
    })
  })

  describe('validation', () => {
    it('rejects an unknown task', async () => {
      await expectError(
        () =>
          useCase
            .execute({ userId: some.uuid(), taskId: some.uuid() })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })

    it('rejects a task that belongs to another user', async () => {
      const finishedAt = new Date('2026-02-01T00:00:00.000Z')
      const task = await taskFactory.create({ status: 'finished', finishedAt })

      await expectError(
        () =>
          useCase
            .execute({ userId: some.uuid(), taskId: task.id.toValue() })
            .then(() => undefined),
        ResourceNotFoundError,
      )

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.status).toBe('finished')
      expect(stored.props.finishedAt).toEqual(finishedAt)
    })
  })
})
