import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@/modules/domain/entity/id'

import { InMemoryReminderRepository } from '@/domain/__tests__/repositories/reminder'
import { ReminderFactory } from '@/domain/__tests__/factories/reminder'
import { ListRemindersUseCase } from '@/domain/use-cases/captures/list-reminders'

let reminderRepository: InMemoryReminderRepository
let reminderFactory: ReminderFactory
let sut: ListRemindersUseCase

describe('ListRemindersUseCase', () => {
  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository()
    reminderFactory = new ReminderFactory(reminderRepository)
    sut = new ListRemindersUseCase(reminderRepository)
  })

  describe('successful', () => {
    it('lists the user reminders newest first', async () => {
      const userId = createID()
      const oldest = await reminderFactory.create({
        userId,
        createdAt: new Date('2026-01-01T10:00:00Z'),
      })
      const newest = await reminderFactory.create({
        userId,
        createdAt: new Date('2026-03-01T10:00:00Z'),
      })
      const middle = await reminderFactory.create({
        userId,
        createdAt: new Date('2026-02-01T10:00:00Z'),
      })

      const { items } = await sut.execute({ userId: userId.toValue() })

      expect(items.map((item) => item.id.toValue())).toEqual([
        newest.id.toValue(),
        middle.id.toValue(),
        oldest.id.toValue(),
      ])
    })

    it('does not list reminders of other users', async () => {
      const userId = createID()
      const reminder = await reminderFactory.create({ userId })
      await reminderFactory.create({ userId: createID() })

      const { items } = await sut.execute({ userId: userId.toValue() })

      expect(items.map((item) => item.id.toValue())).toEqual([
        reminder.id.toValue(),
      ])
    })

    it('returns an empty list when the user has no reminders', async () => {
      await reminderFactory.create({ userId: createID() })

      const { items } = await sut.execute({ userId: createID().toValue() })

      expect(items).toEqual([])
    })
  })
})
