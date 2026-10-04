import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'
import { Reminder } from '@ben/domain-chat/enterprise/entities/reminder'
import { createID } from '@ben/domain-base'
import { ListingResponse } from '@ben/domain-base'
import { UseCase } from '@ben/domain-base'

interface Payload {
  userId: string
}

export class ListRemindersUseCase implements UseCase<
  ListingResponse<Reminder>
> {
  constructor(private reminderRepository: ReminderRepository) {}

  async execute(payload: Payload): Promise<ListingResponse<Reminder>> {
    const items = await this.reminderRepository.findMany(
      { userId: createID(payload.userId) },
      { orderBy: 'createdAt', order: 'desc' },
    )

    return { items }
  }
}
