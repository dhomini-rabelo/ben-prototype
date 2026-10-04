import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import { Reminder } from '@ben/domain-chat/enterprise/entities/reminder'
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
