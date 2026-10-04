import { EntityWithStatic } from '@ben/domain-base'
import { InMemoryRepository } from '@ben/domain-base'

import { Reminder } from '@ben/domain-chat/enterprise/entities/reminder'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'

export class InMemoryReminderRepository
  extends InMemoryRepository<Reminder>
  implements ReminderRepository
{
  protected entity = Reminder as unknown as EntityWithStatic<Reminder>
}
