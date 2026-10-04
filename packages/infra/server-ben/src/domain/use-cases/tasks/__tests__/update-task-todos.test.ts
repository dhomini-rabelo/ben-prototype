import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DangerErrors, DomainError } from '@ben/domain-base'
import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@ben/modules-tests'

import { TodoItem } from '@/domain/entities/task'
import { TaskFactory } from '@/domain/__tests__/factories/task'
import { InMemoryTaskRepository } from '@/domain/__tests__/repositories/task'
import { UpdateTaskTodosUseCase } from '../update-task-todos'

const newTodoItems: TodoItem[] = [
  { id: 'a', title: 'First', done: true, order: 0 },
  { id: 'b', title: 'Second', done: false, order: 1 },
]

describe('UpdateTaskTodosUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let sut: UpdateTaskTodosUseCase

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    sut = new UpdateTaskTodosUseCase(taskRepository)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful', () => {
    it('updates the todo items, clears the pending diff and sets status active', async () => {
      const now = new Date('2026-02-03T10:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'todo',
        textContent: null,
        todoItems: [{ id: 'old', title: 'Old', done: false, order: 0 }],
        status: 'created',
        pendingDiff: {
          turnId: some.uuid(),
          proposedBy: 'ben',
          changes: {
            contentType: 'todo',
            items: [
              { id: 'x', title: 'X', done: false, order: 0, diff: 'added' },
            ],
          },
          createdAt: new Date(),
        },
      })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        todoItems: newTodoItems,
      })

      expect(item.props.todoItems).toEqual(newTodoItems)
      expect(item.props.pendingDiff).toBeNull()
      expect(item.props.status).toBe('active')
      expect(item.props.lastActivityAt).toEqual(now)
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.todoItems).toEqual(newTodoItems)
    })
  })

  describe('validation', () => {
    it('rejects a text task', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'text',
        textContent: 'some text',
        todoItems: null,
        status: 'created',
      })

      const error = await expectError(
        () =>
          sut
            .execute({
              userId: userId.toValue(),
              taskId: task.id.toValue(),
              todoItems: newTodoItems,
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
              todoItems: newTodoItems,
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })

    it('rejects a task that belongs to another user', async () => {
      const task = await taskFactory.create({
        contentType: 'todo',
        textContent: null,
        todoItems: [],
      })

      await expectError(
        () =>
          sut
            .execute({
              userId: some.uuid(),
              taskId: task.id.toValue(),
              todoItems: newTodoItems,
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.todoItems).toEqual([])
    })
  })
})
