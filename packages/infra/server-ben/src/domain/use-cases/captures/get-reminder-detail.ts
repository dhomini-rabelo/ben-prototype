import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { Reminder } from '@/domain/entities/reminder'
import { createID } from '@ben/domain-base'
import { ItemResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
  reminderId: string
}

export class GetReminderDetailUseCase implements UseCase<
  ItemResponse<Reminder>
> {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(payload: Payload): Promise<ItemResponse<Reminder>> {
    const item = await this.reminderRepository.get({
      id: createID(payload.reminderId),
      userId: createID(payload.userId),
    })

    return { item }
  }
}
