import { beforeEach, describe, expect, it } from 'vitest'

import { createID, ValidationError } from '@ben/domain-base'

import { InMemoryReminderRepository } from '@ben/domain-chat/application/__tests__/repositories/reminder'
import { ReminderFactory } from '@ben/domain-chat/application/__tests__/factories/reminder'
import { GetDailySummaryUseCase } from '@ben/domain-chat/application/use-cases/reminders/get-daily-summary'

let reminderRepository: InMemoryReminderRepository
let reminderFactory: ReminderFactory
let sut: GetDailySummaryUseCase

const createdAt = new Date('2026-10-01T10:00:00Z')

describe('GetDailySummaryUseCase', () => {
  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository()
    reminderFactory = new ReminderFactory(reminderRepository)
    sut = new GetDailySummaryUseCase(reminderRepository)
  })

  it('separates alarms, goals and conditionals of the local date', async () => {
    const userId = createID()
    const base = { userId, createdAt }

    const alarm = await reminderFactory.create({
      ...base,
      remindAt: '2026-10-22T17:00:00Z',
    })
    await reminderFactory.create({ ...base, remindAt: '2026-10-23T17:00:00Z' })
    const goal = await reminderFactory.create({
      ...base,
      kind: 'goal',
      remindAt: '2026-10-05T11:00:00Z',
      recurrence: { type: 'weekdays', weekdays: [4] },
    })
    await reminderFactory.create({
      ...base,
      kind: 'goal',
      remindAt: '2026-10-05T11:00:00Z',
      recurrence: { type: 'weekdays', weekdays: [1] },
    })
    const due = await reminderFactory.create({
      ...base,
      kind: 'conditional',
      nextFireAt: new Date('2026-10-22T08:00:00Z'),
    })
    await reminderFactory.create({
      ...base,
      kind: 'conditional',
      nextFireAt: new Date('2026-10-23T08:00:00Z'),
    })

    const result = await sut.execute({
      userId: userId.toValue(),
      date: '2026-10-22',
      timeZone: 'UTC',
    })

    expect(result.alarms.map((item) => item.id)).toEqual([alarm.id])
    expect(result.goals.map((item) => item.id)).toEqual([goal.id])
    expect(result.conditionals.map((item) => item.id)).toEqual([due.id])
  })

  it('ignores done reminders and other users', async () => {
    const userId = createID()
    await reminderFactory.create({
      userId,
      createdAt,
      status: 'done',
      remindAt: '2026-10-22T17:00:00Z',
    })
    await reminderFactory.create({
      createdAt,
      remindAt: '2026-10-22T17:00:00Z',
    })

    const result = await sut.execute({
      userId: userId.toValue(),
      date: '2026-10-22',
      timeZone: 'UTC',
    })

    expect(result).toEqual({ alarms: [], goals: [], conditionals: [] })
  })

  it('rejects an invalid time zone', async () => {
    await expect(
      sut.execute({
        userId: createID().toValue(),
        date: '2026-10-22',
        timeZone: 'Mars/Base',
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
