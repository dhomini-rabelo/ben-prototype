import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@ben/modules-tests'

import { InMemoryTaskRepository } from '@ben/domain-task/application/__tests__/repositories/task'
import { TaskFactory } from '@ben/domain-task/application/__tests__/factories/task'
import { FinishTaskUseCase } from '@ben/domain-task/application/use-cases/tasks/finish-task'

describe('FinishTaskUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let useCase: FinishTaskUseCase

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-10T12:00:00.000Z'))
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    useCase = new FinishTaskUseCase(taskRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful', () => {
    it('marks the task finished and sets finishedAt and lastActivityAt to now', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        status: 'active',
        lastActivityAt: new Date('2026-01-01T00:00:00.000Z'),
      })

      const { item } = await useCase.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
      })

      const now = new Date('2026-05-10T12:00:00.000Z')
      expect(item.id.isEqual(task.id)).toBe(true)
      expect(item.props.status).toBe('finished')
      expect(item.props.finishedAt).toEqual(now)
      expect(item.props.lastActivityAt).toEqual(now)

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.status).toBe('finished')
      expect(stored.props.finishedAt).toEqual(now)
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
      const task = await taskFactory.create({ status: 'active' })

      await expectError(
        () =>
          useCase
            .execute({ userId: some.uuid(), taskId: task.id.toValue() })
            .then(() => undefined),
        ResourceNotFoundError,
      )

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.status).toBe('active')
      expect(stored.props.finishedAt).toBeNull()
    })
  })
})
