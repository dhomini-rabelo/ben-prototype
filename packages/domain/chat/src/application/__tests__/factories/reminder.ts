import { createID } from '@ben/domain-base'
import { Factory, some } from '@ben/modules-tests'

import {
  Reminder,
  ReminderProps,
} from '@ben/domain-chat/enterprise/entities/reminder'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'

export function createReminderData(
  data: Partial<ReminderProps> = {},
): ReminderProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    title: data.title !== undefined ? data.title : some.text(),
    remindAt: data.remindAt !== undefined ? data.remindAt : null,
    notes: data.notes !== undefined ? data.notes : null,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
    kind: data.kind ?? 'alarm',
    status: data.status ?? 'active',
    timeZone: data.timeZone ?? 'UTC',
    alerts: data.alerts ?? [{ kind: 'at-event' }],
    recurrence: data.recurrence !== undefined ? data.recurrence : null,
    messages: data.messages ?? [],
    checkFrequency:
      data.checkFrequency !== undefined ? data.checkFrequency : null,
    acknowledgedUntil:
      data.acknowledgedUntil !== undefined ? data.acknowledgedUntil : null,
    snoozedUntil: data.snoozedUntil !== undefined ? data.snoozedUntil : null,
    nextFireAt: data.nextFireAt !== undefined ? data.nextFireAt : null,
    completedAt: data.completedAt !== undefined ? data.completedAt : null,
  }
}

export class ReminderFactory implements Factory<Reminder, ReminderProps> {
  constructor(private reminderRepository: ReminderRepository) {}

  async create(data: Partial<ReminderProps> = {}) {
    return this.reminderRepository.create(createReminderData(data))
  }

  async createMany(
    commonData: Partial<ReminderProps> = {},
    specificData: Partial<ReminderProps>[] = [],
    amount: number = 2,
  ) {
    return Promise.all(
      Array.from({ length: amount }).map((_, index) => {
        return this.create({
          ...commonData,
          ...(specificData[index] || {}),
        })
      }),
    )
  }
}
