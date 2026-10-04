import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { Reminder } from '@/domain/entities/reminder'
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
