import { beforeEach, describe, expect, it } from 'vitest'

import { createID, ValidationError } from '@ben/domain-base'

import { InMemoryReminderRepository } from '@ben/domain-chat/application/__tests__/repositories/reminder'
import { ReminderFactory } from '@ben/domain-chat/application/__tests__/factories/reminder'
import { AcknowledgeReminderUseCase } from '@ben/domain-chat/application/use-cases/reminders/acknowledge-reminder'

let reminderRepository: InMemoryReminderRepository
let reminderFactory: ReminderFactory
let sut: AcknowledgeReminderUseCase

const createdAt = new Date('2026-10-20T10:00:00Z')

describe('AcknowledgeReminderUseCase', () => {
  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository()
    reminderFactory = new ReminderFactory(reminderRepository)
    sut = new AcknowledgeReminderUseCase(reminderRepository)
  })

  it('acknowledges with snooze and moves nextFireAt to the snooze', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({
      userId,
      createdAt,
      remindAt: '2026-10-22T17:00:00Z',
      alerts: [{ kind: 'minutes-before', minutes: 60 }],
    })
    const firedAt = new Date('2026-10-22T16:00:00Z')
    const snoozeUntil = new Date('2026-10-22T16:30:00Z')

    const { item } = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      firedAt,
      snoozeUntil,
    })

    expect(item.props.acknowledgedUntil).toEqual(firedAt)
    expect(item.props.snoozedUntil).toEqual(snoozeUntil)
    expect(item.props.nextFireAt).toEqual(snoozeUntil)
  })

  it('keeps the later acknowledgedUntil', async () => {
    const userId = createID()
    const later = new Date('2026-10-22T18:00:00Z')
    const alarm = await reminderFactory.create({
      userId,
      createdAt,
      acknowledgedUntil: later,
    })

    const { item } = await sut.execute({
      userId: userId.toValue(),
      reminderId: alarm.id.toValue(),
      morningTime: '08:00',
      firedAt: new Date('2026-10-22T16:00:00Z'),
    })

    expect(item.props.acknowledgedUntil).toEqual(later)
  })

  it('rejects snooze not after firedAt', async () => {
    const userId = createID()
    const alarm = await reminderFactory.create({ userId, createdAt })
    const firedAt = new Date('2026-10-22T16:00:00Z')

    await expect(
      sut.execute({
        userId: userId.toValue(),
        reminderId: alarm.id.toValue(),
        morningTime: '08:00',
        firedAt,
        snoozeUntil: firedAt,
      }),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('schedules a weekly conditional "not yet" 7 days later at morningTime', async () => {
    const userId = createID()
    const conditional = await reminderFactory.create({
      userId,
      createdAt,
      kind: 'conditional',
      checkFrequency: { type: 'weekly' },
      snoozedUntil: new Date('2026-10-21T20:00:00Z'),
    })

    const { item } = await sut.execute({
      userId: userId.toValue(),
      reminderId: conditional.id.toValue(),
      morningTime: '08:00',
      firedAt: new Date('2026-10-21T08:00:00Z'),
    })

    expect(item.props.snoozedUntil).toBeNull()
    expect(item.props.nextFireAt).toEqual(new Date('2026-10-28T08:00:00Z'))
  })
})
