import { EntityWithStatic } from '@/modules/domain/entity/entity'

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
