import type { SnoozeOption } from '@ben/adapters'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import { listSnoozeOptions } from '@ben/domain-chat/application/utils/reminders'
import { createID, UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  reminderId: string
  morningTime: string
  now: Date
}

interface Response {
  options: { option: SnoozeOption; at: Date }[]
}

export class GetSnoozeOptionsUseCase implements UseCase<Response> {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(payload: Payload): Promise<Response> {
    const reminder = await this.reminderRepository.get({
      id: createID(payload.reminderId),
      userId: createID(payload.userId),
    })

    const options = listSnoozeOptions({
      reminderProps: reminder.props,
      now: payload.now,
      morningTime: payload.morningTime,
    })
    return { options }
  }
}
