import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@/modules/domain/entity/id'
import { ResourceNotFoundError } from '@/modules/domain/repository/repository-errors'
import { expectError } from '@/modules/tests'

import { InMemoryReminderRepository } from '@/domain/__tests__/repositories/reminder'
import { ReminderFactory } from '@/domain/__tests__/factories/reminder'
import { GetReminderDetailUseCase } from '@/domain/use-cases/captures/get-reminder-detail'

let reminderRepository: InMemoryReminderRepository
let reminderFactory: ReminderFactory
let sut: GetReminderDetailUseCase

describe('GetReminderDetailUseCase', () => {
  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository()
    reminderFactory = new ReminderFactory(reminderRepository)
    sut = new GetReminderDetailUseCase(reminderRepository)
  })

  describe('successful', () => {
    it('returns the reminder of the user', async () => {
      const userId = createID()
      const reminder = await reminderFactory.create({ userId })

      const { item } = await sut.execute({
        userId: userId.toValue(),
        reminderId: reminder.id.toValue(),
      })

      expect(item.id.isEqual(reminder.id)).toBe(true)
      expect(item.props.title).toBe(reminder.props.title)
    })
  })

  describe('validation', () => {
    it('rejects an unknown reminder', async () => {
      const userId = createID()

      await expectError(
        () =>
          sut
            .execute({
              userId: userId.toValue(),
              reminderId: createID().toValue(),
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })

    it('rejects a reminder that belongs to another user', async () => {
      const reminder = await reminderFactory.create({ userId: createID() })

      await expectError(
        () =>
          sut
            .execute({
              userId: createID().toValue(),
              reminderId: reminder.id.toValue(),
            })
            .then(() => undefined),
        ResourceNotFoundError,
      )
    })
  })
})
