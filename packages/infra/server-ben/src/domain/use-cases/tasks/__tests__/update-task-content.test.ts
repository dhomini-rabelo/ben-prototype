import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DangerErrors, DomainError } from '@ben/domain-base'
import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@ben/modules-tests'

import { TaskFactory } from '@/domain/__tests__/factories/task'
import { InMemoryTaskRepository } from '@/domain/__tests__/repositories/task'
import { UpdateTaskContentUseCase } from '../update-task-content'

describe('UpdateTaskContentUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let sut: UpdateTaskContentUseCase

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    sut = new UpdateTaskContentUseCase(taskRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful', () => {
    it('updates the text content, clears the pending diff and sets status active', async () => {
      const now = new Date('2026-02-03T10:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'text',
        textContent: 'old',
        status: 'created',
        pendingDiff: {
          turnId: some.uuid(),
          proposedBy: 'ben',
          changes: { contentType: 'text', before: 'old', after: 'proposed' },
          createdAt: new Date(),
        },
      })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        textContent: 'new content',
      })

      expect(item.props.textContent).toBe('new content')
      expect(item.props.pendingDiff).toBeNull()
      expect(item.props.status).toBe('active')
      expect(item.props.lastActivityAt).toEqual(now)
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.textContent).toBe('new content')
    })
  })

  describe('validation', () => {
    it('rejects a todo task', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'todo',
        textContent: null,
        todoItems: [{ id: 'a', title: 'Item', done: false, order: 0 }],
        status: 'created',
      })

      const error = await expectError(
        () =>
          sut
            .execute({
              userId: userId.toValue(),
              taskId: task.id.toValue(),
              textContent: 'new content',
            })
            .then(() => undefined),
        DomainError,
      )

      expect(error.response.code).toBe('TASK_CONTENT_TYPE_MISMATCH')
      expect(error.response.errorType).toBe(DangerErrors.DATA_INTEGRITY)
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props).toEqual(task.props)
    })

    it('rejects an unknown task', async () => {
      await expectError(
        () =>
          sut
            .execute({
              userId: some.uuid(),
              taskId: some.uuid(),
              textContent: some.text(),
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })

    it('rejects a task that belongs to another user', async () => {
      const task = await taskFactory.create({
        contentType: 'text',
        textContent: 'old',
      })

      await expectError(
        () =>
          sut
            .execute({
              userId: some.uuid(),
              taskId: task.id.toValue(),
              textContent: 'new content',
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.textContent).toBe('old')
    })
  })
})
