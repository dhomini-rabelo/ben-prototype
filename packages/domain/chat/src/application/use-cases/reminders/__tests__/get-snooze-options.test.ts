import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryReminderRepository } from '@ben/domain-chat/application/__tests__/repositories/reminder'
import { ReminderFactory } from '@ben/domain-chat/application/__tests__/factories/reminder'
import { GetSnoozeOptionsUseCase } from '@ben/domain-chat/application/use-cases/reminders/get-snooze-options'

let reminderRepository: InMemoryReminderRepository
let reminderFactory: ReminderFactory
let sut: GetSnoozeOptionsUseCase

describe('GetSnoozeOptionsUseCase', () => {
  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository()
    reminderFactory = new ReminderFactory(reminderRepository)
    sut = new GetSnoozeOptionsUseCase(reminderRepository)
  })

  it('offers only options that fit before the event', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({
      userId,
      remindAt: '2026-10-22T17:00:00Z',
    })

    const { options } = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      now: new Date('2026-10-22T16:40:00Z'),
    })

    expect(options.map((item) => item.option)).toEqual(['10-minutes'])
  })

  it('offers all five options for a goal', async () => {
    const userId = createID()
    const goal = await reminderFactory.create({
      userId,
      kind: 'goal',
      remindAt: '2026-10-22T11:00:00Z',
    })

    const { options } = await sut.execute({
      userId: userId.toValue(),
      reminderId: goal.id.toValue(),
      morningTime: '08:00',
      now: new Date('2026-10-22T11:00:00Z'),
    })

    expect(options).toHaveLength(5)
  })

  it('fails for a reminder of another user', async () => {
    const alarm = await reminderFactory.create()

    await expect(
      sut.execute({
        userId: createID().toValue(),
        reminderId: alarm.id.toValue(),
        morningTime: '08:00',
        now: new Date(),
      }),
    ).rejects.toThrow()
  })
})
