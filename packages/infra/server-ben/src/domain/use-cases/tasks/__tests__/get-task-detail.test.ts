import { beforeEach, describe, expect, it } from 'vitest'

import { ResourceNotFoundError } from '@ben/domain-base'
import { expectError, some } from '@ben/modules-tests'

import { InMemoryTaskRepository } from '@/domain/__tests__/repositories/task'
import { TaskFactory } from '@/domain/__tests__/factories/task'
import { GetTaskDetailUseCase } from '@/domain/use-cases/tasks/get-task-detail'
import { createID } from '@ben/domain-base'

describe('GetTaskDetailUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let useCase: GetTaskDetailUseCase

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    useCase = new GetTaskDetailUseCase(taskRepository)
  })

  describe('successful', () => {
    it('returns the task of the user', async () => {
      const userId = createID()
      const task = await taskFactory.create({ userId })

      const { item } = await useCase.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
      })

      expect(item.id.isEqual(task.id)).toBe(true)
      expect(item.props).toEqual(task.props)
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
      const task = await taskFactory.create()

      await expectError(
        () =>
          useCase
            .execute({ userId: some.uuid(), taskId: task.id.toValue() })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })
  })
})
