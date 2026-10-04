import { EntityWithStatic } from '@/modules/domain/entity/entity'

import { Reminder } from '@/domain/entities/reminder'
import { ReminderRepository } from '@/adapters/repositories/reminder-repository'

import { SqliteRepository } from './sqlite-repository'

export class SqliteReminderRepository
  extends SqliteRepository<Reminder>
  implements ReminderRepository
{
  protected entity = Reminder as unknown as EntityWithStatic<Reminder>
  protected tableName = 'reminders'
}
