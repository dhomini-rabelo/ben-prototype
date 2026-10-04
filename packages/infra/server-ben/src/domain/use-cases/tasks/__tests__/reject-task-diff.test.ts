import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@/modules/tests'

import { PendingDiff } from '@/domain/entities/task'
import { InMemoryTaskRepository } from '@/domain/__tests__/repositories/task'
import { TaskFactory } from '@/domain/__tests__/factories/task'
import { RejectTaskDiffUseCase } from '@/domain/use-cases/tasks/reject-task-diff'

function buildPendingDiff(): PendingDiff {
  return {
    turnId: some.uuid(),
    proposedBy: 'ben',
    changes: { contentType: 'text', before: 'before', after: 'after' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  }
}

describe('RejectTaskDiffUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let useCase: RejectTaskDiffUseCase

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-10T12:00:00.000Z'))
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    useCase = new RejectTaskDiffUseCase(taskRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful', () => {
    it('clears the pending diff, refreshes lastActivityAt and keeps status and content', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        status: 'active',
        textContent: 'current text',
        pendingDiff: buildPendingDiff(),
        lastActivityAt: new Date('2026-01-01T00:00:00.000Z'),
      })

      const { item } = await useCase.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
      })

      expect(item.props.pendingDiff).toBeNull()
      expect(item.props.lastActivityAt).toEqual(
        new Date('2026-05-10T12:00:00.000Z'),
      )
      expect(item.props.status).toBe('active')
      expect(item.props.textContent).toBe('current text')

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.pendingDiff).toBeNull()
    })

    it('succeeds when the task has no pending diff', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        status: 'active',
        pendingDiff: null,
      })

      const { item } = await useCase.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
      })

      expect(item.props.pendingDiff).toBeNull()
      expect(item.props.status).toBe('active')
      expect(item.props.lastActivityAt).toEqual(
        new Date('2026-05-10T12:00:00.000Z'),
      )
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
      const pendingDiff = buildPendingDiff()
      const task = await taskFactory.create({ pendingDiff })

      await expectError(
        () =>
          useCase
            .execute({ userId: some.uuid(), taskId: task.id.toValue() })
            .then(() => undefined),
        ResourceNotFoundError,
      )

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.pendingDiff).toEqual(pendingDiff)
    })
  })
})
