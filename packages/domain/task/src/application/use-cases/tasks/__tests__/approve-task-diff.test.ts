import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DangerErrors, DomainError } from '@ben/domain-base'
import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@ben/modules-tests'

import { PendingDiff } from '@ben/domain-task/enterprise/entities/task'
import { TaskFactory } from '@ben/domain-task/application/__tests__/factories/task'
import { InMemoryTaskRepository } from '@ben/domain-task/application/__tests__/repositories/task'
import { ApproveTaskDiffUseCase } from '../approve-task-diff'

function buildPendingDiff(changes: PendingDiff['changes']): PendingDiff {
  return {
    turnId: some.uuid(),
    proposedBy: 'ben',
    changes,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  }
}

describe('ApproveTaskDiffUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let sut: ApproveTaskDiffUseCase

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    sut = new ApproveTaskDiffUseCase(taskRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful', () => {
    it('applies a text diff: text content becomes after, pending diff cleared, status active', async () => {
      const now = new Date('2026-02-03T10:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'text',
        textContent: 'before text',
        status: 'created',
        pendingDiff: buildPendingDiff({
          contentType: 'text',
          before: 'before text',
          after: 'after text',
        }),
      })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
      })

      expect(item.props.textContent).toBe('after text')
      expect(item.props.pendingDiff).toBeNull()
      expect(item.props.status).toBe('active')
      expect(item.props.lastActivityAt).toEqual(now)

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.textContent).toBe('after text')
      expect(stored.props.pendingDiff).toBeNull()
    })

    it('applies a todo diff dropping removed items and the diff marker', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'todo',
        textContent: null,
        todoItems: [{ id: 'a', title: 'Old', done: false, order: 0 }],
        pendingDiff: buildPendingDiff({
          contentType: 'todo',
          items: [
            { id: 'a', title: 'Kept', done: true, order: 0, diff: 'unchanged' },
            { id: 'b', title: 'Gone', done: false, order: 1, diff: 'removed' },
            { id: 'c', title: 'New', done: false, order: 2, diff: 'added' },
          ],
        }),
      })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
      })

      expect(item.props.todoItems).toEqual([
        { id: 'a', title: 'Kept', done: true, order: 0 },
        { id: 'c', title: 'New', done: false, order: 2 },
      ])
      expect(item.props.pendingDiff).toBeNull()
      expect(item.props.status).toBe('active')
    })
  })

  describe('validation', () => {
    it('rejects when the task has no pending diff', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        status: 'created',
        pendingDiff: null,
        textContent: 'untouched',
      })

      const error = await expectError(
        () =>
          sut
            .execute({ userId: userId.toValue(), taskId: task.id.toValue() })
            .then(() => undefined),
        DomainError,
      )

      expect(error.response.code).toBe('NO_PENDING_DIFF')
      expect(error.response.errorType).toBe(DangerErrors.DATA_INTEGRITY)
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props).toEqual(task.props)
    })

    it('rejects an unknown task', async () => {
      await expectError(
        () =>
          sut
            .execute({ userId: some.uuid(), taskId: some.uuid() })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })

    it('rejects a task that belongs to another user', async () => {
      const task = await taskFactory.create({
        pendingDiff: buildPendingDiff({
          contentType: 'text',
          before: 'a',
          after: 'b',
        }),
      })

      await expectError(
        () =>
          sut
            .execute({ userId: some.uuid(), taskId: task.id.toValue() })
            .then(() => undefined),
        ResourceNotFoundError,
      )
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.pendingDiff).not.toBeNull()
    })
  })
})
