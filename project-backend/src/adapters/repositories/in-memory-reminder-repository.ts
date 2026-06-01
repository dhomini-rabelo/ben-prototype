import { EntityWithStatic } from '@/modules/domain/entity/entity'
import { InMemoryRepository } from '@/modules/domain/repository/repository'

import { Reminder } from '@/domain/entities/reminder'
import { ReminderRepository } from './reminder-repository'

export class InMemoryReminderRepository
  extends InMemoryRepository<Reminder>
  implements ReminderRepository
{
  protected entity = Reminder as unknown as EntityWithStatic<Reminder>
}
