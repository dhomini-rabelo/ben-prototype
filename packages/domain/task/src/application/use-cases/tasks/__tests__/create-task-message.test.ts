import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createID } from '@ben/domain-base'
import { ResourceNotFoundError } from '@ben/domain-base'
import { FakeAgentService, expectError, some } from '@ben/modules-tests'

import { TaskTurnReply } from '@ben/adapters'
import { PendingDiff } from '@ben/domain-task/enterprise/entities/task'
import { AgentModelSelection } from '@ben/adapters'
import { TaskFactory } from '@ben/domain-task/application/__tests__/factories/task'
import { InMemoryTaskRepository } from '@ben/domain-task/application/__tests__/repositories/task'
import { CreateTaskMessageUseCase } from '../create-task-message'

const model: AgentModelSelection = {
  modelSlug: 'openai/gpt-5.6-luna',
  effort: 'medium',
}

function buildReply(overrides: Partial<TaskTurnReply> = {}): TaskTurnReply {
  return {
    message: 'Ben says hi',
    proposedChanges: null,
    updatedSummary: 'new summary',
    ...overrides,
  }
}

describe('CreateTaskMessageUseCase', () => {
  let taskRepository: InMemoryTaskRepository
  let taskFactory: TaskFactory
  let agentService: FakeAgentService
  let sut: CreateTaskMessageUseCase

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository()
    taskFactory = new TaskFactory(taskRepository)
    agentService = new FakeAgentService()
    sut = new CreateTaskMessageUseCase(taskRepository, agentService)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('successful', () => {
    it('sends the task state, the message and the model to the agent', async () => {
      const userId = createID()
      const todoItems = [{ id: 'a', title: 'Item', done: false, order: 0 }]
      const task = await taskFactory.create({
        userId,
        title: 'My task',
        contentType: 'todo',
        textContent: null,
        todoItems,
        summary: 'old summary',
      })
      agentService.respondWith(buildReply())

      await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        message: 'add milk',
        model,
      })

      expect(agentService.receivedPayloads).toEqual([
        {
          userId: userId.toValue(),
          title: 'My task',
          contentType: 'todo',
          textContent: null,
          todoItems,
          summary: 'old summary',
          message: 'add milk',
          model,
        },
      ])
    })

    it('stores the updated summary, sets status active and clears the pending diff when the reply proposes no changes', async () => {
      const now = new Date('2026-02-03T10:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        status: 'created',
        summary: 'old summary',
        pendingDiff: {
          turnId: some.uuid(),
          proposedBy: 'ben',
          changes: { contentType: 'text', before: 'a', after: 'b' },
          createdAt: new Date(),
        },
      })
      agentService.respondWith(
        buildReply({ proposedChanges: null, updatedSummary: 'fresh summary' }),
      )

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        message: 'hello',
        model,
      })

      expect(item.props.summary).toBe('fresh summary')
      expect(item.props.status).toBe('active')
      expect(item.props.pendingDiff).toBeNull()
      expect(item.props.lastActivityAt).toEqual(now)
      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props.summary).toBe('fresh summary')
      expect(stored.props.pendingDiff).toBeNull()
    })

    it('returns the agent message as benMessage', async () => {
      const userId = createID()
      const task = await taskFactory.create({ userId })
      agentService.respondWith(buildReply({ message: 'the agent answer' }))

      const { benMessage } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        message: 'hello',
        model,
      })

      expect(benMessage).toBe('the agent answer')
    })

    it('builds a text pending diff using the current text as before', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'text',
        textContent: 'current text',
      })
      agentService.respondWith(
        buildReply({
          proposedChanges: { contentType: 'text', after: 'proposed text' },
        }),
      )

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        message: 'rewrite',
        model,
      })

      expect(item.props.pendingDiff?.changes).toEqual({
        contentType: 'text',
        before: 'current text',
        after: 'proposed text',
      })
      expect(item.props.textContent).toBe('current text')
    })

    it('builds a text pending diff with an empty before when the text content is null', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'text',
        textContent: null,
      })
      agentService.respondWith(
        buildReply({
          proposedChanges: { contentType: 'text', after: 'proposed text' },
        }),
      )

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        message: 'write',
        model,
      })

      expect(item.props.pendingDiff?.changes).toEqual({
        contentType: 'text',
        before: '',
        after: 'proposed text',
      })
    })

    it('builds a todo pending diff keeping given item ids and generating ids for items without one', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        contentType: 'todo',
        textContent: null,
        todoItems: [{ id: 'keep', title: 'Keep', done: false, order: 0 }],
      })
      agentService.respondWith(
        buildReply({
          proposedChanges: {
            contentType: 'todo',
            items: [
              {
                id: 'keep',
                title: 'Keep',
                done: true,
                order: 0,
                diff: 'unchanged',
              },
              { title: 'Fresh', done: false, order: 1, diff: 'added' },
            ],
          },
        }),
      )

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        message: 'add fresh',
        model,
      })

      const changes = item.props.pendingDiff?.changes
      if (changes?.contentType !== 'todo') {
        throw new Error('expected a todo diff')
      }
      expect(changes.items).toHaveLength(2)
      expect(changes.items[0]).toEqual({
        id: 'keep',
        title: 'Keep',
        done: true,
        order: 0,
        diff: 'unchanged',
      })
      expect(changes.items[1].id).toEqual(expect.any(String))
      expect(changes.items[1].id.length).toBeGreaterThan(0)
      expect(changes.items[1]).toMatchObject({
        title: 'Fresh',
        done: false,
        order: 1,
        diff: 'added',
      })
    })

    it('marks the pending diff as proposed by ben with a turn id and creation date', async () => {
      const now = new Date('2026-02-03T10:00:00.000Z')
      vi.useFakeTimers()
      vi.setSystemTime(now)
      const userId = createID()
      const task = await taskFactory.create({ userId })
      agentService.respondWith(
        buildReply({
          proposedChanges: { contentType: 'text', after: 'proposed text' },
        }),
      )

      const { item } = await sut.execute({
        userId: userId.toValue(),
        taskId: task.id.toValue(),
        message: 'rewrite',
        model,
      })

      const pendingDiff = item.props.pendingDiff as PendingDiff
      expect(pendingDiff.proposedBy).toBe('ben')
      expect(pendingDiff.turnId).toEqual(expect.any(String))
      expect(pendingDiff.turnId.length).toBeGreaterThan(0)
      expect(pendingDiff.createdAt).toEqual(now)
    })
  })

  describe('validation', () => {
    it('rejects an unknown task and never calls the agent', async () => {
      agentService.respondWith(buildReply())

      await expectError(
        () =>
          sut
            .execute({
              userId: some.uuid(),
              taskId: some.uuid(),
              message: 'hello',
              model,
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )

      expect(agentService.receivedPayloads).toHaveLength(0)
    })

    it('rejects a task that belongs to another user', async () => {
      const task = await taskFactory.create()
      agentService.respondWith(buildReply())

      await expectError(
        () =>
          sut
            .execute({
              userId: some.uuid(),
              taskId: task.id.toValue(),
              message: 'hello',
              model,
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )

      expect(agentService.receivedPayloads).toHaveLength(0)
    })

    it('propagates an agent failure and leaves the task unchanged', async () => {
      const userId = createID()
      const task = await taskFactory.create({
        userId,
        status: 'created',
        summary: 'old summary',
      })
      agentService.failWith(new Error('agent exploded'))

      await expectError(
        () =>
          sut
            .execute({
              userId: userId.toValue(),
              taskId: task.id.toValue(),
              message: 'hello',
              model,
            })
            .then(() => undefined),
        Error,
      )

      const stored = await taskRepository.get({ id: task.id })
      expect(stored.props).toEqual(task.props)
    })
  })
})
