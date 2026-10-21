import { beforeEach, describe, expect, it } from 'vitest'

import { createID, ValidationError } from '@ben/domain-base'

import { InMemoryReminderRepository } from '@ben/domain-chat/application/__tests__/repositories/reminder'
import { ReminderFactory } from '@ben/domain-chat/application/__tests__/factories/reminder'
import { UpdateReminderUseCase } from '@ben/domain-chat/application/use-cases/reminders/update-reminder'

let reminderRepository: InMemoryReminderRepository
let reminderFactory: ReminderFactory
let sut: UpdateReminderUseCase

const createdAt = new Date('2026-10-20T10:00:00Z')

describe('UpdateReminderUseCase', () => {
  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository()
    reminderFactory = new ReminderFactory(reminderRepository)
    sut = new UpdateReminderUseCase(reminderRepository)
  })

  it('marks done, stores completedAt and clears nextFireAt', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({
      userId,
      createdAt,
      remindAt: '2026-10-22T17:00:00Z',
      nextFireAt: new Date('2026-10-22T17:00:00Z'),
    })
    const now = new Date('2026-10-21T12:00:00Z')

    const { item } = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      status: 'done',
      now,
    })

    expect(item.props.status).toBe('done')
    expect(item.props.completedAt).toEqual(now)
    expect(item.props.nextFireAt).toBeNull()
  })

  it('recomputes nextFireAt and clears snooze when alerts change', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({
      userId,
      createdAt,
      remindAt: '2026-10-22T17:00:00Z',
      alerts: [{ kind: 'at-event' }],
      snoozedUntil: new Date('2026-10-21T09:00:00Z'),
    })

    const { item } = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      alerts: [{ kind: 'minutes-before', minutes: 60 }],
    })

    expect(item.props.snoozedUntil).toBeNull()
    expect(item.props.nextFireAt).toEqual(new Date('2026-10-22T16:00:00Z'))
  })

  it('does not schedule an alert in the past when the schedule changes after it', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({
      userId,
      createdAt,
      remindAt: '2026-10-21T18:00:00Z',
      alerts: [{ kind: 'at-event' }],
    })

    const withoutNow = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      alerts: [{ kind: 'minutes-before', minutes: 60 }],
    })
    expect(withoutNow.item.props.nextFireAt).toEqual(
      new Date('2026-10-21T17:00:00Z'),
    )

    const withNow = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      alerts: [{ kind: 'minutes-before', minutes: 60 }, { kind: 'at-event' }],
      now: new Date('2026-10-21T17:30:00Z'),
    })
    expect(withNow.item.props.nextFireAt).toEqual(
      new Date('2026-10-21T18:00:00Z'),
    )
  })

  it('reactivates a done reminder and recomputes', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({
      userId,
      createdAt,
      status: 'done',
      completedAt: new Date('2026-10-21T00:00:00Z'),
      remindAt: '2026-10-22T17:00:00Z',
    })

    const { item } = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      status: 'active',
    })

    expect(item.props.completedAt).toBeNull()
    expect(item.props.nextFireAt).toEqual(new Date('2026-10-22T17:00:00Z'))
  })

  it('rejects recurrence on an alarm', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({ userId, kind: 'alarm' })

    await expect(
      sut.execute({
        userId: userId.toValue(),
        reminderId: alarm.id.toValue(),
        morningTime: '08:00',
        recurrence: { type: 'daily' },
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects checkFrequency on a goal and remindAt on a conditional', async () => {
    const userId = createID()
    const goal = await reminderFactory.create({ userId, kind: 'goal' })
    const conditional = await reminderFactory.create({
      userId,
      kind: 'conditional',
    })

    await expect(
      sut.execute({
        userId: userId.toValue(),
        reminderId: goal.id.toValue(),
        morningTime: '08:00',
        checkFrequency: { type: 'weekly' },
      }),
    ).rejects.toBeInstanceOf(ValidationError)
    await expect(
      sut.execute({
        userId: userId.toValue(),
        reminderId: conditional.id.toValue(),
        morningTime: '08:00',
        remindAt: '2026-10-22T17:00:00Z',
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('does not touch reminders of another user', async () => {
    const alarm = await reminderFactory.create()

    await expect(
      sut.execute({
        userId: createID().toValue(),
        reminderId: alarm.id.toValue(),
        morningTime: '08:00',
        title: 'x',
      }),
    ).rejects.toThrow()
  })
})
