import { EntityWithStatic } from '@ben/domain-base'

import { Reminder } from '@ben/domain-chat/enterprise/entities/reminder'
import { ReminderRepository } from '@ben/domain-chat/application/repositories/reminder'

import { SqliteRepository } from '@ben/infra-db/repos/sqlite/sqlite-repository'

export class SqliteReminderRepository
  extends SqliteRepository<Reminder>
  implements ReminderRepository
{
  protected entity = Reminder as unknown as EntityWithStatic<Reminder>
  protected tableName = 'reminders'
}
