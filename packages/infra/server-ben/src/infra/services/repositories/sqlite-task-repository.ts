import { EntityWithStatic } from '@ben/domain-base'

import { Task } from '@/domain/entities/task'
import { TaskRepository } from '@/adapters/repositories/task-repository'

import { SqliteRepository } from './sqlite-repository'

export class SqliteTaskRepository
  extends SqliteRepository<Task>
  implements TaskRepository
{
  protected entity = Task as unknown as EntityWithStatic<Task>
  protected tableName = 'tasks'
}
