import { beforeEach, describe, expect, it } from 'vitest'

import { createID } from '@ben/domain-base'

import { InMemoryReminderRepository } from '@ben/domain-chat/application/__tests__/repositories/reminder'
import { ReminderFactory } from '@ben/domain-chat/application/__tests__/factories/reminder'
import { AppendGoalMessagesUseCase } from '@ben/domain-chat/application/use-cases/reminders/append-goal-messages'

let reminderRepository: InMemoryReminderRepository
let reminderFactory: ReminderFactory
let sut: AppendGoalMessagesUseCase

describe('AppendGoalMessagesUseCase', () => {
  beforeEach(() => {
    reminderRepository = new InMemoryReminderRepository()
    reminderFactory = new ReminderFactory(reminderRepository)
    sut = new AppendGoalMessagesUseCase(reminderRepository)
  })

  describe('successful', () => {
    it('appends new messages after the existing ones', async () => {
      const userId = createID()
      const goal = await reminderFactory.create({
        userId,
        kind: 'goal',
        messages: ['Keep going'],
      })

      await sut.execute({
        userId: userId.toValue(),
        updates: [{ goalId: goal.id.toValue(), messages: ['No excuses'] }],
      })

      const updated = await reminderRepository.get({ id: goal.id })
      expect(updated.props.messages).toEqual(['Keep going', 'No excuses'])
    })

    it('dedupes by trimmed text', async () => {
      const userId = createID()
      const goal = await reminderFactory.create({
        userId,
        kind: 'goal',
        messages: ['Keep going'],
      })

      await sut.execute({
        userId: userId.toValue(),
        updates: [
          {
            goalId: goal.id.toValue(),
            messages: ['  Keep going ', 'New one', 'New one', '   '],
          },
        ],
      })

      const updated = await reminderRepository.get({ id: goal.id })
      expect(updated.props.messages).toEqual(['Keep going', 'New one'])
    })

    it('ignores unknown goal ids', async () => {
      const userId = createID()
      const goal = await reminderFactory.create({ userId, kind: 'goal' })

      await sut.execute({
        userId: userId.toValue(),
        updates: [{ goalId: createID().toValue(), messages: ['Lost'] }],
      })

      const unchanged = await reminderRepository.get({ id: goal.id })
      expect(unchanged.props.messages).toEqual([])
    })

    it('ignores goals of other users', async () => {
      const goal = await reminderFactory.create({
        userId: createID(),
        kind: 'goal',
      })

      await sut.execute({
        userId: createID().toValue(),
        updates: [{ goalId: goal.id.toValue(), messages: ['Intruder'] }],
      })

      const unchanged = await reminderRepository.get({ id: goal.id })
      expect(unchanged.props.messages).toEqual([])
    })

    it('ignores reminders that are not goals', async () => {
      const userId = createID()
      const alarm = await reminderFactory.create({ userId, kind: 'alarm' })

      await sut.execute({
        userId: userId.toValue(),
        updates: [{ goalId: alarm.id.toValue(), messages: ['Nope'] }],
      })

      const unchanged = await reminderRepository.get({ id: alarm.id })
      expect(unchanged.props.messages).toEqual([])
    })
  })
})
