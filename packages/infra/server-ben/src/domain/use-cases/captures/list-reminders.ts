import { ReminderRepository } from '@/adapters/repositories/reminder-repository'
import { Reminder } from '@/domain/entities/reminder'
import { createID } from '@/modules/domain/entity/id'
import { ListingResponse } from '@/modules/domain/responses'
import { UseCase } from '@/modules/domain/use-case'

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
