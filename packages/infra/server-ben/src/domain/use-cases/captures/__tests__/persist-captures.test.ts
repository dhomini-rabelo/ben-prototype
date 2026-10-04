import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryNoteRepository } from '@/domain/__tests__/repositories/note'
import { InMemoryReminderRepository } from '@/domain/__tests__/repositories/reminder'
import { InMemoryTaskRepository } from '@/domain/__tests__/repositories/task'
import { PersistCapturesUseCase } from '@/domain/use-cases/captures/persist-captures'

let noteRepository: InMemoryNoteRepository
let reminderRepository: InMemoryReminderRepository
let taskRepository: InMemoryTaskRepository
let sut: PersistCapturesUseCase

const noDrafts = { newReminders: [], newNotes: [], newTasks: [] }

describe('PersistCapturesUseCase', () => {
  beforeEach(() => {
    noteRepository = new InMemoryNoteRepository()
    reminderRepository = new InMemoryReminderRepository()
    taskRepository = new InMemoryTaskRepository()
    sut = new PersistCapturesUseCase(
      noteRepository,
      reminderRepository,
      taskRepository,
    )
  })

  describe('successful', () => {
    it('persists a reminder draft and returns a reminder view whose meta is remindAt', async () => {
      const userId = createID()

      const { items } = await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newReminders: [
          {
            title: 'Call the dentist',
            remindAt: '2026-05-01T09:00:00Z',
            notes: 'Ask about the invoice',
          },
        ],
      })

      const [reminder] = await reminderRepository.findMany({ userId })
      expect(reminder.props.title).toBe('Call the dentist')
      expect(reminder.props.remindAt).toBe('2026-05-01T09:00:00Z')
      expect(reminder.props.notes).toBe('Ask about the invoice')
      expect(items).toEqual([
        {
          kind: 'reminder',
          itemId: reminder.id.toValue(),
          title: 'Call the dentist',
          meta: '2026-05-01T09:00:00Z',
        },
      ])
    })

    it('defaults remindAt and notes to null when the reminder draft omits them', async () => {
      const userId = createID()

      const { items } = await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newReminders: [{ title: 'Water the plants' }],
      })

      const [reminder] = await reminderRepository.findMany({ userId })
      expect(reminder.props.remindAt).toBeNull()
      expect(reminder.props.notes).toBeNull()
      expect(items[0].meta).toBeNull()
    })

    it('persists a text task draft with its text content', async () => {
      const userId = createID()

      const { items } = await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newTasks: [
          {
            title: 'Write report',
            contentType: 'text',
            textContent: 'Draft the quarterly report',
          },
        ],
      })

      const [task] = await taskRepository.findMany({ userId })
      expect(task.props.title).toBe('Write report')
      expect(task.props.contentType).toBe('text')
      expect(task.props.textContent).toBe('Draft the quarterly report')
      expect(task.props.todoItems).toBeNull()
      expect(items).toEqual([
        {
          kind: 'task',
          itemId: task.id.toValue(),
          title: 'Write report',
          meta: null,
        },
      ])
    })

    it('defaults the text content to an empty string when a text task draft omits it', async () => {
      const userId = createID()

      await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newTasks: [{ title: 'Write report', contentType: 'text' }],
      })

      const [task] = await taskRepository.findMany({ userId })
      expect(task.props.textContent).toBe('')
    })

    it('persists a todo task draft with undone, ordered items and generated ids', async () => {
      const userId = createID()

      await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newTasks: [
          {
            title: 'Groceries',
            contentType: 'todo',
            todoItems: ['Milk', 'Eggs', 'Bread'],
          },
        ],
      })

      const [task] = await taskRepository.findMany({ userId })
      const todoItems = task.props.todoItems ?? []
      expect(task.props.contentType).toBe('todo')
      expect(task.props.textContent).toBeNull()
      expect(
        todoItems.map(({ title, done, order }) => ({ title, done, order })),
      ).toEqual([
        { title: 'Milk', done: false, order: 0 },
        { title: 'Eggs', done: false, order: 1 },
        { title: 'Bread', done: false, order: 2 },
      ])
      const generatedIds = todoItems.map((todoItem) => todoItem.id)
      expect(generatedIds.every((id) => id.length > 0)).toBe(true)
      expect(new Set(generatedIds).size).toBe(3)
    })

    it('defaults the todo items to an empty list when a todo task draft omits them', async () => {
      const userId = createID()

      await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newTasks: [{ title: 'Groceries', contentType: 'todo' }],
      })

      const [task] = await taskRepository.findMany({ userId })
      expect(task.props.todoItems).toEqual([])
    })

    it('creates tasks with status created, empty summary and null message id, pending diff and finished date', async () => {
      const userId = createID()

      await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newTasks: [{ title: 'Write report', contentType: 'text' }],
      })

      const [task] = await taskRepository.findMany({ userId })
      expect(task.props.status).toBe('created')
      expect(task.props.summary).toBe('')
      expect(task.props.messageId).toBeNull()
      expect(task.props.pendingDiff).toBeNull()
      expect(task.props.finishedAt).toBeNull()
      expect(task.props.lastActivityAt).toBe(task.props.createdAt)
    })

    it('persists a note draft and returns a note view', async () => {
      const userId = createID()

      const { items } = await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
        newNotes: [{ title: 'Idea', body: 'Build a habit tracker' }],
      })

      const [note] = await noteRepository.findMany({ userId })
      expect(note.props.title).toBe('Idea')
      expect(note.props.body).toBe('Build a habit tracker')
      expect(items).toEqual([
        {
          kind: 'note',
          itemId: note.id.toValue(),
          title: 'Idea',
          meta: null,
        },
      ])
    })

    it('returns the views ordered reminders, tasks, notes', async () => {
      const { items } = await sut.execute({
        userId: createID().toValue(),
        newNotes: [{ title: 'Note', body: 'Body' }],
        newTasks: [{ title: 'Task', contentType: 'text' }],
        newReminders: [{ title: 'Reminder' }],
      })

      expect(items.map((item) => item.kind)).toEqual([
        'reminder',
        'task',
        'note',
      ])
    })

    it('persists nothing and returns an empty list when there are no drafts', async () => {
      const userId = createID()

      const { items } = await sut.execute({
        ...noDrafts,
        userId: userId.toValue(),
      })

      expect(items).toEqual([])
      expect(await noteRepository.count({ userId })).toBe(0)
      expect(await reminderRepository.count({ userId })).toBe(0)
      expect(await taskRepository.count({ userId })).toBe(0)
    })
  })
})
