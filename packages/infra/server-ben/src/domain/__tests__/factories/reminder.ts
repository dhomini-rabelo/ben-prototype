import { createID } from '@ben/domain-base'
import { Factory, some } from '@/modules/tests'

import { Reminder, ReminderProps } from '@/domain/entities/reminder'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'

export function createReminderData(
  data: Partial<ReminderProps> = {},
): ReminderProps {
  return {
    userId: data.userId !== undefined ? data.userId : createID(),
    title: data.title !== undefined ? data.title : some.text(),
    remindAt: data.remindAt !== undefined ? data.remindAt : null,
    notes: data.notes !== undefined ? data.notes : null,
    createdAt: data.createdAt !== undefined ? data.createdAt : new Date(),
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
