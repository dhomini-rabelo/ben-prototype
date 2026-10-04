import { EntityWithStatic } from '@ben/domain-base'

import { Task } from '@ben/domain-task/enterprise/entities/task'
import { TaskRepository } from '@ben/domain-task/application/repositories/task'

import { SqliteRepository } from '@ben/infra-db/repos/sqlite/sqlite-repository'

export class SqliteTaskRepository
  extends SqliteRepository<Task>
  implements TaskRepository
{
  protected entity = Task as unknown as EntityWithStatic<Task>
  protected tableName = 'tasks'
}
