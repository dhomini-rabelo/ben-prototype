import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Reminder } from '@/domain/entities/reminder'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'

export class InMemoryReminderRepository
  extends InMemoryRepository<Reminder>
  implements ReminderRepository
{
  protected entity = Reminder as unknown as EntityWithStatic<Reminder>
}
